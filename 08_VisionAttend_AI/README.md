# VisionAttend AI: Enterprise Biometric Facial Attendance & Workforce Analytics

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.14-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)
[![FaceNet](https://img.shields.io/badge/Model-Inception--ResNet--v1-blue)](https://github.com/timesler/facenet-pytorch)
[![Tests](https://img.shields.io/badge/Tests-18%20Passed-emerald)](https://pytest.org/)

**VisionAttend AI** is a contactless, enterprise-grade biometric attendance and workforce analytics platform engineered using **Deep Metric Learning** and real-time computer vision. It replaces slow, hygiene-compromised fingerprint scanners and shareable RFID badges with spoof-resistant facial recognition, automated shift tracking, and department-level punctuality analytics.

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Client["Next.js 14 Enterprise SaaS Frontend"]
        Kiosk["Reception Kiosk Scanner (/kiosk)"]
        Dashboard["Executive Analytics Dashboard (/)"]
        Directory["Personnel Directory & 3-Shot Wizard (/employees)"]
        Logs["Audit History & CSV Export (/attendance)"]
    end

    subgraph CoreEngine["FastAPI Biometric Engine (Port 8001)"]
        Detector["Face Localization & 20% Boundary Expansion (OpenCV)"]
        Liveness["Passive Anti-Spoofing Filter (Laplacian & Chrominance Variance)"]
        Embedder["Inception-ResNet-v1 (FaceNet VGGFace2 Pretrained)"]
        Matcher["Cosine Vector Search (Threshold θ = 0.65)"]
        StateMachine["Attendance State Machine (On-Time, Late, Departure Debouncing)"]
    end

    subgraph Persistence["Storage Layer"]
        DB[("SQLite Database: visionattend.db")]
        Avatars["Avatars & Audit Snapshots Directory"]
    end

    Kiosk -->|Live Base64 WebCam Frame| Detector
    Detector -->|160x160 Aligned Face Crop| Liveness
    Liveness -->|Spoof Rejected| Kiosk
    Liveness -->|Verified Real Face| Embedder
    Embedder -->|512-D L2 Normalized Vector| Matcher
    DB <-->|Enrolled Centroid Vectors| Matcher
    Matcher -->|Identity + Confidence| StateMachine
    StateMachine -->|Record Check-In / Check-Out| DB
    StateMachine -->|Instant Toast & BBox| Kiosk
    Directory -->|3-Shot Poses (Front, Left, Right)| Embedder
    DB --> Dashboard
    DB --> Logs
```

---

## 2. Mathematical Foundations

### 2.1 Deep Metric Learning & Unit Hypersphere Embedding
Rather than standard closed-set softmax classification, facial recognition is formulated as an **open-set metric learning problem**. An input face crop $x \in \mathbb{R}^{H \times W \times C}$ is mapped into a 512-dimensional Euclidean feature space by Inception-ResNet-v1:

$$e = f_\theta(x) \in \mathbb{R}^{512}$$

To enforce scale invariance and decouple lighting magnitude, vectors are projected onto the surface of a unit hypersphere $\mathcal{S}^{511}$ via $L_2$ normalization:

$$\hat{e} = \frac{e}{\|e\|_2} = \frac{e}{\sqrt{\sum_{i=1}^{512} e_i^2}}, \quad \|\hat{e}\|_2 = 1.0$$

### 2.2 Equivalence of Cosine Similarity and Euclidean Distance
For two unit-length embeddings $u, v \in \mathcal{S}^{511}$:

$$\|u - v\|_2^2 = \|u\|_2^2 + \|v\|_2^2 - 2(u \cdot v) = 2 - 2 \cos(\theta) = 2 - 2 \cdot \text{Sim}_{\text{cosine}}(u, v)$$

$$\text{Sim}_{\text{cosine}}(u, v) = u \cdot v = 1 - \frac{1}{2}\|u - v\|_2^2$$

Maximizing cosine similarity directly minimizes Euclidean cluster distance, enabling microsecond vector dot-product matching.

### 2.3 Multi-Shot Centroid Formulation
To ensure robustness against subtle head rotation during real-world check-ins, the enrollment wizard captures $K=3$ poses (frontal, left 15°, right 15°). The registered biometric template $\mu$ is computed via vector sum normalization:

$$\mu = \frac{\sum_{k=1}^K e_k}{\left\|\sum_{k=1}^K e_k\right\|_2}$$

### 2.4 Passive Liveness Detection (Anti-Spoofing)
Printed photos and mobile screens suffer from high-frequency edge blur and compressed color gamuts. The passive liveness filter checks:

1. **Laplacian High-Frequency Texture Variance:**
   $$\text{Var}_{\text{Laplacian}} = \frac{1}{MN} \sum_{x,y} \left( \nabla^2 I(x,y) - \overline{\nabla^2 I} \right)^2 \ge \tau_{\text{laplacian}} \quad (\tau = 40.0)$$
2. **YCrCb Chrominance Dynamic Range:**
   $$\sigma_{Cr} + \sigma_{Cb} \ge 8.0$$

---

## 3. Core Features & Capabilities

| Module | Features |
| :--- | :--- |
| **Reception Kiosk (`/kiosk`)** | Real-time webcam face tracking, dynamic bounding boxes with percentage scaling, synthetic dual-tone audio chime (Web Audio API), automated check-in confirmation toast, and live sidebar stream. |
| **Executive Dashboard (`/`)** | Real-time KPI cards (Attendance Rate %, Total Enrolled, Present, On-Time, Late), latest arrival activity feed, and departmental punctuality breakdown meters. |
| **Personnel Directory (`/employees`)** | Searchable roster, department filtering, and a guided **3-Shot Face Enrollment Wizard** that builds high-fidelity centroid embeddings from webcam bursts. |
| **Audit Logs & Export (`/attendance`)** | Complete historical logs filterable by date range, department, employee name, or status. Features **one-click CSV payroll export**. |
| **Workforce Analytics (`/analytics`)** | Departmental compliance matrix, peak arrival window tracking, and metric learning confidence distributions. |
| **System Settings (`/settings`)** | Configurable shift start time (`09:00 AM`), late grace period (`15 mins`), cosine recognition sensitivity slider (`0.50` to `0.85`), and passive anti-spoofing toggle. |

---

## 4. REST API Specification

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/recognition/verify-frame` | `POST` | Real-time webcam frame inference (detection &rarr; liveness &rarr; embedding &rarr; attendance record). |
| `/api/v1/employees` | `GET`, `POST` | List all employees or create a new corporate profile. |
| `/api/v1/employees/{id}` | `GET`, `PUT`, `DELETE` | Retrieve, update, or purge an employee profile. |
| `/api/v1/employees/{id}/enroll` | `POST` | Multi-shot biometric enrollment generating the 512-D centroid vector. |
| `/api/v1/attendance/today` | `GET` | Real-time KPI summary and latest check-in feed for today. |
| `/api/v1/attendance/history` | `GET` | Filterable and paginated historical attendance audit logs. |
| `/api/v1/attendance/analytics` | `GET` | Department-level attendance rates, punctuality, and absentee counts. |
| `/api/v1/attendance/export` | `GET` | Generates and streams downloadable CSV payroll reports. |
| `/api/v1/settings` | `GET`, `PUT` | Read and update system shift hours, grace periods, and thresholds. |
| `/api/v1/system/seed-demo` | `POST` | Seeds realistic demo corporate personnel for instant demonstration. |
| `/api/v1/system/status` | `GET` | Core engine status, hardware accelerator (CUDA/CPU), and total enrolled personnel. |

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Webcam (optional — photo upload and test simulation modes available)

### Step 1: Backend Setup
```bash
cd 08_VisionAttend_AI/backend

# Run automated test suite (all 18 tests will pass)
pytest tests -v

# Start the FastAPI engine (runs on port 8001)
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
Interactive Swagger API documentation will be available at `http://localhost:8001/docs`.

### Step 2: Frontend Setup
```bash
cd 08_VisionAttend_AI/frontend

# Build the Next.js production bundle
npm run build

# Start the frontend application (runs on port 3001)
npm run start
```
Navigate to `http://localhost:3001` in your browser.

---

## 6. Testing & Quality Assurance

The backend includes a comprehensive pytest suite covering face detection, InceptionResnetV1 embedding generation, centroid math, passive liveness, and attendance state machines:

```bash
pytest 08_VisionAttend_AI/backend/tests -v
```
**Results:** `18 passed in 10.22s` (100% pass rate).

---

## 7. Portfolio Learning Progression

- **Project 01-04:** CNN architectures, Regularization, and Transfer Learning with ResNet18.
- **Project 05-06:** Real-time Object Detection with YOLOv8 & Real-time Mask Detection.
- **Project 07 (DeepGuard AI):** Temporal Deepfake Detection & Visual Inconsistency Analysis.
- **Project 08 (VisionAttend AI):** **Deep Metric Learning, Inception-ResNet-v1 (FaceNet) Embeddings, Multi-Shot Centroids, and Enterprise SaaS Attendance Architecture.**
