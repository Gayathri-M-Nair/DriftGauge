"""
test_ai.py - Quick test script for Ollama integration

Run from the backend directory:
    python test_ai.py
"""

from app.ai_helper import query_ollama, generate_ai_insight


def test_basic_query():
    """Test that Ollama responds to a simple prompt."""
    print("=" * 60)
    print("TEST 1: Basic query to Ollama")
    print("=" * 60)

    response = query_ollama("In one sentence, what is data drift in machine learning?")
    print("Response:", response)
    print()


def test_ai_insight():
    """Test generate_ai_insight with sample drift and performance data."""
    print("=" * 60)
    print("TEST 2: AI insight from drift + performance summary")
    print("=" * 60)

    # Sample drift summary (mimics DriftDetector output)
    drift_summary = {
        "mode": "high_accuracy",
        "drift_score": 0.6,
        "total_features": 5,
        "drifted_features": ["age", "income", "credit_score"],
        "feature_scores": {
            "age": {
                "ks_statistic": 0.312,
                "p_value": 0.0001,
                "wasserstein_distance": 0.18,
                "psi_score": 0.31
            },
            "income": {
                "ks_statistic": 0.275,
                "p_value": 0.0023,
                "wasserstein_distance": 0.22,
                "psi_score": 0.28
            },
            "credit_score": {
                "ks_statistic": 0.198,
                "p_value": 0.012,
                "wasserstein_distance": 0.09,
                "psi_score": 0.14
            }
        }
    }

    # Sample performance summary (mimics ModelEvaluator output)
    performance_summary = {
        "baseline_accuracy": 0.91,
        "current_accuracy": 0.74,
        "performance_drop": 0.17,
        "has_degradation": True,
        "feature_importance": {
            "income": 0.35,
            "credit_score": 0.28,
            "age": 0.18,
            "loan_amount": 0.12,
            "employment_years": 0.07
        }
    }

    insight = generate_ai_insight(drift_summary, performance_summary)
    print("AI Insight:\n")
    print(insight)
    print()


def test_drift_only():
    """Test generate_ai_insight with drift data only (no model)."""
    print("=" * 60)
    print("TEST 3: AI insight from drift summary only (no model)")
    print("=" * 60)

    drift_summary = {
        "mode": "fast",
        "drift_score": 0.25,
        "total_features": 4,
        "drifted_features": ["salary"],
        "feature_scores": {
            "salary": {
                "ks_statistic": 0.21,
                "p_value": 0.031,
            }
        }
    }

    insight = generate_ai_insight(drift_summary)
    print("AI Insight:\n")
    print(insight)
    print()


if __name__ == "__main__":
    test_basic_query()
    test_ai_insight()
    test_drift_only()
