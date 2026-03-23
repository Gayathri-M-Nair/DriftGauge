# PSI and Multi-Criteria Drift Detection - Implementation Summary

## Overview
Enhanced the DriftGauge drift detection engine with Population Stability Index (PSI) calculation and multi-criteria drift classification for more accurate and comprehensive drift detection.

---

## Key Improvements Implemented

### 1. ✅ Population Stability Index (PSI) Calculation

**New Method: `calculate_psi()`**

```python
def calculate_psi(self, expected: pd.Series, actual: pd.Series, bins: int = 10) -> float
```

**What it does:**
- Measures population distribution shift between baseline and current data
- Discretizes data into bins and compares percentage distributions
- Returns absolute PSI score

**PSI Interpretation:**
- **PSI < 0.1**: No significant change ✅
- **0.1 ≤ PSI < 0.25**: Moderate drift ⚠️
- **PSI ≥ 0.25**: Significant drift 🚨

**Implementation Details:**
- Uses 10 bins by default (configurable)
- Handles edge cases with -inf and +inf boundaries
- Adds epsilon (1e-6) to avoid division by zero
- Returns 0.0 if calculation fails

---

### 2. ✅ Multi-Criteria Drift Detection

**High Accuracy Mode now uses THREE criteria:**

A feature is marked as **drifted** if **ANY** of these conditions are true:

1. **KS Test**: `p_value < 0.05` (statistical significance)
2. **Wasserstein Distance**: `w_distance > 0.1` (distribution shift)
3. **PSI Score**: `psi_score >= 0.25` (population change)

**Code Implementation:**
```python
is_drifted = (
    p_value < self.threshold or 
    w_distance > self.wasserstein_threshold or 
    psi_score >= self.psi_threshold
)
```

**Benefits:**
- More sensitive drift detection
- Catches different types of distribution changes
- Reduces false negatives
- Provides multiple perspectives on drift

---

### 3. ✅ Configurable Thresholds

**New Constructor Parameters:**
```python
def __init__(self, 
             threshold: float = 0.05,              # KS test p-value
             wasserstein_threshold: float = 0.1,   # Wasserstein distance
             psi_threshold: float = 0.25):         # PSI score
```

**Thresholds returned in response:**
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

### 4. ✅ Fixed Drift Score Calculation

**Problem:** Previously calculated drift score using all columns (including non-numeric)

**Solution:** Now uses only numeric columns

**New Method:**
```python
def get_numeric_columns(self, df: pd.DataFrame) -> List[str]:
    return [col for col in df.columns if pd.api.types.is_numeric_dtype(df[col])]
```

**Updated Calculation:**
```python
numeric_cols = self.get_numeric_columns(baseline_df)
drift_score = len(drifted_features) / len(numeric_cols)
```

**Impact:**
- More accurate drift score percentage
- Excludes categorical/text columns from calculation
- Consistent across both modes

---

## Backend Changes

### File: `backend/app/drift_engine.py`

#### New Imports
```python
import numpy as np  # For PSI calculation
```

#### New Methods
1. `calculate_psi()` - PSI calculation
2. `get_numeric_columns()` - Filter numeric columns

#### Updated Methods

**`detect_drift_fast()`:**
- ✅ Uses `get_numeric_columns()` for accurate drift score
- ✅ Iterates only over numeric columns
- ⚡ Still fast (KS test only)

**`detect_drift_accurate()`:**
- ✅ Calculates PSI for each feature
- ✅ Stores PSI in `feature_scores`
- ✅ Multi-criteria drift detection
- ✅ Returns thresholds in response
- 🎯 More comprehensive analysis

---

## Frontend Changes

### 1. Dashboard Table (`frontend/src/pages/DashboardPage.jsx`)

**Added PSI Column (High Accuracy Mode only):**
```jsx
{analysis.mode === 'high_accuracy' && (
  <>
    <th>Wasserstein</th>
    <th>PSI</th>
  </>
)}
```

**Color-Coded PSI Values:**
- 🔴 Red: PSI ≥ 0.25 (Significant)
- 🟡 Yellow: 0.1 ≤ PSI < 0.25 (Moderate)
- 🟢 Green: PSI < 0.1 (No change)

### 2. Feature Detail Panel (`frontend/src/components/FeatureDetailPanel.jsx`)

**Added PSI Metric Card:**
- Shows PSI score with color coding
- Displays interpretation text
- Only visible in High Accuracy Mode

**New Section: Drift Detection Criteria**
Shows which criteria triggered the drift:
- ✓ KS Test (p-value < 0.05)
- ✓ Wasserstein Distance (> 0.1)
- ✓ PSI Score (≥ 0.25)

Each criterion shows:
- ✓ Drifted (red) if threshold exceeded
- ✗ No Drift (green) if within threshold

---

## Example Output Comparison

### Fast Mode (Unchanged)
```json
{
  "mode": "fast",
  "drift_score": 0.33,
  "drifted_features": ["age"],
  "feature_scores": {
    "age": {
      "ks_statistic": 0.245,
      "p_value": 0.002
    }
  },
  "total_features": 3,
  "processing_time": 1.23
}
```

