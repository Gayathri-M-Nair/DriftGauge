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
        Generate actionable recommendations based on drift and model performance
        
        Args:
            drift_report: Drift detection results
            model_evaluation: Model evaluation results
        
        Returns:
            List of recommendation strings
        """
        suggestions = []
        
        # Get drifted features and feature importance
        drifted_features = drift_report.get('drifted_features', [])
        feature_scores = drift_report.get('feature_scores', {})
        feature_importance = model_evaluation.get('feature_importance', {})
        performance_drop = model_evaluation.get('performance_drop', 0)
        has_degradation = model_evaluation.get('has_degradation', False)
        
        # Rule 1: Overall performance degradation
        if has_degradation:
            suggestions.append(
                f"⚠️ Model performance dropped by {performance_drop*100:.1f}%. "
                f"Baseline accuracy: {model_evaluation['baseline_metrics']['accuracy']*100:.1f}%, "
                f"Current accuracy: {model_evaluation['current_metrics']['accuracy']*100:.1f}%."
            )
        
        # Rule 2: Identify critical drifted features (high importance + significant drift)
        critical_features = []
        for feature in drifted_features:
            if feature in feature_importance:
                importance = feature_importance[feature]
                if importance > self.feature_importance_threshold:
                    critical_features.append((feature, importance))
        
        if critical_features:
            # Sort by importance
            critical_features.sort(key=lambda x: x[1], reverse=True)
            
            for feature, importance in critical_features[:3]:  # Top 3
                feature_info = feature_scores.get(feature, {})
                psi = feature_info.get('psi_score', 0)
                wasserstein = feature_info.get('wasserstein_distance', 0)
                
                suggestion = f"🔴 Critical: '{feature}' (importance: {importance:.2f}) has significant drift"
                
                if psi >= 0.25:
                    suggestion += f" with PSI={psi:.2f}. Consider retraining the model with updated data."
                elif wasserstein > 0.1:
                    suggestion += f" with Wasserstein distance={wasserstein:.2f}. Verify feature preprocessing and scaling."
                else:
                    suggestion += ". Investigate data collection process for this feature."
                
                suggestions.append(suggestion)
        
        # Rule 3: Multiple important features drifted
        important_drifted_count = len([f for f in drifted_features if feature_importance.get(f, 0) > self.feature_importance_threshold])
        
        if important_drifted_count >= 3:
            suggestions.append(
                f"⚠️ {important_drifted_count} important features have drifted. "
                "Full model retraining with updated dataset is strongly recommended."
            )
        
        # Rule 4: High drift but no performance drop (potential data quality issue)
        if len(drifted_features) > 3 and not has_degradation:
            suggestions.append(
                "ℹ️ Significant drift detected but model performance is stable. "
                "Monitor closely as drift may impact future predictions."
            )
        
        # Rule 5: Specific feature-level recommendations
        for feature in drifted_features:
            if feature not in [f for f, _ in critical_features]:  # Skip already mentioned
                feature_info = feature_scores.get(feature, {})
                psi = feature_info.get('psi_score', 0)
                
                if psi >= 0.25:
                    suggestions.append(
                        f"🟡 Feature '{feature}' shows population shift (PSI={psi:.2f}). "
                        "Review data distribution and consider feature engineering."
                    )
        
        # Rule 6: No drift but performance drop (potential data quality or label issue)
        if has_degradation and len(drifted_features) == 0:
            suggestions.append(
                "⚠️ Model performance dropped without significant feature drift. "
                "Check for label quality issues or hidden data quality problems."
            )
        
        # Rule 7: General recommendation if no specific issues
        if not suggestions:
            suggestions.append(
                "✅ No significant issues detected. Model performance is stable and drift is within acceptable limits."
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
        Complete model drift analysis pipeline
        
        Args:
            model_path: Path to pickled model file
            baseline_df: Baseline dataset
            current_df: Current dataset
            target_column: Target column name
            drift_report: Drift detection results
            feature_columns: Optional list of feature columns
        
        Returns:
            Complete analysis with drift, model metrics, and suggestions
        """
        # Load model
        model = self.load_model(model_path)
        
        # Evaluate model
        model_evaluation = self.evaluate_model(
            model, 
            baseline_df, 
            current_df, 
            target_column,
            feature_columns
        )
        
        # Generate suggestions
        suggestions = self.generate_suggestions(drift_report, model_evaluation)
        
        return {
            'data_drift': drift_report,
            'model_metrics': {
                'baseline_accuracy': model_evaluation['baseline_metrics']['accuracy'],
                'baseline_precision': model_evaluation['baseline_metrics']['precision'],
                'baseline_recall': model_evaluation['baseline_metrics']['recall'],
                'baseline_f1': model_evaluation['baseline_metrics']['f1_score'],
                'current_accuracy': model_evaluation['current_metrics']['accuracy'],
                'current_precision': model_evaluation['current_metrics']['precision'],
                'current_recall': model_evaluation['current_metrics']['recall'],
                'current_f1': model_evaluation['current_metrics']['f1_score'],
                'performance_drop': model_evaluation['performance_drop'],
                'has_degradation': model_evaluation['has_degradation']
            },
            'feature_importance': model_evaluation['feature_importance'],
            'suggestions': suggestions
        }
