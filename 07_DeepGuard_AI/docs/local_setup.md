# DeepGuard AI — Local Setup & Execution Guide

## 1. Prerequisites

- **Python**: 3.10, 3.11, or 3.14 (with `pip`)
- **Node.js**: v18+ or v20+ (with `npm`)
- **FFmpeg**: (Optional but recommended for video decoding)
- **Docker & Docker Compose**: (Optional for containerized execution)

---

## 2. Option A: Native Local Execution

### Step 1: Clone Repository
```bash
git clone https://github.com/AliKhan-Devs/Deep-Learning.git
cd Deep-Learning/07_DeepGuard_AI
```

### Step 2: Backend Setup & Execution
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run pytest to verify all system components
pytest tests -v

# Start FastAPI Uvicorn Server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now running at `http://localhost:8000`.
- Interactive Swagger UI: `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`

### Step 3: Frontend Setup & Execution
Open a second terminal window:
```bash
cd 07_DeepGuard_AI/frontend

# Install node dependencies
npm install

# Start Next.js Development Server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 3. Option B: Docker Compose Execution

To run both services within isolated containers with persistent volume mounts:

```bash
cd 07_DeepGuard_AI
docker-compose up --build
```

- Frontend accessible at: `http://localhost:3000`
- Backend API accessible at: `http://localhost:8000`
- Uploaded media and database persist in `./backend/storage/`
- Downloaded models persist in `./backend/artifacts/models/`