### High Accuracy Mode (Enhanced)
```json
{
  "mode": "high_accuracy",
  "drift_score": 0.67,
  "drifted_features": ["age", "income"],
  "feature_scores": {
    "age": {
      "ks_statistic": 0.245,
      "p_value": 0.002,
      "wasserstein_distance": 0.089,
      "psi_score": 0.156,
      "mean_shift": 2.1,
      "std_shift": 0.8,
      "baseline_mean": 35.2,
      "current_mean": 37.3,
      "baseline_std": 12.4,
      "current_std": 13.2
    },
    "income": {
      "ks_statistic": 0.123,
      "p_value": 0.089,
      "wasserstein_distance": 0.145,
      "psi_score": 0.287,
      "mean_shift": 5420.5,
      "std_shift": 1230.2,
      "baseline_mean": 52000,
      "current_mean": 57420.5,
      "baseline_std": 15000,
      "current_std": 16230.2
    }
  },
  "total_features": 3,
  "processing_time": 8.76,
  "thresholds": {
    "p_value": 0.05,
    "wasserstein": 0.1,
    "psi": 0.25
  }
}
```

**Note:** In this example, "income" is flagged as drifted because:
- KS test: p_value = 0.089 (> 0.05) ✗
- Wasserstein: 0.145 (> 0.1) ✓ **DRIFTED**
- PSI: 0.287 (≥ 0.25) ✓ **DRIFTED**

Without multi-criteria detection, "income" would have been missed!

---

## Impact Analysis

### Before Enhancement
- **Drift Detection**: KS test only
- **False Negatives**: Higher (missed subtle drifts)
- **Metrics**: 2 (KS statistic, p-value)
- **Drift Score**: Inaccurate (included non-numeric columns)

### After Enhancement
- **Drift Detection**: KS + Wasserstein + PSI
- **False Negatives**: Lower (catches more drift types)
- **Metrics**: 5+ (KS, p-value, Wasserstein, PSI, mean/std shifts)
- **Drift Score**: Accurate (numeric columns only)

---

## Testing Scenarios

### Scenario 1: Subtle Mean Shift
- **Data**: Mean changes but distribution shape similar
- **KS Test**: May not detect (p > 0.05)
- **Wasserstein**: Likely detects (distance > 0.1)
- **PSI**: Likely detects (PSI ≥ 0.25)
- **Result**: ✅ Caught by multi-criteria

### Scenario 2: Distribution Shape Change
- **Data**: Same mean but different variance
- **KS Test**: Likely detects (p < 0.05)
- **Wasserstein**: Likely detects
- **PSI**: May or may not detect
- **Result**: ✅ Caught by multiple criteria

### Scenario 3: Population Shift
- **Data**: Different population segments
- **KS Test**: May not detect
- **Wasserstein**: May detect
- **PSI**: Likely detects (PSI ≥ 0.25)
- **Result**: ✅ Caught by PSI

---

## Configuration Options

### Adjusting Thresholds

**More Sensitive (catch more drift):**
```python
detector = DriftDetector(
    threshold=0.1,              # Less strict KS test
    wasserstein_threshold=0.05, # Lower Wasserstein threshold
    psi_threshold=0.1           # Lower PSI threshold
)
```

**Less Sensitive (reduce false positives):**
```python
detector = DriftDetector(
    threshold=0.01,             # Stricter KS test
    wasserstein_threshold=0.2,  # Higher Wasserstein threshold
    psi_threshold=0.3           # Higher PSI threshold
)
```

---

## Files Modified

1. ✅ `backend/app/drift_engine.py`
   - Added PSI calculation
   - Multi-criteria drift detection
   - Fixed drift score calculation
   - Added configurable thresholds

2. ✅ `frontend/src/pages/DashboardPage.jsx`
   - Added PSI column to table
   - Color-coded PSI values

3. ✅ `frontend/src/components/FeatureDetailPanel.jsx`
   - Added PSI metric card
   - Added drift criteria explanation
   - Shows which criteria triggered drift

---

## Next Steps

### Potential Enhancements
1. **Categorical Features**: Add Chi-Square test for categorical drift
2. **Time Series**: Add temporal drift detection
3. **Multivariate**: Add correlation drift detection
4. **Visualization**: Add PSI distribution charts
5. **Alerts**: Configurable alerts per metric
6. **Custom Thresholds**: Per-feature threshold configuration

### Performance Optimization
1. Vectorize PSI calculation for speed
2. Parallel processing for multiple features
3. Cache PSI bins for repeated analyses
4. Optimize histogram calculations

---

## References

1. **PSI**: Siddiqi, N. (2006). "Credit Risk Scorecards"
2. **Wasserstein Distance**: Ramdas et al. (2017). "On Wasserstein Two-Sample Testing"
3. **Multi-Criteria Detection**: Industry best practices for ML monitoring

---

**Implementation Date:** March 2026  
**Version:** 2.0  
**Status:** ✅ Complete and Ready for Testing
