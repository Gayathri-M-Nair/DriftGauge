# DriftGauge

An ML monitoring platform for detecting data drift and model performance degradation. Upload baseline and current datasets, run statistical analysis, and get AI-powered root cause insights — all in one dashboard.

---

## Features

- **Data Drift Detection** — KS test, Wasserstein distance, and PSI across all numeric features
- **Graded Drift Badges** — Stable / Monitor / Critical Drift based on PSI thresholds
- **Feature Distribution Charts** — Side-by-side baseline vs current histograms
- **ML Model Monitoring** — Upload a `.pkl` model to compare accuracy, F1, precision, and recall across datasets
- **AI Insights** — Powered by Ollama (llama3) for explanation, root cause, recommendations, and code fix suggestions
- **Analysis History** — All analyses stored and browsable per project
- **Fast & High Accuracy modes** — Trade speed for depth depending on dataset size

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Framer Motion |
| Backend  | FastAPI, SQLAlchemy, SQLite |
| ML       | scikit-learn, scipy, pandas, numpy |
| AI       | Ollama (llama3) via local HTTP API |

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com) installed and running locally (for AI insights)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Gayathri-M-Nair/DriftGauge.git
cd DriftGauge
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Ollama setup (for AI insights)

```bash
# Install Ollama from https://ollama.com, then pull the model
ollama pull llama3

# Make sure Ollama is running
ollama serve
```

Ollama must be running at `http://localhost:11434` before starting an analysis.

---

## Usage

1. Open `http://localhost:5173`
2. Create a project from the sidebar
3. Go to **Upload** — upload a baseline CSV and a current CSV
4. Optionally enable **ML Model Monitoring** and upload a `.pkl` model with the target column name
5. Choose **Fast Mode** or **High Accuracy Mode** and click **Start Drift Analysis**
6. View results on the **Dashboard** — drift table, distribution charts, model metrics, and AI insights

---

## Project Structure

```
DriftGauge/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI routes
│   │   ├── drift_engine.py    # KS, Wasserstein, PSI detection
│   │   ├── model_evaluator.py # ML model performance evaluation
│   │   ├── ai_helper.py       # Ollama integration
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── database.py        # DB connection
│   ├── requirements.txt
│   └── create_sample_model.py # Helper to generate a test .pkl model
├── frontend/
│   ├── src/
│   │   ├── pages/             # Dashboard, Upload, History, Settings
│   │   ├── components/        # Charts, cards, sidebar
│   │   └── services/api.js    # Axios API client
│   └── package.json
├── docs/                      # Feature and implementation notes
└── README.md
```

---

## Creating a Sample Model (for testing)

```bash
cd backend
python create_sample_model.py
```

This generates a sample `.pkl` model you can upload to test the ML monitoring feature.

---

## API Docs

FastAPI auto-generates interactive docs at `http://localhost:8000/docs` once the backend is running.
