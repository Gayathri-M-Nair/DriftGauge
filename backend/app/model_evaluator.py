import pandas as pd
import numpy as np
import joblib
from typing import Dict, List, Tuple, Optional
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from pathlib import Path

class ModelEvaluator:
    """
    Evaluates ML model performance and generates recommendations based on drift analysis
    """
    
    def __init__(self, feature_importance_threshold: float = 0.1, performance_drop_threshold: float = 0.05):
        self.feature_importance_threshold = feature_importance_threshold
        self.performance_drop_threshold = performance_drop_threshold
    
    def load_model(self, model_path: Path):
        """Load a pickled sklearn model"""
        try:
            model = joblib.load(model_path)
            return model
        except Exception as e:
            raise ValueError(f"Failed to load model: {str(e)}")
    
    def extract_feature_importance(self, model) -> Optional[Dict[str, float]]:
        """
        Extract feature importance from model
        Supports models with feature_importances_ or coef_ attributes
        """
        try:
            if hasattr(model, 'feature_importances_'):
                # Tree-based models (Random Forest, Gradient Boosting, XGBoost)
                return model.feature_importances_
            elif hasattr(model, 'coef_'):
                # Linear models (Logistic Regression, Linear SVM)
                # Use absolute values for importance
                return np.abs(model.coef_[0]) if len(model.coef_.shape) > 1 else np.abs(model.coef_)
            else:
                return None
        except Exception as e:
            print(f"Failed to extract feature importance: {str(e)}")
            return None
    
    def calculate_metrics(self, y_true: pd.Series, y_pred: np.ndarray) -> Dict[str, float]:
        """Calculate classification metrics"""
        try:
            # Handle binary and multiclass classification
            average_method = 'binary' if len(np.unique(y_true)) == 2 else 'weighted'
            
            metrics = {
                'accuracy': accuracy_score(y_true, y_pred),
                'precision': precision_score(y_true, y_pred, average=average_method, zero_division=0),
                'recall': recall_score(y_true, y_pred, average=average_method, zero_division=0),
                'f1_score': f1_score(y_true, y_pred, average=average_method, zero_division=0)
            }
            return metrics
        except Exception as e:
            print(f"Failed to calculate metrics: {str(e)}")
            return {
                'accuracy': 0.0,
                'precision': 0.0,
                'recall': 0.0,
                'f1_score': 0.0
            }
    
    def evaluate_model(
            self, 
            model, 
            baseline_df: pd.DataFrame, 
            current_df: pd.DataFrame, 
            target_column: str,
            feature_columns: Optional[List[str]] = None
        ) -> Dict:
            try:
                # Determine training feature order from model if available
                if hasattr(model, 'feature_names_in_'):
                    training_features = list(model.feature_names_in_)
                else:
                    # Fall back to provided or inferred feature columns
                    if feature_columns is None:
                        feature_columns = [col for col in baseline_df.columns if col != target_column]
                    training_features = feature_columns

                def align_features(df: pd.DataFrame) -> pd.DataFrame:
                    """Align dataframe columns to match training feature order"""
                    X = df.drop(columns=[target_column], errors='ignore')
                    # Add missing columns with default value 0
                    for col in training_features:
                        if col not in X.columns:
                            X[col] = 0
                    # Drop unknown columns and reorder to match training order
                    return X[training_features]

                baseline_X = align_features(baseline_df)
                baseline_y = baseline_df[target_column]

                current_X = align_features(current_df)
                current_y = current_df[target_column]

                # Make predictions
                baseline_pred = model.predict(baseline_X)
                current_pred = model.predict(current_X)

                # Calculate metrics
                baseline_metrics = self.calculate_metrics(baseline_y, baseline_pred)
                current_metrics = self.calculate_metrics(current_y, current_pred)

                # Calculate performance drop
                performance_drop = baseline_metrics['accuracy'] - current_metrics['accuracy']

                # Extract feature importance aligned to training features
                feature_importance_values = self.extract_feature_importance(model)
                feature_importance = {}
                if feature_importance_values is not None:
                    for i, feature in enumerate(training_features):
                        if i < len(feature_importance_values):
                            feature_importance[feature] = float(feature_importance_values[i])

                has_degradation = performance_drop > self.performance_drop_threshold

                return {
                    'baseline_metrics': baseline_metrics,
                    'current_metrics': current_metrics,
                    'performance_drop': performance_drop,
                    'has_degradation': has_degradation,
                    'feature_importance': feature_importance,
                    'features_used': training_features
                }

            except Exception as e:
                raise ValueError(f"Model evaluation failed: {str(e)}")

    
    def generate_suggestions(
        self,
        drift_report: Dict,
        model_evaluation: Dict
    ) -> List[str]:
        """
        Generate actionable recommendations using BOTH drift and model performance.

        Combined rules:
        - High drift + performance drop  → retrain
        - High drift + stable perf       → monitor closely
        - Low drift  + performance drop  → data quality / label issue
        - Critical feature (high importance + high drift) → targeted retrain
        """
        suggestions = []

        drifted_features   = drift_report.get('drifted_features', [])
        feature_scores     = drift_report.get('feature_scores', {})
        drift_score        = drift_report.get('drift_score', 0)
        feature_importance = model_evaluation.get('feature_importance', {})
        performance_drop   = model_evaluation.get('performance_drop', 0)
        has_degradation    = model_evaluation.get('has_degradation', False)
        baseline_metrics   = model_evaluation.get('baseline_metrics', {})
        current_metrics    = model_evaluation.get('current_metrics', {})

        high_drift = drift_score >= 0.4 or len(drifted_features) >= 3

        # --- Combined scenario rules ---
        if high_drift and has_degradation:
            suggestions.append(
                f"🔴 High drift ({drift_score:.0%}) combined with performance drop "
                f"({performance_drop*100:.1f}%). Retrain the model on updated data immediately."
            )
        elif high_drift and not has_degradation:
            suggestions.append(
                f"🟡 Significant drift detected ({drift_score:.0%}) but model performance is stable. "
                "Monitor closely — performance may degrade as drift accumulates."
            )
        elif not high_drift and has_degradation:
            suggestions.append(
                f"⚠️ Model performance dropped ({performance_drop*100:.1f}%) without significant feature drift. "
                "Investigate label quality, data pipeline bugs, or hidden covariate shift."
            )

        # --- Performance summary (when model is present) ---
        if baseline_metrics and current_metrics:
            suggestions.append(
                f"📊 Accuracy: {baseline_metrics.get('accuracy', 0)*100:.1f}% (baseline) → "
                f"{current_metrics.get('accuracy', 0)*100:.1f}% (current)."
            )

        # --- Critical features: high importance + significant drift ---
        critical_features = [
            (f, feature_importance[f])
            for f in drifted_features
            if f in feature_importance and feature_importance[f] > self.feature_importance_threshold
        ]
        critical_features.sort(key=lambda x: x[1], reverse=True)

        for feature, importance in critical_features[:3]:
            info = feature_scores.get(feature, {})
            psi  = info.get('psi_score', 0)
            wass = info.get('wasserstein_distance', 0)
            msg  = f"🔴 '{feature}' (importance {importance:.2f}) has drifted"
            if psi >= 0.25:
                msg += f" — PSI={psi:.2f}. Retrain or re-engineer this feature."
            elif wass > 0.1:
                msg += f" — Wasserstein={wass:.2f}. Check preprocessing and scaling."
            else:
                msg += ". Review data collection for this feature."
            suggestions.append(msg)

        # --- Many important features drifted ---
        n_important_drifted = len(critical_features)
        if n_important_drifted >= 3:
            suggestions.append(
                f"⚠️ {n_important_drifted} important features have drifted. "
                "Full dataset retraining is strongly recommended."
            )

        # --- PSI-flagged features not already covered ---
        mentioned = {f for f, _ in critical_features}
        for feature in drifted_features:
            if feature in mentioned:
                continue
            psi = feature_scores.get(feature, {}).get('psi_score', 0)
            if psi >= 0.25:
                suggestions.append(
                    f"🟡 '{feature}' shows population shift (PSI={psi:.2f}). "
                    "Review distribution and consider feature engineering."
                )

        # --- All clear ---
        if not suggestions:
            suggestions.append(
                "✅ No significant issues detected. "
                "Model performance is stable and drift is within acceptable limits."
            )

        return suggestions
    
    def analyze_model_drift(
        self,
        model_path: Path,
        baseline_df: pd.DataFrame,
        current_df: pd.DataFrame,
        target_column: str,
        drift_report: Dict,
        feature_columns: Optional[List[str]] = None
    ) -> Dict:
        """
        Complete model drift analysis pipeline — used by the legacy
        /analyze-model-drift endpoint for backward compatibility.
        """
        model = self.load_model(model_path)

        model_evaluation = self.evaluate_model(
            model, baseline_df, current_df, target_column, feature_columns
        )

        suggestions = self.generate_suggestions(drift_report, model_evaluation)

        model_metrics = {
            'baseline_accuracy':  model_evaluation['baseline_metrics']['accuracy'],
            'baseline_precision': model_evaluation['baseline_metrics']['precision'],
            'baseline_recall':    model_evaluation['baseline_metrics']['recall'],
            'baseline_f1':        model_evaluation['baseline_metrics']['f1_score'],
            'current_accuracy':   model_evaluation['current_metrics']['accuracy'],
            'current_precision':  model_evaluation['current_metrics']['precision'],
            'current_recall':     model_evaluation['current_metrics']['recall'],
            'current_f1':         model_evaluation['current_metrics']['f1_score'],
            'performance_drop':   model_evaluation['performance_drop'],
            'has_degradation':    model_evaluation['has_degradation'],
        }

        # Build unified response — drift fields at top level + model fields
        return {
            **drift_report,
            'model_metrics':      model_metrics,
            'feature_importance': model_evaluation['feature_importance'],
            'suggestions':        suggestions,
        }
