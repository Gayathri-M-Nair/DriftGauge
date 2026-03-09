import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple

class DriftDetector:
    def __init__(self, threshold: float = 0.05):
        self.threshold = threshold
    
    def preprocess(self, baseline_df: pd.DataFrame, current_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Align columns and filter compatible features"""
        common_cols = list(set(baseline_df.columns) & set(current_df.columns))
        baseline_clean = baseline_df[common_cols].dropna()
        current_clean = current_df[common_cols].dropna()
        return baseline_clean, current_clean
    
    def detect_drift(self, baseline_df: pd.DataFrame, current_df: pd.DataFrame, mode: str = "fast") -> Dict:
        """Run drift detection analysis"""
        baseline_clean, current_clean = self.preprocess(baseline_df, current_df)
        
        drifted_features = []
        feature_scores = {}
        
        for col in baseline_clean.columns:
            if pd.api.types.is_numeric_dtype(baseline_clean[col]):
                ks_stat, p_value = stats.ks_2samp(baseline_clean[col], current_clean[col])
                feature_scores[col] = {"ks_statistic": ks_stat, "p_value": p_value}
                
                if p_value < self.threshold:
                    drifted_features.append(col)
        
        drift_score = len(drifted_features) / len(baseline_clean.columns) if baseline_clean.columns.size > 0 else 0
        
        return {
            "drift_score": drift_score,
            "drifted_features": drifted_features,
            "feature_scores": feature_scores,
            "total_features": len(baseline_clean.columns)
        }
