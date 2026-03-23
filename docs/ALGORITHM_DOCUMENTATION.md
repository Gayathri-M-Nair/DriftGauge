# DriftGauge Algorithm Documentation

## Overview
DriftGauge provides two processing modes for data drift detection: **Fast Mode** and **High Accuracy Mode**. This document explains the algorithms, statistical methods, and implementation details for each mode.

---

## Current Implementation Status

### ⚠️ Important Note
Currently, both modes use the **same underlying algorithm** (Kolmogorov-Smirnov test). The mode parameter is accepted but doesn't change the analysis method yet. This document describes:
1. What is **currently implemented**
2. What **should be implemented** for production use

---

## Currently Implemented Algorithm

### Statistical Method: Kolmogorov-Smirnov (KS) Test

**What it does:**
- Compares the cumulative distribution functions (CDFs) of two datasets
- Measures the maximum distance between the two CDFs
- Tests whether two samples come from the same distribution

**Implementation:**
```python
from scipy import stats

ks_stat, p_value = stats.ks_2samp(baseline_data, current_data)
```

**Metrics Returned:**
- **KS Statistic**: Range [0, 1], higher = more drift
- **P-Value**: Statistical significance (< 0.05 = significant drift)

**Drift Classification:**
- P-value ≥ 0.05 → **No Drift** (distributions are similar)
- P-value 0.01-0.05 → **Moderate Drift** (some change detected)
- P-value < 0.01 → **Significant Drift** (major distribution shift)

---

## Recommended Production Implementation

### Fast Mode (Quick Drift Check)

**Target Processing Time:** ~10 seconds

**Algorithms to Implement:**

#### 1. Population Stability Index (PSI)
```
PSI = Σ (Actual% - Expected%) × ln(Actual% / Expected%)
```

**Advantages:**
- Very fast computation
- Industry standard for monitoring
- Easy to interpret

**Thresholds:**
- PSI < 0.1: No significant change
- PSI 0.1-0.25: Moderate change
- PSI > 0.25: Significant change

#### 2. Kolmogorov-Smirnov Test (Current)
- Already implemented
- Fast for univariate analysis
- Non-parametric (no distribution assumptions)

#### 3. Data Sampling Strategy
```python
# Sample 10-20% of data for faster processing
sample_size = min(10000, len(baseline_df) * 0.2)
baseline_sample = baseline_df.sample(n=sample_size)
current_sample = current_df.sample(n=sample_size)
```

**Fast Mode Features:**
- ✅ Quick statistical tests
- ✅ Sampling for large datasets
- ✅ Approximate drift alerts
- ✅ Suitable for real-time monitoring

---

### High Accuracy Mode (Comprehensive Analysis)

**Target Processing Time:** ~5 minutes

**Algorithms to Implement:**

#### 1. Multivariate Drift Detection (MMD)
**Maximum Mean Discrepancy** - Measures distance between distributions in high-dimensional space

```python
from sklearn.metrics.pairwise import rbf_kernel

def compute_mmd(X, Y):
    XX = rbf_kernel(X, X)
    YY = rbf_kernel(Y, Y)
    XY = rbf_kernel(X, Y)
    return XX.mean() + YY.mean() - 2 * XY.mean()
```

**Advantages:**
- Captures multivariate relationships
- Detects complex drift patterns
- More sensitive than univariate tests

#### 2. Wasserstein Distance (Earth Mover's Distance)
```python
from scipy.stats import wasserstein_distance

w_distance = wasserstein_distance(baseline, current)
```

**Advantages:**
- Measures "cost" to transform one distribution to another
- Robust to outliers
- Interpretable metric

#### 3. Concept Drift Detection
**Monitors changes in the relationship between features and target**

```python
# Compare model performance on baseline vs current
baseline_accuracy = model.score(baseline_X, baseline_y)
current_accuracy = model.score(current_X, current_y)
concept_drift = abs(baseline_accuracy - current_accuracy)
```

#### 4. Feature Importance Analysis
**Identifies which features contribute most to drift**

```python
from sklearn.ensemble import RandomForestClassifier

# Train classifier to distinguish baseline vs current
combined_data = pd.concat([baseline, current])
labels = [0]*len(baseline) + [1]*len(current)

clf = RandomForestClassifier()
clf.fit(combined_data, labels)
feature_importance = clf.feature_importances_
```

