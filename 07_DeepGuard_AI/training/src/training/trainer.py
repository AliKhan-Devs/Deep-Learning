import os
import time
from typing import Dict, Any, Tuple, Optional
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from tqdm import tqdm
from sklearn.metrics import roc_auc_score, accuracy_score, f1_score

from .early_stopping import EarlyStopping
from .lr_scheduler import build_lr_scheduler
try:
    from ..utils.export import export_model_checkpoint
except (ImportError, ValueError):
    from utils.export import export_model_checkpoint


class DeepfakeTrainer:
    """
    Complete model trainer for DeepGuard AI.
    Features:
    - AdamW optimizer with decoupled weight decay
    - Automatic Mixed Precision (AMP)
    - Gradient norm clipping
    - Validation ROC-AUC & F1 tracking
    - Early stopping
    - Checkpoint checkpointing
    """

    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        val_loader: DataLoader,
        config_dict: Dict[str, Any],
        device: torch.device,
        output_dir: str,
        lr: float = 1e-4,
        weight_decay: float = 1e-4,
        epochs: int = 15,
        use_amp: bool = True,
        grad_clip_norm: float = 1.0,
        patience: int = 4,
    ):
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.config_dict = config_dict
        self.device = device
        self.output_dir = output_dir
        self.epochs = epochs
        self.use_amp = use_amp and torch.cuda.is_available()
        self.grad_clip_norm = grad_clip_norm

        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = torch.optim.AdamW(
            self.model.parameters(),
            lr=lr,
            weight_decay=weight_decay
        )
        self.scheduler = build_lr_scheduler(self.optimizer, epochs=epochs)
        self.early_stopping = EarlyStopping(patience=patience, mode="max")
        self.scaler = torch.amp.GradScaler("cuda", enabled=self.use_amp)

        self.history: Dict[str, list] = {
            "train_loss": [],
            "val_loss": [],
            "train_acc": [],
            "val_acc": [],
            "val_roc_auc": [],
            "val_f1": [],
            "lr": [],
        }

    def train_epoch(self) -> Tuple[float, float]:
        """Runs one full training epoch."""
        self.model.train()
        total_loss = 0.0
        correct = 0
        total_samples = 0

        pbar = tqdm(self.train_loader, desc="Training Batch", leave=False)
        for images, labels in pbar:
            images = images.to(self.device, non_blocking=True)
            labels = labels.to(self.device, non_blocking=True)

            self.optimizer.zero_grad()

            with torch.amp.autocast("cuda", enabled=self.use_amp):
                logits = self.model(images)
                loss = self.criterion(logits, labels)

            self.scaler.scale(loss).backward()

            if self.grad_clip_norm > 0:
                self.scaler.unscale_(self.optimizer)
                nn.utils.clip_grad_norm_(self.model.parameters(), self.grad_clip_norm)

            self.scaler.step(self.optimizer)
            self.scaler.update()

            total_loss += loss.item() * images.size(0)
            preds = torch.argmax(logits, dim=1)
            correct += (preds == labels).sum().item()
            total_samples += images.size(0)

            pbar.set_postfix({"batch_loss": f"{loss.item():.4f}"})

        epoch_loss = total_loss / max(1, total_samples)
        epoch_acc = correct / max(1, total_samples)
        return epoch_loss, epoch_acc

    @torch.no_grad()
    def validate(self) -> Dict[str, float]:
        """Runs validation evaluation returning loss, accuracy, ROC-AUC, and F1."""
        self.model.eval()
        total_loss = 0.0
        all_labels = []
        all_probs = []
        all_preds = []

        for images, labels in self.val_loader:
            images = images.to(self.device, non_blocking=True)
            labels = labels.to(self.device, non_blocking=True)

            with torch.amp.autocast("cuda", enabled=self.use_amp):
                logits = self.model(images)
                loss = self.criterion(logits, labels)

            total_loss += loss.item() * images.size(0)
            probs = torch.softmax(logits, dim=1)[:, 1]  # P(FAKE)
            preds = torch.argmax(logits, dim=1)

            all_labels.extend(labels.cpu().numpy().tolist())
            all_probs.extend(probs.cpu().numpy().tolist())
            all_preds.extend(preds.cpu().numpy().tolist())

        val_loss = total_loss / max(1, len(all_labels))
        val_acc = accuracy_score(all_labels, all_preds)
        val_f1 = f1_score(all_labels, all_preds, zero_division=0)

        # ROC-AUC requires at least two classes present in the batch
        try:
            val_roc_auc = roc_auc_score(all_labels, all_probs)
        except ValueError:
            val_roc_auc = 0.50

        return {
            "val_loss": float(val_loss),
            "val_acc": float(val_acc),
            "val_roc_auc": float(val_roc_auc),
            "val_f1": float(val_f1),
        }

    def fit(self) -> Dict[str, Any]:
        """Executes full training across epochs with early stopping & checkpoint saving."""
        print(f"[*] Starting training on device: {self.device} (AMP: {self.use_amp})")
        start_time = time.time()
        best_val_auc = 0.0

        for epoch in range(1, self.epochs + 1):
            t0 = time.time()
            train_loss, train_acc = self.train_epoch()
            val_metrics = self.validate()

            current_lr = self.optimizer.param_groups[0]["lr"]
            self.scheduler.step()

            self.history["train_loss"].append(train_loss)
            self.history["val_loss"].append(val_metrics["val_loss"])
            self.history["train_acc"].append(train_acc)
            self.history["val_acc"].append(val_metrics["val_acc"])
            self.history["val_roc_auc"].append(val_metrics["val_roc_auc"])
            self.history["val_f1"].append(val_metrics["val_f1"])
            self.history["lr"].append(current_lr)

            elapsed = time.time() - t0
            print(
                f"Epoch [{epoch:02d}/{self.epochs:02d}] ({elapsed:.1f}s) | "
                f"Train Loss: {train_loss:.4f} Acc: {train_acc*100:.2f}% | "
                f"Val Loss: {val_metrics['val_loss']:.4f} Acc: {val_metrics['val_acc']*100:.2f}% | "
                f"Val AUC: {val_metrics['val_roc_auc']:.4f} F1: {val_metrics['val_f1']:.4f} | "
                f"LR: {current_lr:.2e}"
            )

            # Checkpoint saving when metric improves
            is_best = self.early_stopping.step(val_metrics["val_roc_auc"])
            if is_best:
                best_val_auc = val_metrics["val_roc_auc"]
                export_model_checkpoint(
                    model=self.model,
                    optimizer=self.optimizer,
                    epoch=epoch,
                    metrics=val_metrics,
                    config_dict=self.config_dict,
                    output_dir=self.output_dir,
                    checkpoint_name="best_model.pth"
                )

            if self.early_stopping.should_stop:
                print(f"[!] Early stopping triggered at epoch {epoch}")
                break

        total_time = time.time() - start_time
        print(f"[*] Training completed in {total_time/60:.2f} minutes. Best Val AUC: {best_val_auc:.4f}")
        return {
            "history": self.history,
            "best_val_auc": best_val_auc,
            "total_time_sec": total_time
        }
