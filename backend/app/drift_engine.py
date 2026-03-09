import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import wasserstein_distance
from typing import Dict, List, Tuple
import time

class DriftDetector:
    def __init__(self, threshold: float = 0.05, wasserstein_threshold: float = 0.1, psi_threshold: float = 0.25):
        self.threshold = threshold  # KS test p-value threshold
        self.wasserstein_threshold = wasserstein_threshold  # Wasserstein distance threshold
        self.psi_threshold = psi_threshold  # PSI threshold for significant drift
    
    def preprocess(self, baseline_df: pd.DataFrame, current_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Align columns and filter compatible features"""
        common_cols = list(set(baseline_df.columns) & set(current_df.columns))
        baseline_clean = baseline_df[common_cols].dropna()
        current_clean = current_df[common_cols].dropna()
        return baseline_clean, current_clean
    
    def apply_sampling(self, baseline_df: pd.DataFrame, current_df: pd.DataFrame, sample_size: int = 5000) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Apply sampling for Fast Mode to reduce processing time"""
        baseline_sample_size = min(sample_size, len(baseline_df))
        current_sample_size = min(sample_size, len(current_df))
        
        baseline_sampled = baseline_df.sample(n=baseline_sample_size, random_state=42)
        current_sampled = current_df.sample(n=current_sample_size, random_state=42)
        
        return baseline_sampled, current_sampled
    
    def calculate_psi(self, expected: pd.Series, actual: pd.Series, bins: int = 10) -> float:
        """
        Calculate Population Stability Index (PSI)
        
        PSI measures the shift in population distribution between two datasets.
        
        Interpretation:
        - PSI < 0.1: No significant change
        - 0.1 ≤ PSI < 0.25: Moderate drift
        - PSI ≥ 0.25: Significant drift
        
        Args:
            expected: Baseline/reference data
            actual: Current/production data
            bins: Number of bins for discretization
        
        Returns:
            PSI score (float)
        """
        try:
            # Create bins based on expected distribution
            breakpoints = np.linspace(expected.min(), expected.max(), bins + 1)
            breakpoints[0] = -np.inf  # Handle edge cases
            breakpoints[-1] = np.inf
            
            # Calculate percentage of samples in each bin
            expected_counts = np.histogram(expected, bins=breakpoints)[0]
            actual_counts = np.histogram(actual, bins=breakpoints)[0]
            
            # Convert to percentages
            expected_perc = expected_counts / len(expected)
            actual_perc = actual_counts / len(actual)
            
            # Add small epsilon to avoid division by zero
            epsilon = 1e-6
            expected_perc = expected_perc + epsilon
            actual_perc = actual_perc + epsilon
            
            # Calculate PSI
            psi = np.sum((actual_perc - expected_perc) * np.log(actual_perc / expected_perc))
            
            return abs(psi)  # Return absolute value
        except Exception as e:
            # Return 0 if calculation fails
            return 0.0
    
    def get_numeric_columns(self, df: pd.DataFrame) -> List[str]:
        """Get list of numeric columns from dataframe"""
        return [col for col in df.columns if pd.api.types.is_numeric_dtype(df[col])]
    
    def detect_drift_fast(self, baseline_df: pd.DataFrame, current_df: pd.DataFrame) -> Dict:
        """
        Fast Mode: Speed-optimized drift detection
        - Uses data sampling (max 5000 rows)
        - Runs only KS test
        - Prioritizes speed over depth
        """
        start_time = time.time()
        
        # Apply sampling for speed
        baseline_sampled, current_sampled = self.apply_sampling(baseline_df, current_df, sample_size=5000)
        
        drifted_features = []
        feature_scores = {}
        
        # Get only numeric columns
        numeric_cols = self.get_numeric_columns(baseline_sampled)
        
        for col in numeric_cols:
            # Run KS test only
            ks_stat, p_value = stats.ks_2samp(baseline_sampled[col], current_sampled[col])
            feature_scores[col] = {
                "ks_statistic": ks_stat,
                "p_value": p_value
            }
            
            # Drift decision based on KS test only
            if p_value < self.threshold:
                drifted_features.append(col)
        
        # Calculate drift score based on numeric columns only
        drift_score = len(drifted_features) / len(numeric_cols) if len(numeric_cols) > 0 else 0
        processing_time = time.time() - start_time
        
        return {
            "mode": "fast",
            "drift_score": drift_score,
            "drifted_features": drifted_features,
            "feature_scores": feature_scores,
            "total_features": len(numeric_cols),
            "processing_time": round(processing_time, 2),
            "samples_used": {
                "baseline": len(baseline_sampled),
                "current": len(current_sampled)
            }
        }
    
    def detect_drift_accurate(self, baseline_df: pd.DataFrame, current_df: pd.DataFrame) -> Dict:
        """
        High Accuracy Mode: Comprehensive drift detection
        - Uses full dataset (no sampling)
        - Runs KS test
        - Computes Wasserstein distance
        - Calculates PSI (Population Stability Index)
        - Multi-criteria drift detection
        """
        start_time = time.time()
        
        drifted_features = []
        feature_scores = {}
        
        # Get only numeric columns
        numeric_cols = self.get_numeric_columns(baseline_df)
        
        for col in numeric_cols:
            # Run KS test
            ks_stat, p_value = stats.ks_2samp(baseline_df[col], current_df[col])
            
            # Compute Wasserstein distance (Earth Mover's Distance)
            w_distance = wasserstein_distance(baseline_df[col], current_df[col])
            
            # Calculate PSI (Population Stability Index)
            psi_score = self.calculate_psi(baseline_df[col], current_df[col])
            
            # Calculate additional statistics
            baseline_mean = baseline_df[col].mean()
            current_mean = current_df[col].mean()
            mean_shift = abs(current_mean - baseline_mean)
            
            baseline_std = baseline_df[col].std()
            current_std = current_df[col].std()
            std_shift = abs(current_std - baseline_std)
            
            # Store all metrics
            feature_scores[col] = {
                "ks_statistic": ks_stat,
                "p_value": p_value,
                "wasserstein_distance": w_distance,
                "psi_score": psi_score,
                "mean_shift": mean_shift,
                "std_shift": std_shift,
                "baseline_mean": baseline_mean,
                "current_mean": current_mean,
                "baseline_std": baseline_std,
                "current_std": current_std
            }
            
            # Multi-criteria drift detection
            # A feature is drifted if ANY of these conditions are true:
            # 1. KS test shows statistical significance (p_value < threshold)
            # 2. Wasserstein distance exceeds threshold
            # 3. PSI indicates significant drift
            is_drifted = (
                p_value < self.threshold or 
                w_distance > self.wasserstein_threshold or 
                psi_score >= self.psi_threshold
            )
            
            if is_drifted:
                drifted_features.append(col)
        
        # Calculate drift score based on numeric columns only
        drift_score = len(drifted_features) / len(numeric_cols) if len(numeric_cols) > 0 else 0
        processing_time = time.time() - start_time
        
        return {
            "mode": "high_accuracy",
            "drift_score": drift_score,
            "drifted_features": drifted_features,
            "feature_scores": feature_scores,
            "total_features": len(numeric_cols),
            "processing_time": round(processing_time, 2),
            "samples_used": {
                "baseline": len(baseline_df),
                "current": len(current_df)
            },
            "thresholds": {
                "p_value": self.threshold,
                "wasserstein": self.wasserstein_threshold,
                "psi": self.psi_threshold
            }
        }
    
    def detect_drift(self, baseline_df: pd.DataFrame, current_df: pd.DataFrame, mode: str = "fast") -> Dict:
        """
        Main drift detection method that routes to appropriate mode
        
        Args:
            baseline_df: Reference/training dataset
            current_df: Production/current dataset
            mode: "fast" or "high_accuracy"
        
        Returns:
            Dictionary containing drift analysis results
        """
        # Preprocess data
        baseline_clean, current_clean = self.preprocess(baseline_df, current_df)
        
        # Route to appropriate detection method
        if mode == "fast":
            return self.detect_drift_fast(baseline_clean, current_clean)
        elif mode == "high_accuracy":
            return self.detect_drift_accurate(baseline_clean, current_clean)
        else:
            # Default to fast mode if invalid mode specified
            return self.detect_drift_fast(baseline_clean, current_clean)