#### 5. Statistical Tests Suite
- **Chi-Square Test** (categorical features)
- **KS Test** (continuous features)
- **Jensen-Shannon Divergence** (distribution similarity)
- **Cramér's V** (categorical association)

**High Accuracy Mode Features:**
- ✅ Full dataset analysis (no sampling)
- ✅ Multiple statistical tests
- ✅ Multivariate drift detection
- ✅ Feature importance ranking
- ✅ Concept drift analysis
- ✅ Detailed distribution comparisons

---

## Implementation Roadmap

### Phase 1: Current State ✅
- [x] Basic KS test implementation
- [x] P-value based drift detection
- [x] Feature-level drift scores
- [x] UI for both modes

### Phase 2: Fast Mode Enhancement
- [ ] Implement PSI calculation
- [ ] Add data sampling strategy
- [ ] Optimize for speed (<10 seconds)
- [ ] Add quick summary statistics

### Phase 3: High Accuracy Mode Enhancement
- [ ] Implement MMD for multivariate drift
- [ ] Add Wasserstein distance
- [ ] Implement concept drift detection
- [ ] Add feature importance analysis
- [ ] Implement Chi-Square for categorical features
- [ ] Add Jensen-Shannon divergence

### Phase 4: Advanced Features
- [ ] Time-series drift detection
- [ ] Automated drift alerts
- [ ] Drift explanation with SHAP values
- [ ] Custom threshold configuration
- [ ] Drift trend visualization

---

## Code Structure

### Current Implementation
```
backend/app/drift_engine.py
├── DriftDetector class
│   ├── preprocess() - Data cleaning and alignment
│   ├── detect_drift() - Main drift detection (KS test)
│   └── threshold - Significance level (default: 0.05)
```

### Recommended Structure
```
backend/app/drift_engine.py
├── DriftDetector class
│   ├── detect_drift_fast() - Fast mode algorithms
│   │   ├── calculate_psi()
│   │   ├── ks_test_sampled()
│   │   └── quick_summary()
│   │
│   ├── detect_drift_accurate() - High accuracy algorithms
│   │   ├── compute_mmd()
│   │   ├── wasserstein_distance()
│   │   ├── concept_drift_analysis()
│   │   ├── feature_importance()
│   │   └── comprehensive_tests()
│   │
│   └── preprocess() - Data preparation
```

---

## Performance Comparison

| Metric | Fast Mode | High Accuracy Mode |
|--------|-----------|-------------------|
| **Processing Time** | ~10 seconds | ~5 minutes |
| **Dataset Size** | Sampled (10-20%) | Full dataset |
| **Statistical Tests** | 2-3 tests | 5+ tests |
| **Multivariate Analysis** | No | Yes |
| **Feature Importance** | No | Yes |
| **Concept Drift** | No | Yes |
| **Use Case** | Real-time monitoring | Deep analysis |

---

## Statistical Interpretation Guide

### P-Value Interpretation
- **p < 0.01**: Strong evidence of drift (99% confidence)
- **p < 0.05**: Moderate evidence of drift (95% confidence)
- **p ≥ 0.05**: No significant drift detected

### KS Statistic Interpretation
- **0.0 - 0.1**: Minimal drift
- **0.1 - 0.3**: Moderate drift
- **0.3 - 1.0**: Significant drift

### PSI Interpretation (To be implemented)
- **< 0.1**: No significant population change
- **0.1 - 0.25**: Moderate population change
- **> 0.25**: Significant population shift

---

## References

1. **Kolmogorov-Smirnov Test**: Massey Jr, F. J. (1951). "The Kolmogorov-Smirnov test for goodness of fit"
2. **Population Stability Index**: Siddiqi, N. (2006). "Credit Risk Scorecards"
3. **Maximum Mean Discrepancy**: Gretton et al. (2012). "A Kernel Two-Sample Test"
4. **Wasserstein Distance**: Ramdas et al. (2017). "On Wasserstein Two-Sample Testing"
5. **Concept Drift**: Gama et al. (2014). "A Survey on Concept Drift Adaptation"

---

## Next Steps for Development

1. **Implement PSI calculation** for Fast Mode
2. **Add sampling strategy** to reduce processing time
3. **Implement MMD** for multivariate drift detection
4. **Add feature importance** analysis
5. **Create comprehensive test suite** for validation
6. **Add performance benchmarks** for both modes
7. **Implement caching** for repeated analyses

---

**Last Updated:** March 2026  
**Version:** 1.0  
**Status:** Documentation for current and planned features
