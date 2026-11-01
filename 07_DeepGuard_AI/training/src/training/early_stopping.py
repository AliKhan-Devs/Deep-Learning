import numpy as np


class EarlyStopping:
    """
    Early stopping monitor to halt training when validation metric ceases improving.
    """

    def __init__(
        self,
        patience: int = 4,
        mode: str = "max",
        min_delta: float = 1e-4,
        verbose: bool = True
    ):
        """
        Args:
            patience: Number of epochs to wait for improvement before halting.
            mode: "max" for metrics like ROC-AUC / Accuracy, "min" for Loss.
            min_delta: Minimum change considered a meaningful improvement.
            verbose: Print state messages when triggered.
        """
        self.patience = patience
        self.mode = mode
        self.min_delta = min_delta
        self.verbose = verbose

        self.counter = 0
        self.best_score = -np.inf if mode == "max" else np.inf
        self.should_stop = False
        self.is_best = False

    def step(self, current_score: float) -> bool:
        """
        Updates monitor state with the newest epoch score.

        Returns:
            True if current_score is the best observed so far.
        """
        if self.mode == "max":
            improved = current_score > (self.best_score + self.min_delta)
        else:
            improved = current_score < (self.best_score - self.min_delta)

        if improved:
            self.best_score = current_score
            self.counter = 0
            self.is_best = True
            if self.verbose:
                print(f"[EarlyStopping] Metric improved to {current_score:.4f}. Resetting counter.")
        else:
            self.counter += 1
            self.is_best = False
            if self.verbose:
                print(f"[EarlyStopping] Patience: {self.counter}/{self.patience}")
            if self.counter >= self.patience:
                self.should_stop = True
                if self.verbose:
                    print("[EarlyStopping] Maximum patience reached. Triggering early stop.")

        return self.is_best
