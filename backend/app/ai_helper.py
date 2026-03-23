"""
ai_helper.py - Ollama (llama3) integration for DriftGauge

Generates structured AI insights with four sections by making four
focused, short prompts — avoiding JSON truncation issues.
"""

import logging
import requests
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"

_FALLBACK: Dict[str, str] = {
    "explanation":    "AI explanation unavailable. Make sure Ollama is running locally.",
    "root_cause":     "Could not determine root cause automatically.",
    "recommendation": "Run a new analysis once Ollama is available for AI-powered insights.",
    "code_fix":       "# AI code suggestions unavailable at this time.",
}


# ---------------------------------------------------------------------------
# Low-level Ollama call
# ---------------------------------------------------------------------------

def query_ollama(prompt: str) -> str:
    """Send a prompt to Ollama and return the response text."""
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=120,
        )
        resp.raise_for_status()
        result = resp.json().get("response", "").strip()
        logger.info("Ollama response received (%d chars)", len(result))
        return result
    except requests.exceptions.ConnectionError as e:
        logger.error("Ollama connection error: %s", e)
        return "Error: Could not connect to Ollama at http://localhost:11434"
    except requests.exceptions.Timeout:
        logger.error("Ollama request timed out")
        return "Error: Ollama request timed out."
    except requests.exceptions.HTTPError as e:
        logger.error("Ollama HTTP error: %s", e)
        return f"Error: HTTP {e.response.status_code} from Ollama."
    except Exception as e:
        logger.error("Ollama unexpected error: %s", e)
        return f"Error: {str(e)}"


# ---------------------------------------------------------------------------
# Context builder (shared across all four prompts)
# ---------------------------------------------------------------------------

def _build_context(
    drifted_features: List[str],
    feature_scores: Dict,
    feature_importance: Dict,
    model_metrics: Optional[Dict],
) -> str:
    """Build a compact context string used in every prompt."""
    rows = []
    for feat in drifted_features[:5]:
        s   = feature_scores.get(feat, {})
        imp = feature_importance.get(feat)
        psi  = s.get("psi_score")
        wass = s.get("wasserstein_distance")
        psi_str  = f"{psi:.3f}"  if psi  is not None else "N/A"
        wass_str = f"{wass:.3f}" if wass is not None else "N/A"
        line = (
            f"- {feat}: KS={s.get('ks_statistic', 0):.3f}, "
            f"p={s.get('p_value', 1):.4f}, "
            f"PSI={psi_str}, "
            f"Wasserstein={wass_str}"
            + (f", model_importance={imp:.3f}" if imp is not None else "")
        )
        rows.append(line)

    drift_lines = "\n".join(rows) if rows else "- No features drifted"

    perf_lines = ""
    if model_metrics and not model_metrics.get("error"):
        perf_lines = (
            f"\nModel performance: "
            f"baseline={model_metrics.get('baseline_accuracy', 0):.1%}, "
            f"current={model_metrics.get('current_accuracy', 0):.1%}, "
            f"drop={model_metrics.get('performance_drop', 0):.1%}, "
            f"degraded={'yes' if model_metrics.get('has_degradation') else 'no'}"
        )

    return f"Drifted features:\n{drift_lines}{perf_lines}"


# ---------------------------------------------------------------------------
# Four focused prompts
# ---------------------------------------------------------------------------

def _ask_explanation(context: str) -> str:
    prompt = (
        "You are an ML monitoring expert. "
        "In 2-3 sentences, explain what data drift occurred and what it means for the model. "
        "Be specific about which features drifted and the severity.\n\n"
        f"{context}\n\n"
        "Answer in plain text only. No bullet points. No headers."
    )
    result = query_ollama(prompt)
    return result if not result.startswith("Error:") else _FALLBACK["explanation"]


