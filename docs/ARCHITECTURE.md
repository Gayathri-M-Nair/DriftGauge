# DriftGauge — Complete Architecture & Workflow Reference

> Full technical documentation covering every layer of the system: data flow, algorithms, API contracts, database schema, frontend architecture, AI integration, and decision logic.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Repository Structure](#2-repository-structure)
3. [Tech Stack](#3-tech-stack)
4. [Database Schema](#4-database-schema)
5. [Backend Architecture](#5-backend-architecture)
6. [API Reference](#6-api-reference)
7. [Drift Detection Engine](#7-drift-detection-engine)
8. [ML Model Evaluator](#8-ml-model-evaluator)
9. [AI Insights Engine](#9-ai-insights-engine)
10. [Frontend Architecture](#10-frontend-architecture)
11. [End-to-End Workflow](#11-end-to-end-workflow)
12. [Data Flow Diagram](#12-data-flow-diagram)
13. [PSI Badge Grading Logic](#13-psi-badge-grading-logic)
14. [Suggestion Engine Rules](#14-suggestion-engine-rules)
15. [File Storage Layout](#15-file-storage-layout)
16. [Error Handling Strategy](#16-error-handling-strategy)
17. [Configuration & Thresholds](#17-configuration--thresholds)

---

## 1. System Overview

DriftGauge is a lightweight, self-hosted ML monitoring platform. It answers three questions after every deployment:

1. **Did the data distribution change?** — Statistical drift detection across all numeric features
2. **Did the model performance degrade?** — Accuracy, F1, precision, recall on both datasets
3. **Why did it happen and what should we do?** — AI-generated root cause analysis via Ollama (llama3)

The system is intentionally minimal: no Kubernetes, no MLflow, no cloud dependencies. It runs entirely on localhost with a SQLite database and a local Ollama instance.

---

## 2. Repository Structure

```
DriftGauge/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, all routes, unified pipeline
│   │   ├── drift_engine.py      # DriftDetector class — KS, Wasserstein, PSI
│   │   ├── model_evaluator.py   # ModelEvaluator class — sklearn model eval
│   │   ├── ai_helper.py         # Ollama integration — 4-prompt AI insights
│   │   ├── models.py            # SQLAlchemy ORM models (Project, Analysis)
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   └── database.py          # SQLite engine + session factory
│   ├── uploads/                 # Uploaded CSVs, organised by project_id
│   │   └── {project_id}/
│   │       ├── baseline.csv
│   │       └── current.csv
│   ├── models/                  # Uploaded .pkl models, organised by project_id
│   │   └── {project_id}/
│   │       └── model.pkl
│   ├── driftgauge.db            # SQLite database file
│   ├── requirements.txt
│   ├── create_sample_model.py   # Helper script to generate a test .pkl
│   └── test_ai.py               # Standalone Ollama integration test
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component, router, sidebar layout
│   │   ├── main.jsx             # React entry point
│   │   ├── index.css            # Global styles, Tailwind, badge/AI CSS
│   │   ├── services/
│   │   │   └── api.js           # Axios API client — all HTTP calls
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx   # File upload + analysis trigger
│   │   │   ├── DashboardPage.jsx# Results, table, charts, AI insights
│   │   │   ├── AnalysisHistory.jsx # Past analyses list
│   │   │   └── Settings.jsx     # Threshold config (UI only)
│   │   └── components/
│   │       ├── Sidebar.jsx      # Navigation + project selector/creator
│   │       ├── FeatureDistributionChart.jsx # Recharts line chart
│   │       ├── MetricCard.jsx
│   │       ├── FeatureTable.jsx
│   │       ├── DriftChart.jsx
│   │       ├── DriftHistogram.jsx
│   │       ├── FeatureDetailPanel.jsx
│   │       ├── AIExplanation.jsx
│   │       └── UploadCard.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── docs/                        # All feature and architecture docs
└── README.md
```

---

## 3. Tech Stack

| Layer       | Technology                        | Version   | Purpose |
|-------------|-----------------------------------|-----------|---------|
| Frontend    | React                             | 18.2      | UI framework |
| Frontend    | Vite                              | 5.0       | Dev server + bundler |
| Frontend    | Tailwind CSS                      | 3.4       | Utility-first styling |
| Frontend    | Framer Motion                     | 10.18     | Animations |
| Frontend    | Recharts                          | 2.10      | Distribution charts |
| Frontend    | React Router DOM                  | 6.21      | Client-side routing |
| Frontend    | Axios                             | 1.6       | HTTP client |
| Frontend    | Lucide React                      | 0.303     | Icons |
| Backend     | FastAPI                           | 0.115     | REST API framework |
| Backend     | Uvicorn                           | 0.32      | ASGI server |
| Backend     | SQLAlchemy                        | 2.0       | ORM |
| Backend     | SQLite                            | built-in  | Database |
| Backend     | Pydantic                          | 2.9       | Schema validation |
| Backend     | pandas                            | 2.2       | Data manipulation |
| Backend     | numpy                             | ≥2.0      | Numerical ops |
| Backend     | scipy                             | ≥1.14     | KS test, Wasserstein |
| Backend     | scikit-learn                      | ≥1.3      | Model eval metrics |
| Backend     | joblib                            | ≥1.3      | Model deserialization |
| Backend     | requests                          | ≥2.31     | Ollama HTTP calls |
| AI          | Ollama                            | local     | LLM runtime |
| AI          | llama3 (llama3:latest)            | local     | Language model |

---

## 4. Database Schema

SQLite database at `backend/driftgauge.db`. Two tables managed by SQLAlchemy ORM.

### Table: `projects`

| Column       | Type     | Constraints        | Description |
|--------------|----------|--------------------|-------------|
| id           | INTEGER  | PK, auto-increment | Project identifier |
| name         | VARCHAR  | UNIQUE, indexed    | Project name |
| description  | TEXT     | nullable           | Optional description |
| created_at   | DATETIME | default=utcnow     | Creation timestamp |

### Table: `analyses`

| Column           | Type    | Constraints        | Description |
|------------------|---------|--------------------|-------------|
| id               | INTEGER | PK, auto-increment | Analysis identifier |
| project_id       | INTEGER | indexed            | FK to projects.id |
| mode             | VARCHAR |                    | `"fast"` or `"high_accuracy"` |
| drift_score      | FLOAT   |                    | Fraction of features drifted (0.0–1.0) |
| drifted_features | TEXT    |                    | JSON array of drifted feature names |
| report           | TEXT    |                    | Full JSON result blob (all metrics, AI insights) |
| created_at       | DATETIME| default=utcnow     | Analysis timestamp |

The `report` column stores the complete unified result as a JSON string, including `feature_scores`, `model_metrics`, `ai_insights`, `suggestions`, `histogram_data`, etc.

---

## 5. Backend Architecture

### Entry Point: `main.py`

- Creates FastAPI app instance
- Registers CORS middleware (allows `localhost:5173` and `localhost:5174`)
- Runs `Base.metadata.create_all()` to auto-create tables on startup
- Runs `_check_ollama()` at startup to verify Ollama connectivity and log available models
- Defines all HTTP routes
- Manages file I/O for uploads and models

### Module Responsibilities

```
main.py
  ├── routes → validates input, orchestrates pipeline
  ├── DriftDetector (drift_engine.py) → statistical analysis
  ├── ModelEvaluator (model_evaluator.py) → sklearn model eval
  ├── generate_ai_insights (ai_helper.py) → Ollama calls
  └── SQLAlchemy session → persist Analysis record
```

### Unified Analysis Pipeline (`POST /projects/{id}/analyze`)

```
1. Load baseline.csv + current.csv from disk
2. DriftDetector.detect_drift(baseline, current, mode)
   └── Returns drift_result with ai_insights already embedded
3. IF model.pkl exists AND target_column provided:
   a. ModelEvaluator.evaluate_model(model, baseline, current, target_col)
   b. Build model_metrics dict
   c. ModelEvaluator.generate_suggestions(drift_result, model_eval)
   d. Re-call generate_ai_insights with model_metrics for richer context
      (overwrites the drift-only ai_insights from step 2)
4. Merge: result = { ...drift_result, model_metrics, feature_importance, suggestions }
5. Persist Analysis record to SQLite (report stored as JSON string)
6. Return AnalysisResponse
```

---

## 6. API Reference

Base URL: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### Projects

#### `POST /projects`
Create a new project.

Request body:
```json
{ "name": "my-project", "description": "optional" }
```
Response: `ProjectResponse` — `{ id, name, description, created_at }`

#### `GET /projects`
List all projects. Returns array of `ProjectResponse`.

---

### File Uploads

#### `POST /projects/{project_id}/upload-baseline`
Upload baseline CSV. Multipart form, field name `file`. Saved to `uploads/{project_id}/baseline.csv`.

#### `POST /projects/{project_id}/upload-current`
Upload current CSV. Saved to `uploads/{project_id}/current.csv`.

#### `POST /projects/{project_id}/upload-model`
Upload trained model. Must be `.pkl`. Saved to `models/{project_id}/model.pkl`.

---

### Analysis

#### `POST /projects/{project_id}/analyze` ← primary endpoint
Run unified drift + optional model analysis.

Request body:
```json
{
  "mode": "fast" | "high_accuracy",
  "target_column": "label",        // optional, required for model eval
  "feature_columns": ["f1", "f2"]  // optional, inferred if omitted
}
```

Response (`AnalysisResponse`):
```json
{
  "id": 42,
  "project_id": 1,
  "mode": "high_accuracy",
  "drift_score": 0.67,
  "drifted_features": ["income", "credit_score"],
  "report": {
    "mode": "high_accuracy",
    "drift_score": 0.67,
    "total_features": 6,
    "drifted_features": ["income", "credit_score"],
    "processing_time": 1.24,
    "samples_used": { "baseline": 10000, "current": 10000 },
    "thresholds": { "p_value": 0.05, "wasserstein": 0.1, "psi": 0.25 },
    "feature_scores": {
      "income": {
        "ks_statistic": 0.333,
        "p_value": 0.0,
        "wasserstein_distance": 15621.45,
        "psi_score": 1.03,
        "mean_shift": 4200.0,
        "std_shift": 310.0,
        "baseline_mean": 52000.0,
        "current_mean": 56200.0,
        "baseline_std": 12000.0,
        "current_std": 12310.0,
        "histogram_data": {
          "histogram": [{ "bin": 30000, "baseline": 5.2, "current": 3.1 }, ...],
          "bin_edges": [...],
          "baseline_range": [20000, 120000],
          "current_range": [22000, 130000]
        }
      }
    },
    "ai_insights": {
      "explanation": "...",
      "root_cause": "...",
      "recommendation": "...",
      "code_fix": "..."
    },
    "model_metrics": {
      "baseline_accuracy": 0.91,
      "baseline_precision": 0.89,
      "baseline_recall": 0.88,
      "baseline_f1": 0.885,
      "current_accuracy": 0.74,
      "current_precision": 0.72,
      "current_recall": 0.71,
      "current_f1": 0.715,
      "performance_drop": 0.17,
      "has_degradation": true
    },
    "feature_importance": { "income": 0.35, "credit_score": 0.28 },
    "suggestions": ["🔴 High drift + performance drop. Retrain immediately.", ...]
  },
  "created_at": "2026-03-24T10:00:00"
}
```

#### `GET /projects/{project_id}/analyses`
Get all analyses for a project, newest first.

#### `GET /analysis/{analysis_id}`
Get a single analysis by ID.

#### `POST /projects/{project_id}/analyze-model-drift` ← legacy
Kept for backward compatibility. Delegates to the same unified pipeline. Requires `target_column` in body.

---

## 7. Drift Detection Engine

**File:** `backend/app/drift_engine.py`  
**Class:** `DriftDetector`

### Constructor Parameters

| Parameter               | Default | Description |
|-------------------------|---------|-------------|
| `threshold`             | `0.05`  | KS test p-value cutoff |
| `wasserstein_threshold` | `0.1`   | Wasserstein distance cutoff |
| `psi_threshold`         | `0.25`  | PSI cutoff for significant drift |

### Preprocessing

`preprocess(baseline, current)`:
- Finds common columns between both DataFrames
- Drops rows with NaN values from both
- Returns aligned DataFrames

### Fast Mode (`detect_drift_fast`)

- Samples up to 5,000 rows from each dataset (random_state=42 for reproducibility)
- Runs **KS test only** on all numeric columns
- Drift decision: `p_value < 0.05`
- No histogram data, no Wasserstein, no PSI
- Typical runtime: < 1 second

### High Accuracy Mode (`detect_drift_accurate`)

Runs on the full dataset. For each numeric column:

1. **Kolmogorov-Smirnov test** (`scipy.stats.ks_2samp`)
   - Returns: `ks_statistic` (0–1), `p_value`
   - Measures: maximum difference between CDFs

2. **Wasserstein Distance** (`scipy.stats.wasserstein_distance`)
   - Also called Earth Mover's Distance
   - Measures: minimum "work" to transform one distribution into another
   - Scale-dependent — large for features with large value ranges

3. **Population Stability Index (PSI)**
   - 10 equal-width bins based on baseline distribution
   - Formula: `PSI = Σ (actual% - expected%) × ln(actual% / expected%)`
   - Epsilon `1e-6` added to avoid log(0)
   - Returns absolute value

4. **Histogram data** (20 bins, normalized to %)
   - Shared bin edges across both distributions
   - Stored as `[{ bin: center, baseline: %, current: % }, ...]`

5. **Mean and std shift** — absolute difference in mean and standard deviation

**Multi-criteria drift decision** — a feature is drifted if ANY of:
- `p_value < 0.05` (KS test)
- `wasserstein_distance > 0.1`
- `psi_score >= 0.25`

**Drift score** = `drifted_features / total_numeric_features`

### AI Insights Integration

After computing all feature scores, `_build_drift_summary()` creates a clean dict (no histogram data) and passes it to `_get_ai_insights()`. If model metrics are available (from `main.py`), AI is re-called with the enriched context.

---

## 8. ML Model Evaluator

**File:** `backend/app/model_evaluator.py`  
**Class:** `ModelEvaluator`

### Constructor Parameters

| Parameter                     | Default | Description |
|-------------------------------|---------|-------------|
| `feature_importance_threshold`| `0.1`   | Min importance to flag a feature as critical |
| `performance_drop_threshold`  | `0.05`  | Min accuracy drop to flag degradation |

### Model Loading

`load_model(path)` — uses `joblib.load()`. Supports any sklearn-compatible `.pkl` model.

### Feature Alignment

`evaluate_model()` handles the common problem of feature order mismatch:

```python
if hasattr(model, 'feature_names_in_'):
    training_features = list(model.feature_names_in_)  # use model's own feature list
else:
    training_features = feature_columns or inferred_from_df

def align_features(df):
    X = df.drop(columns=[target_column])
    for col in training_features:
        if col not in X.columns:
            X[col] = 0          # add missing columns with default 0
    return X[training_features]  # reorder to match training order exactly
```

### Metrics Calculated

For both baseline and current datasets:

| Metric    | Method | Notes |
|-----------|--------|-------|
| Accuracy  | `accuracy_score` | |
| Precision | `precision_score` | binary or weighted for multiclass |
| Recall    | `recall_score` | binary or weighted for multiclass |
| F1 Score  | `f1_score` | binary or weighted for multiclass |

`performance_drop = baseline_accuracy - current_accuracy`  
`has_degradation = performance_drop > 0.05`

### Feature Importance Extraction

Supports two model types:
- **Tree-based** (Random Forest, Gradient Boosting, XGBoost): uses `model.feature_importances_`
- **Linear** (Logistic Regression, SVM): uses `abs(model.coef_[0])`

Returns a dict `{ feature_name: importance_float }` aligned to training feature order.

---

## 9. AI Insights Engine

**File:** `backend/app/ai_helper.py`

### Architecture Decision

Instead of one large JSON-structured prompt (which caused truncation with llama3), the system makes **4 separate focused prompts**. Each returns plain text, avoiding JSON parse failures.

### Ollama Call

```python
POST http://localhost:11434/api/generate
{
  "model": "llama3",
  "prompt": "...",
  "stream": false
}
# Response: { "response": "..." }
```

Timeout: 120 seconds per call. Total max time for 4 calls: ~8 minutes (typically 30–60s).

### Context Builder (`_build_context`)

Builds a compact string from the top 5 drifted features:
```
Drifted features:
- income: KS=0.333, p=0.0000, PSI=1.030, Wasserstein=15621.450, model_importance=0.350
- credit_score: KS=0.351, p=0.0000, PSI=0.960, Wasserstein=51.670, model_importance=0.280

Model performance: baseline=91.0%, current=74.0%, drop=17.0%, degraded=yes
```

### Four Prompts

| Section        | Prompt instruction | Output |
|----------------|--------------------|--------|
| `explanation`  | 2-3 sentences explaining what drift occurred and its impact | Plain text |
| `root_cause`   | 1-2 sentences on most likely root cause | Plain text |
| `recommendation` | 2-3 actionable recommendations, newline-separated | Plain text |
| `code_fix`     | 8-12 line Python snippet for the top drifted feature | Python code |

### Fallback Behaviour

- If `requests` import fails → `_AI_AVAILABLE = False` → static fallback messages returned immediately
- If Ollama is unreachable → `query_ollama()` returns `"Error: ..."` string → individual section falls back
- If no features drifted AND no model degradation → returns "stable" messages without calling Ollama
- All exceptions in `_get_ai_insights()` are caught and logged with full traceback

### Startup Check

`main.py` calls `_check_ollama()` on startup:
- `GET http://localhost:11434/api/tags` — lists available models
- Warns if `llama3` is not in the list
- Logs result to console

---

## 10. Frontend Architecture

### Routing (`App.jsx`)

```
/           → UploadPage
/dashboard  → DashboardPage
/history    → AnalysisHistory
/settings   → Settings
```

`selectedProject` state lives in `App.jsx` and is passed as a prop to all pages. The `Sidebar` component both reads and sets it.

### State Management

No Redux or Zustand. State is managed with React `useState` at the page level:

- `App.jsx` — `selectedProject`
- `UploadPage.jsx` — `baselineFile`, `currentFile`, `modelFile`, `targetColumn`, `mode`, `loading`
- `DashboardPage.jsx` — `analysis`, `selectedFeature`, `loading`, `tableFilter`
- `AnalysisHistory.jsx` — `analyses`, `loading`

### Navigation State Pattern

After analysis completes, `UploadPage` navigates to `/dashboard` with the fresh result in React Router's location state:

```js
navigate('/dashboard', { state: { analysisResult: response.data } });
```

`DashboardPage` checks `location.state?.analysisResult` first. If present, it uses that directly (no API call). Then clears the state with `window.history.replaceState({}, document.title)` to prevent stale data on refresh.

### API Client (`services/api.js`)

All HTTP calls go through a single Axios-based object:

```js
api.createProject(data)
api.listProjects()
api.uploadBaseline(projectId, file)
api.uploadCurrent(projectId, file)
api.uploadModel(projectId, file)
api.analyzeDrift(projectId, mode, targetColumn?, featureColumns?)
api.analyzeModelDrift(projectId, mode, targetColumn, featureColumns?)
api.getAnalyses(projectId)
api.getAnalysisById(analysisId)
```

### Key Components

**`Sidebar.jsx`** — Fixed left nav (224px wide). Lists projects fetched from `GET /projects`. Has inline project creation form. Highlights active route.

**`FeatureDistributionChart.jsx`** — Recharts `LineChart`. Blue line = baseline, orange line = current. X-axis = bin center value, Y-axis = frequency %. Data comes from `feature_scores[name].histogram_data.histogram`.

**`DashboardPage.jsx`** — Two-column layout:
- Left (flex-1): banner, metric cards, model performance, feature table, AI insights panel, action buttons
- Right (380px sticky): feature selector, distribution chart, stats, PSI legend

**`DriftBadge` component** — PSI-first grading:
```jsx
psi < 0.1   → <span class="badge badge-stable">Stable</span>
psi < 0.25  → <span class="badge badge-monitor">Monitor</span>
psi >= 0.25 → <span class="badge badge-critical">Critical Drift</span>
// fallback to p-value if no PSI (fast mode)
```

**`AIInsightsPanel` component** — Collapsible panel with `AnimatePresence`. Shows "Ollama offline" warning badge if fallback text is detected. Code fix section uses `<code class="ai-code-block">` with `max-height: 280px` and `overflow-y: auto`.

---

## 11. End-to-End Workflow

### A. Drift-Only Analysis (no model)

```
User                    Frontend                  Backend                    Ollama
 │                          │                         │                         │
 ├─ Create project ─────────► POST /projects           │                         │
 │                          │◄── { id: 1 } ───────────┤                         │
 │                          │                         │                         │
 ├─ Upload baseline CSV ────► POST /upload-baseline    │                         │
 ├─ Upload current CSV ─────► POST /upload-current     │                         │
 │                          │                         │                         │
 ├─ Click "Start Analysis" ─► POST /analyze            │                         │
 │                          │  { mode: "high_accuracy"}│                         │
 │                          │                         │                         │
 │                          │         ┌───────────────┤                         │
 │                          │         │ DriftDetector │                         │
 │                          │         │ .detect_drift()                         │
 │                          │         │  preprocess   │                         │
 │                          │         │  KS test      │                         │
 │                          │         │  Wasserstein  │                         │
 │                          │         │  PSI          │                         │
 │                          │         │  histograms   │                         │
 │                          │         └───────────────┤                         │
 │                          │                         │                         │
 │                          │         ┌───────────────┤                         │
 │                          │         │ _get_ai_insights                        │
 │                          │         │  _build_context                         │
 │                          │         │               ├── POST /api/generate ──►│
 │                          │         │               │◄── explanation ─────────┤
 │                          │         │               ├── POST /api/generate ──►│
 │                          │         │               │◄── root_cause ──────────┤
 │                          │         │               ├── POST /api/generate ──►│
 │                          │         │               │◄── recommendation ──────┤
 │                          │         │               ├── POST /api/generate ──►│
 │                          │         │               │◄── code_fix ────────────┤
 │                          │         └───────────────┤                         │
 │                          │                         │                         │
 │                          │         ┌───────────────┤                         │
 │                          │         │ Save Analysis  │                         │
 │                          │         │ to SQLite      │                         │
 │                          │         └───────────────┤                         │
 │                          │◄── AnalysisResponse ────┤                         │
 │                          │                         │                         │
 │◄─ navigate('/dashboard') ┤                         │                         │
 │   with result in state   │                         │                         │
```

### B. With ML Model Monitoring

Same as above, plus between drift detection and AI insights:

```
         ┌──────────────────────────────┤
         │ ModelEvaluator               │
         │  .load_model(model.pkl)      │
         │  .evaluate_model(            │
         │    baseline, current,        │
         │    target_col)               │
         │   → align features           │
         │   → predict on both          │
         │   → accuracy/F1/precision/   │
         │     recall for both          │
         │   → performance_drop         │
         │   → feature_importance       │
         │  .generate_suggestions(      │
         │    drift_result, model_eval) │
         └──────────────────────────────┤
         
         Then AI is re-called with model_metrics
         for richer, combined insights
```

---

## 12. Data Flow Diagram

```
CSV files (baseline + current)
         │
         ▼
   DriftDetector.preprocess()
   ├── intersect columns
   └── drop NaN rows
         │
         ▼
   [Fast Mode]                    [High Accuracy Mode]
   sample(5000 rows)              full dataset
   KS test only                   KS + Wasserstein + PSI + histograms
         │                                    │
         └──────────────┬─────────────────────┘
                        ▼
              feature_scores dict
              { feature: { ks_statistic, p_value,
                           wasserstein_distance?,
                           psi_score?,
                           histogram_data? } }
                        │
                        ▼
              drift decision per feature
              (multi-criteria OR logic)
                        │
                        ▼
              drift_score = drifted / total
                        │
              ┌─────────┴──────────┐
              │                    │
              ▼                    ▼
        [No model]           [Model uploaded]
              │              ModelEvaluator
              │              align features
              │              predict baseline + current
              │              compute metrics
              │              generate suggestions
              │                    │
              └─────────┬──────────┘
                        ▼
              _build_drift_summary()
              (strips histogram, preserves metric keys)
                        │
                        ▼
              generate_ai_insights()
              ├── _build_context() → compact string
              ├── _ask_explanation() → Ollama call 1
              ├── _ask_root_cause()  → Ollama call 2
              ├── _ask_recommendation() → Ollama call 3
              └── _ask_code_fix()   → Ollama call 4
                        │
                        ▼
              unified result dict
              { ...drift_result,
                model_metrics,
                feature_importance,
                suggestions,
                ai_insights }
                        │
                        ▼
              SQLite Analysis record
              (report stored as JSON string)
                        │
                        ▼
              AnalysisResponse → Frontend
```

---

## 13. PSI Badge Grading Logic

PSI (Population Stability Index) is the primary signal for the status badge. P-value is used as fallback when PSI is not available (fast mode).

| PSI Range    | Badge Label    | Color  | CSS Class      | Meaning |
|--------------|----------------|--------|----------------|---------|
| < 0.10       | Stable         | Green  | `badge-stable` | No meaningful shift |
| 0.10 – 0.25  | Monitor        | Yellow | `badge-monitor`| Moderate shift, watch closely |
| ≥ 0.25       | Critical Drift | Red    | `badge-critical`| Significant population change |

P-value fallback (fast mode, no PSI):

| P-Value      | Badge Label    |
|--------------|----------------|
| ≥ 0.05       | Stable         |
| 0.01 – 0.05  | Monitor        |
| < 0.01       | Critical Drift |

The progress bar in the drift score column also uses PSI-based coloring (green/yellow/red gradient).

---

## 14. Suggestion Engine Rules

`ModelEvaluator.generate_suggestions()` applies these rules in order:

### Combined Scenario Rules (highest priority)

| Condition | Suggestion |
|-----------|-----------|
| `drift_score >= 0.4` AND `has_degradation` | Retrain immediately |
| `drift_score >= 0.4` AND NOT `has_degradation` | Monitor — degradation may follow |
| NOT high drift AND `has_degradation` | Investigate labels/pipeline bugs |

### Performance Summary
Always appended when model metrics are present: `Accuracy: X% → Y%`

### Critical Feature Rules
For each drifted feature where `feature_importance > 0.1`, sorted by importance desc (top 3):

| Sub-condition | Suggestion |
|---------------|-----------|
| `psi >= 0.25` | Retrain or re-engineer this feature |
| `wasserstein > 0.1` | Check preprocessing and scaling |
| Otherwise | Review data collection |

### Volume Rule
If 3+ important features drifted → recommend full dataset retraining.

### PSI-Only Features
For drifted features not already covered by importance rules, if `psi >= 0.25` → population shift warning.

### All Clear
If no suggestions generated → "No significant issues detected."

---

## 15. File Storage Layout

```
backend/
├── uploads/
│   ├── 1/
│   │   ├── baseline.csv    ← overwritten on each upload
│   │   └── current.csv
│   ├── 2/
│   │   ├── baseline.csv
│   │   └── current.csv
│   └── sample/
│       ├── baseline.csv
│       └── current.csv
└── models/
    ├── 1/
    │   └── model.pkl       ← overwritten on each upload
    ├── 9/
    │   └── model.pkl
    └── sample/
        └── model.pkl
```

Files are stored by `project_id` as the directory name. Uploading a new file for the same project overwrites the previous one. There is no versioning of uploaded files — only the analysis results are versioned in the database.

---

## 16. Error Handling Strategy

| Layer | Scenario | Handling |
|-------|----------|----------|
| Backend | Missing dataset files | `HTTP 400` with detail message |
| Backend | Invalid model file (not .pkl) | `HTTP 400` |
| Backend | Target column not in dataset | `HTTP 400` |
| Backend | Model evaluation failure | Caught, `model_metrics = {"error": str(e)}`, drift results still returned |
| Backend | AI insights failure | Caught with full traceback log, fallback dict returned |
| Backend | Ollama unreachable | `query_ollama()` returns `"Error: ..."` string, section falls back |
| Backend | Ollama timeout (>120s) | Returns timeout error string, section falls back |
| Backend | `requests` not installed | `_AI_AVAILABLE = False`, all sections return static fallback |
| Frontend | Analysis API failure | `alert()` with error detail from response |
| Frontend | History load failure | `console.error`, empty state shown |
| Frontend | No analysis found | "No analysis found" empty state with CTA |
| Frontend | No histogram data | "Distribution data not available" placeholder |
| Frontend | AI fallback text detected | "Ollama offline" warning badge shown in AI panel header |

---

## 17. Configuration & Thresholds

All thresholds are currently hardcoded as constructor defaults. They can be changed by modifying the instantiation in `main.py`.

### Drift Thresholds (`DriftDetector`)

```python
DriftDetector(
    threshold=0.05,              # KS p-value — lower = stricter
    wasserstein_threshold=0.1,   # scale-dependent, may need tuning per domain
    psi_threshold=0.25           # industry standard for significant drift
)
```

### Model Degradation Threshold (`ModelEvaluator`)

```python
ModelEvaluator(
    feature_importance_threshold=0.1,   # min importance to flag a feature
    performance_drop_threshold=0.05     # 5% accuracy drop = degradation
)
```

### Ollama Configuration (`ai_helper.py`)

```python
OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"
# timeout = 120 seconds per call
```

### Sampling (`DriftDetector.apply_sampling`)

```python
sample_size = 5000  # rows per dataset in fast mode
random_state = 42   # for reproducibility
```

### PSI Bins

```python
bins = 10   # for PSI calculation
bins = 20   # for histogram visualization
```

### CORS Origins (`main.py`)

```python
allow_origins = ["http://localhost:5173", "http://localhost:5174"]
```

Add production origins here when deploying.
