# DriftGauge ML Monitoring Feature

## Overview

DriftGauge has been extended from a pure data drift detection tool into a basic ML monitoring system. The platform now answers three critical questions:

1. **Did the data distribution change?** (Data Drift Detection)
2. **Did the ML model performance degrade?** (Model Performance Monitoring)
3. **What feature drift may have caused the issue and what should the developer fix?** (Root Cause Analysis & Recommendations)

## Features

### 1. Model Upload Support
- Upload trained ML models in `.pkl` format (pickle/joblib)
- Supported model types:
  - Logistic Regression
  - Random Forest
  - Gradient Boosting
  - XGBoost
  - Any scikit-learn compatible model

### 2. Model Evaluation Engine
- Automatically evaluates model performance on both baseline and current datasets
- Calculates key metrics:
  - **Accuracy**: Overall correctness
  - **Precision**: Positive prediction accuracy
  - **Recall**: True positive detection rate
  - **F1 Score**: Harmonic mean of precision and recall
- Detects performance degradation (default threshold: 5% drop)

### 3. Feature Importance Analysis
- Extracts feature importance from models:
  - `feature_importances_` for tree-based models
  - `coef_` for linear models
- Identifies critical features that are:
  - Highly important for the model
  - Significantly drifted
- These are the likely causes of performance degradation

### 4. Intelligent Suggestion Engine
- Generates rule-based recommendations:
  - **Rule 1**: PSI > 0.25 AND feature importance > 0.1 → Retrain model
  - **Rule 2**: High Wasserstein distance → Check feature scaling
  - **Rule 3**: Multiple important features drifted → Full dataset retraining
  - **Rule 4**: High drift but stable performance → Monitor closely
  - **Rule 5**: Performance drop without drift → Check label quality

### 5. Enhanced Dashboard UI
- New "Model Performance Analysis" section showing:
  - Baseline vs Current accuracy comparison
  - F1 score comparison
  - Performance degradation alerts
  - Automated recommendations
  - Suggested fixes with actionable steps

## API Endpoints

### Upload Model
```http
POST /projects/{project_id}/upload-model
Content-Type: multipart/form-data

file: model.pkl
```

### Analyze Model Drift
```http
POST /projects/{project_id}/analyze-model-drift
Content-Type: application/json

{
  "mode": "high_accuracy",
  "target_column": "target",
  "feature_columns": null  // optional, uses all except target if null
}
```

**Response:**
```json
{
  "data_drift": {
    "drift_score": 0.4,
    "drifted_features": ["age", "income"],
    "feature_scores": {...}
  },
  "model_metrics": {
    "baseline_accuracy": 0.91,
    "current_accuracy": 0.74,
    "performance_drop": 0.17,
    "has_degradation": true
  },
  "feature_importance": {
    "credit_score": 0.45,
    "income": 0.30,
    "age": 0.15
  },
  "suggestions": [
    "⚠️ Model performance dropped by 17.0%...",
    "🔴 Critical: 'income' (importance: 0.30) has significant drift..."
  ]
}
```

## Usage Guide

### Step 1: Prepare Your Model
Train and save your model using joblib:
```python
import joblib
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier()
model.fit(X_train, y_train)
joblib.dump(model, 'model.pkl')
```

### Step 2: Upload Data and Model
1. Navigate to the Upload page
2. Upload baseline dataset (CSV)
3. Upload current dataset (CSV)
4. Enable "ML Model Monitoring" toggle
5. Upload your trained model (.pkl file)
6. Enter the target column name (e.g., "target", "label", "class")

### Step 3: Run Analysis
1. Select processing mode (Fast or High Accuracy)
2. Click "Start Drift Analysis"
3. Wait for analysis to complete

### Step 4: Review Results
The dashboard will show:
- Data drift metrics (as before)
- **NEW**: Model Performance Analysis section with:
  - Baseline vs Current accuracy
  - Performance degradation alerts
  - Automated recommendations
  - Suggested fixes

## Testing the Feature

### Generate Sample Data
Run the sample data generator:
```bash
cd backend
python create_sample_model.py
```

This creates:
- `uploads/sample/baseline.csv` - Baseline dataset
- `uploads/sample/current.csv` - Current dataset with drift
- `models/sample/model.pkl` - Trained Random Forest model

### Test via API
```bash
# Create project
curl -X POST http://localhost:8000/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "ML Monitoring Test"}'

# Upload files (use project_id from response)
curl -X POST http://localhost:8000/projects/1/upload-baseline \
  -F "file=@uploads/sample/baseline.csv"

curl -X POST http://localhost:8000/projects/1/upload-current \
  -F "file=@uploads/sample/current.csv"

curl -X POST http://localhost:8000/projects/1/upload-model \
  -F "file=@models/sample/model.pkl"

# Run analysis
curl -X POST http://localhost:8000/projects/1/analyze-model-drift \
  -H "Content-Type: application/json" \
  -d '{"mode": "high_accuracy", "target_column": "target"}'
```

## Architecture

### Backend Components
1. **model_evaluator.py**: Core ML evaluation engine
   - `ModelEvaluator` class
   - `load_model()`: Load pickled models
   - `extract_feature_importance()`: Get feature importance
   - `calculate_metrics()`: Compute performance metrics
   - `evaluate_model()`: Full model evaluation
   - `generate_suggestions()`: Rule-based recommendations

2. **main.py**: API endpoints
   - `/projects/{id}/upload-model`: Model upload
   - `/projects/{id}/analyze-model-drift`: Combined analysis

3. **schemas.py**: Request/response models
   - `ModelDriftRequest`: Analysis request schema

### Frontend Components
1. **UploadPage.jsx**: Enhanced with model upload
   - Model file upload (.pkl)
   - Target column input
   - ML monitoring toggle

2. **DashboardPage.jsx**: Enhanced with model metrics
   - Model Performance Analysis section
   - Accuracy comparison
   - Recommendations display

3. **api.js**: New API methods
   - `uploadModel()`
   - `analyzeModelDrift()`

## Dependencies

Added to `requirements.txt`:
```
scikit-learn>=1.3.0
joblib>=1.3.0
```

Install:
```bash
cd backend
pip install -r requirements.txt
```

## Limitations

- Only supports scikit-learn compatible models
- Binary and multiclass classification only (no regression yet)
- Model file must be in `.pkl` format
- No deep learning model support
- No MLOps infrastructure (model versioning, A/B testing, etc.)

## Future Enhancements

Potential improvements:
- Regression model support
- Deep learning model support (TensorFlow, PyTorch)
- Model versioning and comparison
- Automated retraining triggers
- Integration with MLflow or similar
- Custom metric definitions
- Confusion matrix visualization
- ROC/AUC curve analysis

## Example Output

```
⚠️ Model performance dropped by 17.0%. Baseline accuracy: 91.0%, Current accuracy: 74.0%.

🔴 Critical: 'income' (importance: 0.30) has significant drift with PSI=0.35. 
   Consider retraining the model with updated data.

🔴 Critical: 'age' (importance: 0.15) has significant drift with Wasserstein distance=0.15. 
   Verify feature preprocessing and scaling.

⚠️ 2 important features have drifted. Full model retraining with updated dataset 
   is strongly recommended.
```

## Conclusion

DriftGauge now provides end-to-end ML monitoring:
1. **Detects** data drift using statistical tests
2. **Evaluates** model performance degradation
3. **Identifies** root causes (drifted important features)
4. **Recommends** specific actions to fix issues

This makes it a lightweight but powerful tool for ML model monitoring without heavy MLOps infrastructure.
