# PSI and Wasserstein Showing "N/A" - Explanation and Solution

## Why Are PSI and Wasserstein Showing "N/A"?

### Reason 1: Old Analysis (Most Common)
The analysis you're viewing was run **before** the PSI and Wasserstein features were implemented. Old analyses stored in the database don't have these metrics.

**How to identify:**
- Dashboard shows "high_accuracy" mode
- PSI and Wasserstein columns appear
- But values show "N/A"
- Yellow warning appears: "⚠️ This analysis was run with an older version"

### Reason 2: Fast Mode Analysis
Fast Mode intentionally doesn't calculate PSI or Wasserstein to prioritize speed.

**How to identify:**
- Mode badge shows "Fast Mode"
- PSI and Wasserstein columns don't appear at all
- Only KS statistic and p-value are shown

---

## Solution: Run a New Analysis

### Step 1: Go to Upload Page
Click "Upload Datasets" in the sidebar

### Step 2: Upload Your Datasets
- Upload baseline (reference) dataset
- Upload current (production) dataset

### Step 3: Select High Accuracy Mode
Make sure "High Accuracy Mode" is selected (not Fast Mode)

### Step 4: Run Analysis
Click "Start Drift Analysis"

### Step 5: View Results
The dashboard will now show:
- ✅ Wasserstein Distance values
- ✅ PSI Score values
- ✅ Color-coded PSI (red/yellow/green)
- ✅ All enhanced metrics

---

## What Each Metric Means

### Wasserstein Distance
- **What it is**: Earth Mover's Distance - measures how much "work" is needed to transform one distribution into another
- **Range**: 0 to ∞ (higher = more drift)
- **Threshold**: > 0.1 indicates drift
- **Color**: Purple text

### PSI (Population Stability Index)
- **What it is**: Measures population distribution shift
- **Range**: 0 to ∞ (higher = more drift)
- **Interpretation**:
  - < 0.1: No significant change (green)
  - 0.1 - 0.25: Moderate drift (yellow)
  - ≥ 0.25: Significant drift (red)

---

## Example: Before and After

### Before (Old Analysis)
```
Feature      | Drift Score | P-Value | Wasserstein | PSI    | Status
-------------|-------------|---------|-------------|--------|------------------
age          | 0.639       | 0.0000  | N/A         | N/A    | Significant Drift
income       | 0.302       | 0.0000  | N/A         | N/A    | Significant Drift
```

### After (New Analysis with PSI)
```
Feature      | Drift Score | P-Value | Wasserstein | PSI    | Status
-------------|-------------|---------|-------------|--------|------------------
age          | 0.639       | 0.0000  | 0.145       | 0.287  | Significant Drift
income       | 0.302       | 0.0000  | 0.089       | 0.156  | Significant Drift
```

---

## Technical Details

### What Changed in the Code

**Old High Accuracy Mode:**
```python
feature_scores[col] = {
    "ks_statistic": ks_stat,
    "p_value": p_value,
    "wasserstein_distance": w_distance,  # Added but not used in drift decision
    "mean_shift": mean_shift,
    "std_shift": std_shift
}

# Drift decision
if p_value < self.threshold:
    drifted_features.append(col)
```

**New High Accuracy Mode:**
```python
feature_scores[col] = {
    "ks_statistic": ks_stat,
    "p_value": p_value,
    "wasserstein_distance": w_distance,
    "psi_score": psi_score,  # NEW!
    "mean_shift": mean_shift,
    "std_shift": std_shift
}

# Multi-criteria drift decision
is_drifted = (
    p_value < self.threshold or           # KS test
    w_distance > self.wasserstein_threshold or  # Wasserstein
    psi_score >= self.psi_threshold       # PSI (NEW!)
)
```

---

## Database Migration Note

### Why Don't Old Analyses Update Automatically?

Old analyses are stored as JSON in the database. They contain:
```json
{
  "feature_scores": {
    "age": {
      "ks_statistic": 0.639,
      "p_value": 0.0000
      // No wasserstein_distance or psi_score
    }
  }
}
```

**We don't automatically recalculate** because:
1. Original datasets may not be available
2. Would require re-running analysis on all historical data
3. Historical records should remain as they were

**Solution**: Run new analyses to get new metrics

---

## Identifying Analysis Version

### Visual Indicators

**Old Analysis:**
- Yellow warning banner: "⚠️ This analysis was run with an older version"
- PSI/Wasserstein show "N/A"
- No `thresholds` field in report

**New Analysis:**
- No warning banner
- PSI/Wasserstein show actual values
- Has `thresholds` field in report:
  ```json
  {
    "thresholds": {
      "p_value": 0.05,
      "wasserstein": 0.1,
      "psi": 0.25
    }
  }
  ```

---

## FAQ

### Q: Can I update old analyses to show PSI?
**A:** No, you need to run a new analysis with the same datasets.

### Q: Will Fast Mode ever show PSI?
**A:** No, Fast Mode is optimized for speed and only uses KS test.

### Q: Why do some features show PSI but others show N/A?
**A:** This shouldn't happen in a new analysis. If it does, the feature might be non-numeric or have calculation errors.

### Q: What if I want to compare old and new analyses?
**A:** Run a new analysis with the same datasets, then compare in Analysis History.

### Q: Can I delete old analyses?
**A:** Currently no, but this feature can be added. Old analyses don't affect new ones.

---

## Quick Checklist

To see PSI and Wasserstein values:

- [ ] Go to Upload Datasets page
- [ ] Upload baseline CSV file
- [ ] Upload current CSV file
- [ ] Select "High Accuracy Mode"
- [ ] Click "Start Drift Analysis"
- [ ] Wait for analysis to complete
- [ ] View Dashboard
- [ ] Verify PSI and Wasserstein columns show values (not N/A)
- [ ] No yellow warning banner appears

---

## Summary

**The "N/A" values are expected behavior for:**
1. ✅ Old analyses (run before PSI was implemented)
2. ✅ Fast Mode analyses (intentionally excluded)

**To get PSI and Wasserstein values:**
1. ✅ Run a new High Accuracy Mode analysis
2. ✅ Use the latest version of the code
3. ✅ Ensure datasets are uploaded correctly

**The system is working correctly** - it just needs a fresh analysis to populate the new metrics!

---

**Last Updated:** March 2026  
**Status:** Working as Designed
