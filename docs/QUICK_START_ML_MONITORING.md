# Quick Start: ML Monitoring Feature

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (if needed)
```bash
cd backend
pip install scikit-learn joblib
```

### Step 2: Generate Sample Data
```bash
cd backend
python create_sample_model.py
```

You should see:
```
✅ Sample data and model created successfully!
Baseline dataset: 10000 rows
Current dataset: 10000 rows
Target column: 'target'
```

### Step 3: Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```

Backend will run on: http://localhost:8000

### Step 4: Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:5173

### Step 5: Test the Feature

1. **Open browser**: http://localhost:5173

2. **Create Project**:
   - Click "+" button in sidebar
   - Name: "ML Monitoring Test"
   - Click "Create"

3. **Upload Data**:
   - Go to "Upload" page
   - Upload baseline: `backend/uploads/sample/baseline.csv`
   - Upload current: `backend/uploads/sample/current.csv`

4. **Enable ML Monitoring**:
   - Toggle "ML Model Monitoring" switch ON
   - Upload model: `backend/models/sample/model.pkl`
   - Enter target column: `target`

5. **Run Analysis**:
   - Select "High Accuracy" mode
   - Click "Start Drift Analysis"
   - Wait ~5-10 seconds

6. **View Results**:
   - Dashboard will show:
     - Data drift metrics
     - **Model Performance Analysis** (NEW!)
     - Baseline vs Current accuracy
     - Automated recommendations

## 📊 Expected Results

### Data Drift
- Some features will show drift (age, income)
- PSI and Wasserstein metrics displayed

### Model Performance
- Baseline Accuracy: ~100%
- Current Accuracy: ~99.9%
- Performance is stable (no degradation)

### Recommendations
You'll see suggestions like:
- "✅ No significant issues detected. Model performance is stable..."

## 🧪 Test with Real Drift

To see performance degradation, modify `create_sample_model.py`:

```python
# Make current data more different
current_data = {
    'age': np.random.normal(55, 15, n_samples).clip(18, 80),  # Much older
    'income': np.random.normal(35000, 20000, n_samples).clip(20000, 150000),  # Lower income
    'credit_score': np.random.normal(600, 80, n_samples).clip(300, 850),  # Much lower scores
    ...
}
```

Then re-run:
```bash
python create_sample_model.py
```

Now you'll see:
- ⚠️ Performance degradation alerts
- 🔴 Critical feature drift warnings
- Specific recommendations to fix issues

## 🎯 What to Look For

### In Upload Page
- [x] ML Monitoring toggle
- [x] Model file upload (.pkl)
- [x] Target column input
- [x] Info box with feature list

### In Dashboard
- [x] Model Performance Analysis section
- [x] Baseline vs Current metrics
- [x] Performance degradation alert (if applicable)
- [x] Recommended Actions list
- [x] Color-coded metrics (green/red)

## 🔧 Troubleshooting

### "Model not uploaded" error
- Make sure you uploaded the .pkl file
- Check file is in `backend/models/{project_id}/model.pkl`

### "Target column not found" error
- Verify target column name matches exactly
- Check both datasets have the column
- Column names are case-sensitive

### "Model evaluation failed" error
- Ensure model is scikit-learn compatible
- Check model was trained on same features
- Verify .pkl file is not corrupted

### Backend not starting
```bash
cd backend
pip install -r requirements.txt
```

### Frontend not starting
```bash
cd frontend
npm install
npm run dev
```

## 📝 API Testing (Optional)

Test via curl:

```bash
# 1. Create project
curl -X POST http://localhost:8000/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "API Test"}'

# 2. Upload files (replace {id} with project ID from step 1)
curl -X POST http://localhost:8000/projects/{id}/upload-baseline \
  -F "file=@backend/uploads/sample/baseline.csv"

curl -X POST http://localhost:8000/projects/{id}/upload-current \
  -F "file=@backend/uploads/sample/current.csv"

curl -X POST http://localhost:8000/projects/{id}/upload-model \
  -F "file=@backend/models/sample/model.pkl"

# 3. Run analysis
curl -X POST http://localhost:8000/projects/{id}/analyze-model-drift \
  -H "Content-Type: application/json" \
  -d '{"mode": "high_accuracy", "target_column": "target"}'
```

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Sample data generated
- [ ] Project created
- [ ] Datasets uploaded
- [ ] Model uploaded
- [ ] Target column entered
- [ ] Analysis completed
- [ ] Dashboard shows model metrics
- [ ] Recommendations displayed

## 🎉 You're Done!

DriftGauge is now monitoring both:
1. **Data Drift** - Distribution changes
2. **Model Performance** - Accuracy degradation
3. **Root Causes** - Which features caused issues

## 📚 Next Steps

- Read `ML_MONITORING_FEATURE.md` for detailed docs
- Try with your own models
- Customize recommendation rules
- Explore different drift scenarios

---

**Need help?** Check the full documentation in `ML_MONITORING_FEATURE.md`