def _ask_root_cause(context: str) -> str:
    prompt = (
        "You are an ML monitoring expert. "
        "In 1-2 sentences, identify the most likely root cause of the detected drift "
        "(e.g. population shift, seasonality, data pipeline change, label drift). "
        "Be specific.\n\n"
        f"{context}\n\n"
        "Answer in plain text only. No bullet points. No headers."
    )
    result = query_ollama(prompt)
    return result if not result.startswith("Error:") else _FALLBACK["root_cause"]


def _ask_recommendation(context: str) -> str:
    prompt = (
        "You are an ML monitoring expert. "
        "Give 2-3 concrete, actionable recommendations for the ML team to address this drift. "
        "Each recommendation should be one sentence. Separate them with a newline.\n\n"
        f"{context}\n\n"
        "Answer in plain text only. No JSON. No headers."
    )
    result = query_ollama(prompt)
    return result if not result.startswith("Error:") else _FALLBACK["recommendation"]


def _ask_code_fix(context: str, top_feature: str) -> str:
    prompt = (
        "You are a Python ML engineer. "
        f"Write a short Python code snippet (8-12 lines) to fix or monitor the drift in the '{top_feature}' feature. "
        "Use sklearn or pandas. Include a brief comment explaining what it does.\n\n"
        f"{context}\n\n"
        "Return only the Python code. No explanation outside the code."
    )
    result = query_ollama(prompt)
    if result.startswith("Error:"):
        return _FALLBACK["code_fix"]
    # Strip markdown code fences if model added them
    result = result.strip()
    if result.startswith("```"):
        lines = result.split("\n")
        result = "\n".join(
            line for line in lines
            if not line.strip().startswith("```")
        ).strip()
    return result


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_ai_insights(
    drift_summary: Dict,
    model_metrics: Optional[Dict] = None,
) -> Dict[str, str]:
    """
    Generate structured AI insights using four focused Ollama calls.

    Args:
        drift_summary : output of DriftDetector._build_drift_summary()
        model_metrics : model_metrics dict from the unified analysis (or None)

    Returns:
        Dict with keys: explanation, root_cause, recommendation, code_fix
    """
    drifted_features   = drift_summary.get("drifted_features", [])
    feature_scores     = drift_summary.get("feature_scores", {})
    feature_importance = drift_summary.get("feature_importance", {})

    logger.info(
        "generate_ai_insights called: %d drifted features, model_metrics=%s",
        len(drifted_features),
        "yes" if model_metrics else "no",
    )

    # All-clear shortcut — no Ollama call needed
    has_degradation = (model_metrics or {}).get("has_degradation", False)
    if not drifted_features and not has_degradation:
        logger.info("No drift and no degradation — returning stable message")
        return {
            "explanation":    "No significant drift detected across all features.",
            "root_cause":     "Data distributions are stable between baseline and current datasets.",
            "recommendation": "Continue monitoring. No immediate action required.",
            "code_fix":       (
                "# Distributions are stable — no fix needed.\n"
                "# Schedule periodic checks:\n"
                "from drift_engine import DriftDetector\n"
                "detector = DriftDetector()\n"
                "result = detector.detect_drift(baseline_df, current_df, mode='fast')\n"
                "print('Drift score:', result['drift_score'])"
            ),
        }

    context     = _build_context(drifted_features, feature_scores, feature_importance, model_metrics)
    top_feature = drifted_features[0] if drifted_features else "unknown"

    logger.info("Calling Ollama for %d drifted features, top_feature=%s", len(drifted_features), top_feature)
    logger.debug("Context sent to Ollama:\n%s", context)

    return {
        "explanation":    _ask_explanation(context),
        "root_cause":     _ask_root_cause(context),
        "recommendation": _ask_recommendation(context),
        "code_fix":       _ask_code_fix(context, top_feature),
    }


def generate_ai_insight(drift_summary: Dict, performance_summary: Optional[Dict] = None) -> str:
    """Backward-compatible wrapper — returns the explanation string only."""
    insights = generate_ai_insights(drift_summary, performance_summary or None)
    return insights.get("explanation", _FALLBACK["explanation"])
