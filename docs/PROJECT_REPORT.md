# DriftGauge: A Data Drift Detection and ML Monitoring System

**Project Report**

Submitted in partial fulfillment of the requirements for the award of the degree of
**Bachelor of Engineering / Bachelor of Technology**
in Computer Science and Engineering / Information Technology

---

| | |
|---|---|
| **Project Title** | DriftGauge: A Data Drift Detection and ML Monitoring System |
| **Technology Stack** | React, FastAPI, Python, SQLite, Ollama (llama3) |
| **Domain** | Machine Learning Operations (MLOps) / AI Monitoring |
| **Academic Year** | 2025–2026 |

---

## TABLE OF CONTENTS

| Chapter | Title | Page |
|---------|-------|------|
| 1 | Introduction | 3 |
| 1.1 | Background | 3 |
| 1.2 | Existing Systems | 5 |
| 1.3 | Problem Statement | 6 |
| 1.4 | Scope of the Project | 7 |
| 2 | Literature Survey | 8 |
| 2.1 | Foundational Work on Distribution Shift | 8 |
| 2.2 | Online and Streaming Drift Detection Methods | 9 |
| 2.3 | Batch-Oriented Drift Detection Approaches | 10 |
| 2.4 | Feature-Level Drift Analysis | 11 |
| 2.5 | MLOps and Model Monitoring Frameworks | 12 |
| 2.6 | Summary and Research Gap | 13 |
| 3 | Proposed System | 14 |
| 3.1 | Objectives | 14 |
| 3.2 | Methodology | 15 |
| 3.3 | System Architecture | 16 |
| 3.4 | Flow Diagram | 17 |
| 3.5 | Functional Requirements | 18 |
| 3.6 | Non-Functional Requirements | 19 |
| 3.7 | Hardware Requirements | 19 |
| 3.8 | Software Requirements | 20 |
| 3.9 | Development Life Cycle | 20 |
| 3.10 | Economic Feasibility | 21 |
| 4 | System Design | 22 |
| 4.1 | Use Case Diagram | 22 |
| 4.2 | Class Diagram | 23 |
| 4.3 | Sequence Diagram | 24 |
| 4.4 | Deployment Diagram | 25 |
| 4.5 | State Chart Diagram | 26 |
| 4.6 | Activity Diagram | 27 |
| 5 | Architecture and Implementation | 28 |
| 5.1 | Frontend Implementation | 28 |
| 5.2 | Backend Implementation | 30 |
| 5.3 | Drift Detection Engine | 32 |
| 5.4 | Module Descriptions | 35 |
| 5.5 | API Design | 36 |
| 6 | Testing | 38 |
| 6.1 | Testing Strategy | 38 |
| 6.2 | Unit Testing | 38 |
| 6.3 | Integration Testing | 39 |
| 6.4 | System Testing | 40 |
| 6.5 | Performance Testing | 40 |
| 7 | Results and Discussion | 41 |
| 8 | Conclusion | 43 |
| 9 | Future Enhancements | 44 |
| 10 | SDG Alignment | 45 |
| 11 | References | 46 |

---

---

# CHAPTER 1: INTRODUCTION

## 1.1 Background

The deployment of machine learning models into production environments represents only the beginning of their operational lifecycle. Once a model is trained on a historical dataset and deployed, it is expected to make accurate predictions on new, incoming data. However, the real world is not static. Data distributions evolve over time due to changes in user behaviour, seasonal patterns, economic shifts, data pipeline modifications, or changes in the underlying population being modelled. This phenomenon, broadly referred to as data drift or dataset shift, is one of the most pervasive and underappreciated challenges in applied machine learning.

Data drift occurs when the statistical properties of the input data that a model receives during inference differ significantly from the properties of the data on which the model was trained. When this happens, the model's predictions become increasingly unreliable, even though the model itself has not changed. The model was optimised for a distribution that no longer accurately represents the current state of the world. This degradation in predictive performance can have serious consequences in high-stakes domains such as credit scoring, medical diagnosis, fraud detection, and recommendation systems.

The concept of data drift encompasses several distinct phenomena. Covariate shift refers to a change in the marginal distribution of input features P(X) while the conditional distribution P(Y|X) remains stable. Prior probability shift, also called label shift, occurs when the distribution of the target variable P(Y) changes. Concept drift is the most severe form, where the relationship between inputs and outputs P(Y|X) itself changes, meaning the model's learned mapping is no longer valid. Each of these forms of drift requires different detection strategies and remediation approaches.

Historically, the problem of model degradation was addressed reactively — organisations would notice a drop in business metrics and then investigate the root cause. This approach is costly and slow. The modern paradigm of Machine Learning Operations (MLOps) advocates for proactive, continuous monitoring of deployed models. Just as software systems are monitored for uptime, latency, and error rates, ML models must be monitored for data quality, distribution stability, and predictive performance. This shift from reactive to proactive monitoring is the foundational motivation for DriftGauge.

DriftGauge is a self-hosted, lightweight ML monitoring platform designed to make drift detection accessible to data science teams without requiring heavy infrastructure. The system accepts a baseline dataset (representing the training distribution) and a current dataset (representing recent production data), performs statistical analysis across all numeric features, evaluates an optionally uploaded trained model, and generates AI-powered root cause analysis using a locally running large language model. The result is a comprehensive, interpretable dashboard that answers three fundamental questions: Did the data distribution change? Did the model performance degrade? And what should the team do about it?

The platform is built on a modern, pragmatic technology stack. The backend is implemented in Python using the FastAPI framework, which provides high-performance asynchronous request handling and automatic OpenAPI documentation. Statistical computations are performed using scipy, pandas, and numpy. The frontend is a single-page application built with React 18 and Vite, styled with Tailwind CSS, and animated with Framer Motion. Data visualisations are rendered using Recharts. The AI insights layer communicates with a locally running Ollama instance serving the llama3 language model, enabling natural language explanations of drift results without any cloud API dependency.

## 1.2 Existing Systems

Several commercial and open-source tools exist in the ML monitoring space, each with distinct design philosophies and trade-offs.

**Evidently AI** is an open-source Python library that generates HTML reports and JSON metrics for data and model monitoring. It supports a wide range of statistical tests and provides pre-built report templates. However, Evidently is primarily a reporting library rather than a full monitoring platform. It lacks a persistent backend, a real-time dashboard, and integrated AI-powered explanations. Teams must build their own infrastructure around it.

**WhyLogs** (by WhyLabs) is a data logging library that computes statistical profiles of datasets and streams them to the WhyLabs cloud platform for monitoring. While powerful, it introduces a cloud dependency and requires subscription-based access for advanced features. The tight coupling to the WhyLabs platform limits flexibility for teams with data residency requirements.

**MLflow** is a comprehensive MLOps platform covering experiment tracking, model registry, and deployment. While it includes some model monitoring capabilities, its primary focus is on the experiment and deployment lifecycle rather than production drift monitoring. Its monitoring features are less mature compared to dedicated tools.

**Arize AI** and **Fiddler AI** are enterprise-grade ML observability platforms with sophisticated drift detection, explainability, and alerting capabilities. However, they are cloud-based SaaS products with significant cost implications, making them inaccessible to small teams, academic projects, and organisations with strict data privacy requirements.

**Alibi Detect** is a Python library focused on outlier detection, adversarial detection, and concept drift detection. It implements advanced statistical and deep learning-based drift detectors. However, it is a library rather than a platform — it provides no user interface, no persistent storage, and no integrated workflow for non-technical stakeholders.

The common limitation across existing solutions is the trade-off between capability and accessibility. Enterprise platforms are powerful but expensive and cloud-dependent. Open-source libraries are flexible but require significant engineering effort to build a usable system around them. DriftGauge occupies a deliberate middle ground: a complete, self-contained platform with a polished user interface, persistent storage, and AI-powered insights, deployable entirely on a local machine.

## 1.3 Problem Statement

Despite the widespread adoption of machine learning in production systems, the majority of organisations lack systematic mechanisms for detecting and responding to data drift. The consequences of undetected drift range from degraded user experience to significant financial losses and, in critical domains, to harmful decisions made on the basis of stale model predictions.

The specific problems that DriftGauge addresses are as follows:

**Lack of visibility into distribution changes:** Data scientists and ML engineers typically have no automated way to know when the statistical properties of their production data have diverged from the training distribution. Without this visibility, model degradation goes undetected until it manifests as a business problem.

**Absence of feature-level granularity:** Even when drift is detected at the dataset level, teams need to know which specific features have drifted and by how much. A single aggregate drift score is insufficient for diagnosis and remediation. Teams need per-feature metrics with multiple statistical measures to understand the nature and severity of the shift.

**Disconnection between drift and model performance:** Drift detection and model performance monitoring are often treated as separate concerns. In reality, the relationship between them is critical: high drift combined with performance degradation calls for immediate retraining, while high drift with stable performance may only require monitoring. Systems that treat these concerns in isolation provide incomplete guidance.

**Inaccessibility of AI-powered explanations:** Statistical metrics such as KS statistics and PSI scores are meaningful to data scientists but opaque to business stakeholders and junior engineers. There is a need for natural language explanations that translate statistical findings into actionable insights, including root cause hypotheses and concrete remediation steps.

**Infrastructure overhead of existing solutions:** Existing enterprise monitoring platforms require cloud accounts, API keys, and ongoing subscription costs. Open-source libraries require custom integration work. Neither is suitable for teams that need a quick, self-contained solution they can run on their own hardware.

DriftGauge directly addresses all five of these problems through its unified pipeline, feature-level analysis, combined drift and model monitoring, AI insights layer, and zero-dependency local deployment model.

## 1.4 Scope of the Project

The scope of DriftGauge encompasses the following capabilities and boundaries:

**In scope:**
The system supports batch drift detection, where a complete baseline dataset and a complete current dataset are uploaded and compared. It performs statistical analysis on all numeric features using three complementary methods: the Kolmogorov-Smirnov test, Wasserstein distance, and Population Stability Index. It supports optional ML model evaluation for classification models saved in the scikit-learn compatible pickle format. It generates AI-powered insights using a locally running Ollama instance. It provides a web-based dashboard with feature distribution visualisations, drift severity badges, model performance metrics, and an analysis history view. All data is persisted in a local SQLite database.

**Out of scope:**
The current version does not support real-time or streaming drift detection. It does not support regression models for model evaluation (only classification). It does not implement automated model retraining or deployment. It does not support non-numeric (categorical) features in drift detection. It does not provide alerting or notification mechanisms. It does not support distributed deployment or multi-user authentication. These limitations are acknowledged and several are identified as future enhancements in Chapter 9.

---

---

# CHAPTER 2: LITERATURE SURVEY

## 2.1 Foundational Work on Distribution Shift

The theoretical foundations of data drift detection are rooted in statistical hypothesis testing and the study of distribution shift in machine learning. The seminal work by Shimodaira (2000) introduced the concept of covariate shift and proposed importance weighting as a method for adapting models trained on one distribution to perform well on another. This work established the formal distinction between the training distribution and the test distribution and demonstrated that ignoring this distinction leads to biased estimators.

Quiñonero-Candela et al. (2009) provided a comprehensive taxonomy of dataset shift, distinguishing between covariate shift, prior probability shift, concept drift, and sample selection bias. Their framework remains the standard reference for categorising the types of distribution change that can affect deployed models. They argued that the assumption of identical training and test distributions, which underlies most supervised learning theory, is routinely violated in practice and that this violation is a primary cause of model degradation in production.

The Kolmogorov-Smirnov (KS) test, originally developed by Kolmogorov (1933) and Smirnov (1948), provides a non-parametric method for testing whether two samples are drawn from the same distribution. The test statistic is the maximum absolute difference between the empirical cumulative distribution functions (ECDFs) of the two samples. Its non-parametric nature makes it particularly suitable for drift detection, as it makes no assumptions about the underlying distribution of the data. The two-sample KS test has been widely adopted in production monitoring systems precisely because of this distribution-free property.

The Wasserstein distance, also known as the Earth Mover's Distance, was introduced in the context of optimal transport theory by Kantorovich (1942) and later popularised in machine learning by Rubner et al. (2000). Unlike the KS test, which measures the maximum discrepancy between distributions, the Wasserstein distance measures the minimum cost of transforming one distribution into another, providing a more geometrically meaningful measure of distributional difference. Villani (2008) provided a comprehensive mathematical treatment of optimal transport, establishing the theoretical properties of the Wasserstein distance that make it useful for comparing probability distributions.

The Population Stability Index (PSI) has its origins in the credit risk industry, where it was developed as a practical tool for monitoring the stability of scorecards over time. While its precise origin is difficult to attribute to a single publication, it has been widely documented in credit risk literature (Siddiqi, 2006) and has become a standard metric in financial services for detecting population shift. Its interpretability — with well-established thresholds of 0.1 and 0.25 — makes it particularly valuable for communicating drift severity to non-technical stakeholders.

## 2.2 Online and Streaming Drift Detection Methods

A significant body of research has focused on detecting drift in streaming data, where observations arrive sequentially and the system must detect changes as quickly as possible with minimal memory overhead.

Gama et al. (2004) proposed the Drift Detection Method (DDM), which monitors the error rate of an online classifier and triggers a drift alarm when the error rate increases beyond a statistically significant threshold. DDM is computationally efficient and well-suited to streaming scenarios but is limited to monitoring classification error and cannot detect drift in the input features independently of model performance.

Bifet and Gavalda (2007) introduced the Adaptive Windowing (ADWIN) algorithm, which maintains a variable-length sliding window over a data stream and detects changes in the mean of the observed values. ADWIN provides theoretical guarantees on false positive and false negative rates and has been widely adopted as a building block in streaming drift detection systems. The algorithm automatically adjusts the window size based on detected changes, making it adaptive to varying rates of drift.

Page (1954) introduced the CUSUM (Cumulative Sum) algorithm for sequential change detection, which accumulates deviations from a reference value and signals a change when the cumulative sum exceeds a threshold. While originally developed for industrial quality control, CUSUM has been extensively applied to concept drift detection in machine learning. Its sensitivity to gradual drift makes it complementary to methods that are better suited to abrupt changes.

Frías-Blanco et al. (2015) proposed the Incremental Kolmogorov-Smirnov (IKS) test, which extends the classical KS test to the streaming setting by maintaining an efficient data structure that allows the KS statistic to be computed incrementally as new observations arrive. This work bridges the gap between the statistical rigour of the KS test and the computational requirements of streaming applications.

While these streaming methods are powerful, they are designed for scenarios where data arrives continuously and decisions must be made in real time. DriftGauge operates in a batch setting, where complete datasets are available for comparison. This design choice is appropriate for the majority of practical ML monitoring scenarios, where models are retrained and evaluated on a periodic basis (daily, weekly, or monthly) rather than in a continuous streaming fashion.

## 2.3 Batch-Oriented Drift Detection Approaches

Batch drift detection, where two complete datasets are compared statistically, is the dominant paradigm in production ML monitoring. Several important contributions have shaped the methods used in this domain.

Rabanser et al. (2019) conducted a systematic evaluation of statistical tests for detecting covariate shift in high-dimensional data. They compared univariate tests (applied independently to each feature) with multivariate tests (applied to the joint distribution) and found that univariate tests, while less powerful in theory, are often more practical and interpretable in production settings. Their work provides empirical justification for the feature-level approach adopted by DriftGauge.

Cobb and Van Looveren (2022) proposed a framework for data drift detection that combines multiple statistical tests and aggregates their results into a single drift score. They demonstrated that combining tests with different sensitivities (e.g., KS test for shape differences and Wasserstein distance for magnitude differences) provides more robust drift detection than any single test alone. This multi-criteria approach directly informs the design of DriftGauge's high accuracy mode, which combines KS, Wasserstein, and PSI.

Failing et al. (2020) investigated the use of PSI for monitoring feature distributions in credit risk models and provided empirical evidence for the standard PSI thresholds (0.1 for moderate drift, 0.25 for significant drift). Their work validated these thresholds across multiple real-world datasets and demonstrated their practical utility for triggering model review processes.

Klaise et al. (2020) introduced the Alibi Detect library, which implements a comprehensive suite of drift detectors including the KS test, Maximum Mean Discrepancy (MMD), Least-Squares Density Difference (LSDD), and classifier-based drift detection. Their work demonstrated that different detectors have different sensitivities to different types of drift and that the choice of detector should be guided by the characteristics of the data and the type of drift expected.

## 2.4 Feature-Level Drift Analysis

The importance of feature-level drift analysis, as opposed to dataset-level analysis, has been increasingly recognised in the literature.

Breck et al. (2017) presented a comprehensive framework for ML testing and monitoring at Google, which included feature-level validation as a core component. They argued that monitoring individual features is essential for diagnosing the root cause of model degradation and for guiding targeted remediation efforts. Their work established feature-level monitoring as a best practice in production ML systems.

Sculley et al. (2015) identified "hidden technical debt" in ML systems, including the problem of unstable data dependencies. They argued that features derived from external data sources are particularly prone to silent changes that can degrade model performance without triggering any obvious errors. Feature-level drift monitoring is a direct response to this class of technical debt.

Klaise et al. (2021) demonstrated that feature importance information, when combined with drift detection results, provides significantly more actionable insights than drift detection alone. Specifically, they showed that features with both high drift and high model importance are the most likely causes of performance degradation. This insight is directly implemented in DriftGauge's suggestion engine, which cross-references drifted features with model feature importance scores.

The combination of multiple drift metrics at the feature level — as implemented in DriftGauge with KS statistic, Wasserstein distance, and PSI — provides a richer characterisation of drift than any single metric. The KS statistic captures the maximum discrepancy between distributions, the Wasserstein distance captures the overall magnitude of the shift, and PSI captures the relative change in population proportions across bins. Together, they provide complementary perspectives on the nature and severity of drift.

## 2.5 MLOps and Model Monitoring Frameworks

The emergence of MLOps as a discipline has brought systematic approaches to the deployment and monitoring of ML models.

Sculley et al. (2015) coined the term "technical debt" in the context of ML systems and identified model monitoring as a critical component of sustainable ML operations. Their work highlighted the risks of deploying models without adequate monitoring infrastructure and established the case for treating monitoring as a first-class engineering concern.

Shankar et al. (2022) conducted a large-scale study of ML deployment practices and found that model monitoring is one of the most commonly cited challenges in production ML. They identified the lack of standardised tools and the difficulty of interpreting monitoring results as key barriers to effective monitoring. DriftGauge directly addresses both of these barriers through its standardised pipeline and AI-powered explanations.

Paleyes et al. (2022) provided a comprehensive survey of challenges in deploying ML systems, with a dedicated section on distribution shift and model monitoring. They identified the need for tools that combine statistical monitoring with interpretable explanations as a key research and engineering priority. The integration of Ollama-based AI insights in DriftGauge represents a practical implementation of this vision.

The concept of using large language models (LLMs) for explaining ML monitoring results is relatively recent. Bommasani et al. (2021) discussed the potential of foundation models for a wide range of downstream tasks, including the interpretation of structured data. The use of llama3 via Ollama in DriftGauge represents an application of this capability to the specific domain of drift explanation, generating natural language summaries of statistical findings that are accessible to a broader audience than raw metrics.

## 2.6 Summary and Research Gap

The literature review reveals a rich body of work on drift detection methods, from classical statistical tests to modern deep learning-based approaches. However, several gaps remain that DriftGauge addresses:

**Integration gap:** Most existing work treats drift detection, model performance monitoring, and explanation generation as separate problems. DriftGauge integrates all three into a unified pipeline with a single API call.

**Accessibility gap:** Academic and research tools are typically implemented as Python libraries without user interfaces. Enterprise tools are expensive and cloud-dependent. DriftGauge provides a complete, self-hosted platform with a polished web interface that is accessible to teams without dedicated MLOps infrastructure.

**Explanation gap:** Existing tools report statistical metrics but do not provide natural language explanations of what those metrics mean or what actions should be taken. DriftGauge's integration of llama3 via Ollama fills this gap by generating contextualised, actionable explanations.

**Threshold standardisation gap:** Different tools use different thresholds and metrics, making it difficult to compare results across systems. DriftGauge adopts industry-standard thresholds (PSI < 0.1 for stable, 0.1–0.25 for moderate, > 0.25 for significant) and provides a clear visual grading system that communicates severity at a glance.

---

---

# CHAPTER 3: PROPOSED SYSTEM

## 3.1 Objectives

The primary objective of DriftGauge is to provide a comprehensive, self-contained platform for detecting data drift and monitoring ML model performance in a production environment. The specific objectives of the system are as follows:

**Objective 1 — Statistical Drift Detection:** To implement a robust, multi-criteria drift detection engine that applies the Kolmogorov-Smirnov test, Wasserstein distance, and Population Stability Index to each numeric feature in the dataset, providing a comprehensive characterisation of distributional change at the feature level.

**Objective 2 — Severity Classification:** To classify the severity of drift for each feature using a standardised grading system based on PSI thresholds, providing clear visual indicators (Stable, Monitor, Critical Drift) that communicate severity at a glance to both technical and non-technical stakeholders.

**Objective 3 — ML Model Performance Monitoring:** To evaluate the performance of an uploaded scikit-learn compatible classification model on both the baseline and current datasets, computing accuracy, precision, recall, and F1 score for each, and detecting performance degradation when the accuracy drop exceeds a configurable threshold.

**Objective 4 — Feature Importance Integration:** To cross-reference drifted features with model feature importance scores, identifying features that are both highly drifted and highly important to the model, as these represent the most likely causes of performance degradation.

**Objective 5 — AI-Powered Insights:** To generate natural language explanations of drift results using a locally running large language model (llama3 via Ollama), providing four structured sections: explanation, root cause, recommendation, and code fix.

**Objective 6 — Interactive Dashboard:** To provide a web-based dashboard with feature distribution visualisations, a sortable and filterable feature drift table, model performance metrics, and an expandable AI insights panel.

**Objective 7 — Analysis History:** To persist all analysis results in a local SQLite database and provide a history view that allows users to browse and revisit past analyses.

**Objective 8 — Dual Processing Modes:** To offer two processing modes — Fast Mode for quick approximate results using sampling and KS test only, and High Accuracy Mode for comprehensive analysis using the full dataset and all three statistical tests.

## 3.2 Methodology

The development of DriftGauge followed an iterative, feature-driven methodology. The system was designed around a core pipeline that processes data through five sequential stages: upload, preprocessing, drift detection, model evaluation, and AI insight generation. Each stage was implemented and validated independently before being integrated into the unified pipeline.

**Stage 1 — Data Ingestion:** The system accepts CSV files for the baseline and current datasets, uploaded through a web interface. Files are stored on the local filesystem organised by project identifier. An optional trained model file in pickle format can also be uploaded for model evaluation.

**Stage 2 — Preprocessing:** The drift detection engine aligns the two datasets by finding common columns and removing rows with missing values. Only numeric columns are retained for statistical analysis, as the implemented tests are designed for continuous distributions.

**Stage 3 — Statistical Analysis:** Depending on the selected mode, the engine applies either KS test only (Fast Mode) or KS test, Wasserstein distance, and PSI (High Accuracy Mode) to each numeric feature. Histogram data is computed for visualisation purposes in High Accuracy Mode.

**Stage 4 — Model Evaluation (Optional):** If a model file and target column name are provided, the ModelEvaluator class loads the model, aligns the feature columns to match the training feature order, generates predictions on both datasets, and computes classification metrics. Feature importance is extracted from the model if available.

**Stage 5 — AI Insight Generation:** The drift summary and optional model metrics are passed to the AI helper module, which constructs a compact context string and makes four sequential calls to the Ollama API, each requesting a specific type of insight. The results are assembled into a structured dictionary with four keys: explanation, root_cause, recommendation, and code_fix.

**Stage 6 — Persistence and Response:** The complete result is serialised as JSON and stored in the SQLite database. The API returns the full result to the frontend, which navigates to the dashboard and renders the results.

## 3.3 System Architecture

The DriftGauge system follows a three-tier architecture comprising a presentation layer, an application layer, and a data layer.

**Presentation Layer (Frontend):** The frontend is a React single-page application served by the Vite development server on port 5173. It communicates with the backend exclusively through HTTP requests via the Axios library. The UI is structured around a persistent sidebar for navigation and project management, with four main pages: Upload, Dashboard, History, and Settings. The sidebar maintains the selected project state, which is passed as a prop to all pages.

**Application Layer (Backend):** The backend is a FastAPI application served by Uvicorn on port 8000. It exposes a RESTful API with endpoints for project management, file upload, drift analysis, and history retrieval. The application layer orchestrates the drift detection engine, model evaluator, and AI helper modules. Cross-Origin Resource Sharing (CORS) is configured to allow requests from the frontend origin.

**Data Layer:** Persistent storage is provided by a SQLite database managed through SQLAlchemy ORM. The database contains two tables: `projects` and `analyses`. Uploaded files are stored on the local filesystem in structured directories organised by project identifier. The database file and upload directories are created automatically on first run.

**External AI Layer:** The AI insights layer communicates with a locally running Ollama instance on port 11434. This is treated as an external service — the backend makes HTTP POST requests to the Ollama API and handles connection failures gracefully by returning fallback messages.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React SPA (Vite, port 5173)                                │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────┐  │
│  │UploadPage│ │DashboardPg│ │HistoryPg │ │SettingsPage  │  │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST (Axios)
┌─────────────────────────▼───────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  FastAPI + Uvicorn (port 8000)                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │DriftDetector │ │ModelEvaluator│ │   AI Helper (Ollama) │ │
│  │  KS / PSI /  │ │  Accuracy /  │ │  Explanation /       │ │
│  │  Wasserstein │ │  F1 / Recall │ │  Root Cause /        │ │
│  └──────────────┘ └──────────────┘ │  Recommendation /    │ │
│                                    │  Code Fix            │ │
│                                    └──────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ SQLAlchemy ORM
┌─────────────────────────▼───────────────────────────────────┐
│                       DATA LAYER                             │
│  SQLite (driftgauge.db)    Filesystem (uploads/, models/)   │
└─────────────────────────────────────────────────────────────┘
                          │ HTTP (requests)
┌─────────────────────────▼───────────────────────────────────┐
│                    EXTERNAL AI LAYER                         │
│  Ollama (port 11434) — llama3:latest                        │
└─────────────────────────────────────────────────────────────┘
```

## 3.4 Flow Diagram

The end-to-end workflow of DriftGauge can be described through the following sequential flow:

```
START
  │
  ▼
User creates or selects a project
  │
  ▼
User uploads Baseline CSV + Current CSV
  │
  ├── [Optional] User uploads .pkl model + specifies target column
  │
  ▼
User selects processing mode (Fast / High Accuracy)
  │
  ▼
User clicks "Start Drift Analysis"
  │
  ▼
Frontend calls POST /projects/{id}/analyze
  │
  ▼
Backend loads CSV files from filesystem
  │
  ▼
DriftDetector.preprocess() — align columns, drop NaN
  │
  ▼
[Fast Mode?] ──YES──► Sample 5000 rows → KS test only
  │                    → drift decision: p_value < 0.05
  │
  NO
  │
  ▼
[High Accuracy Mode]
  ├── KS test (ks_statistic, p_value)
  ├── Wasserstein distance
  ├── PSI (10 bins)
  ├── Histogram data (20 bins)
  └── Mean/std shift
  │
  ▼
Multi-criteria drift decision per feature
(p_value < 0.05 OR wasserstein > 0.1 OR psi >= 0.25)
  │
  ▼
Compute drift_score = drifted_features / total_features
  │
  ▼
[Model uploaded AND target_column provided?]
  │
  ├── YES ──► ModelEvaluator.evaluate_model()
  │            ├── Align features to training order
  │            ├── Predict on baseline → compute metrics
  │            ├── Predict on current → compute metrics
  │            ├── performance_drop = baseline_acc - current_acc
  │            ├── Extract feature_importance
  │            └── generate_suggestions(drift, model_eval)
  │
  ▼
generate_ai_insights(drift_summary, model_metrics?)
  ├── _ask_explanation() → Ollama call 1
  ├── _ask_root_cause()  → Ollama call 2
  ├── _ask_recommendation() → Ollama call 3
  └── _ask_code_fix()   → Ollama call 4
  │
  ▼
Merge all results into unified response dict
  │
  ▼
Persist Analysis record to SQLite
  │
  ▼
Return AnalysisResponse to frontend
  │
  ▼
Frontend navigates to Dashboard
  │
  ▼
Dashboard renders:
  ├── Metric cards (total features, drifted, severity %)
  ├── Model performance section (if available)
  ├── Feature drift table with PSI badges
  ├── Feature distribution chart (selected feature)
  ├── Statistics panel (KS, p-value, Wasserstein, PSI)
  └── AI Insights panel (4 sections, expandable)
  │
  ▼
END
```

## 3.5 Functional Requirements

**FR-01 — Project Management:** The system shall allow users to create named projects with optional descriptions. Each project shall serve as a container for uploaded datasets, models, and analysis results.

**FR-02 — Dataset Upload:** The system shall accept CSV files for baseline and current datasets up to 200 MB in size. Files shall be stored persistently on the local filesystem.

**FR-03 — Model Upload:** The system shall accept scikit-learn compatible model files in pickle format (.pkl). The system shall validate the file extension before accepting the upload.

**FR-04 — Drift Analysis — Fast Mode:** The system shall perform drift detection using the Kolmogorov-Smirnov two-sample test on a sample of up to 5,000 rows from each dataset. Results shall be returned within 10 seconds for typical datasets.

**FR-05 — Drift Analysis — High Accuracy Mode:** The system shall perform drift detection using KS test, Wasserstein distance, and PSI on the full dataset. The system shall compute 20-bin histogram data for each feature for visualisation purposes.

**FR-06 — Multi-Criteria Drift Decision:** The system shall classify a feature as drifted if any of the following conditions are met: KS test p-value < 0.05, Wasserstein distance > 0.1, or PSI ≥ 0.25.

**FR-07 — Drift Severity Badges:** The system shall display a graded severity badge for each feature based on PSI: Stable (PSI < 0.1), Monitor (0.1 ≤ PSI < 0.25), Critical Drift (PSI ≥ 0.25).

**FR-08 — Model Evaluation:** When a model and target column are provided, the system shall evaluate the model on both datasets and compute accuracy, precision, recall, and F1 score for each.

**FR-09 — Performance Degradation Detection:** The system shall flag model performance degradation when the accuracy drop between baseline and current exceeds 5%.

**FR-10 — Feature Importance Analysis:** The system shall extract feature importance from the model (via feature_importances_ or coef_) and cross-reference with drifted features to identify critical features.

**FR-11 — Suggestion Generation:** The system shall generate rule-based recommendations based on the combination of drift severity and model performance metrics.

**FR-12 — AI Insights:** The system shall generate four AI-powered insight sections (explanation, root cause, recommendation, code fix) using the Ollama API when available, with graceful fallback to static messages when Ollama is unavailable.

**FR-13 — Feature Distribution Visualisation:** The system shall display side-by-side distribution charts for each feature, showing baseline (blue) and current (orange) distributions as line charts.

**FR-14 — Analysis History:** The system shall persist all analysis results and provide a history view listing past analyses with their key metrics.

## 3.6 Non-Functional Requirements

**NFR-01 — Performance:** The Fast Mode analysis shall complete within 10 seconds for datasets of up to 100,000 rows. The High Accuracy Mode analysis shall complete within 5 minutes for datasets of up to 100,000 rows, excluding AI insight generation time.

**NFR-02 — Reliability:** The system shall handle model evaluation failures gracefully, returning drift results even when model evaluation fails. AI insight generation failures shall not prevent the return of statistical results.

**NFR-03 — Usability:** The user interface shall be operable without technical knowledge of the underlying statistical methods. Drift severity shall be communicated through colour-coded badges with plain-language labels.

**NFR-04 — Maintainability:** The codebase shall be modular, with separate modules for drift detection, model evaluation, and AI integration. Each module shall be independently testable.

**NFR-05 — Portability:** The system shall run on any machine with Python 3.10+, Node.js 18+, and Ollama installed. No cloud services or external API keys shall be required.

**NFR-06 — Data Privacy:** All data shall remain on the local machine. No data shall be transmitted to external services. The Ollama LLM runs locally, ensuring that sensitive data in drift summaries is not sent to cloud APIs.

## 3.7 Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | Intel Core i5 / AMD Ryzen 5 (4 cores) | Intel Core i7 / AMD Ryzen 7 (8 cores) |
| RAM | 8 GB | 16 GB (for llama3 model) |
| Storage | 10 GB free | 20 GB free |
| GPU | Not required | NVIDIA GPU (for faster Ollama inference) |
| Network | Not required | Not required (fully local) |

The RAM requirement is primarily driven by the Ollama llama3 model, which requires approximately 4–8 GB of RAM for inference. The drift detection and model evaluation components are computationally lightweight and can run on minimal hardware.

## 3.8 Software Requirements

| Component | Software | Version |
|-----------|----------|---------|
| Operating System | Windows 10/11, macOS 12+, Ubuntu 20.04+ | — |
| Python Runtime | Python | 3.10+ |
| Node.js Runtime | Node.js | 18+ |
| Package Manager | pip, npm | Latest |
| LLM Runtime | Ollama | Latest |
| LLM Model | llama3 | llama3:latest |
| Backend Framework | FastAPI | 0.115.0 |
| ASGI Server | Uvicorn | 0.32.0 |
| ORM | SQLAlchemy | 2.0.36 |
| Data Processing | pandas | 2.2.3 |
| Statistical Tests | scipy | ≥1.14.0 |
| ML Library | scikit-learn | ≥1.3.0 |
| Frontend Framework | React | 18.2.0 |
| Build Tool | Vite | 5.0.11 |
| CSS Framework | Tailwind CSS | 3.4.1 |
| HTTP Client | Axios | 1.6.5 |
| Charting | Recharts | 2.10.3 |
| Animation | Framer Motion | 10.18.0 |

## 3.9 Development Life Cycle

DriftGauge was developed following an iterative Agile-inspired development lifecycle, with each iteration delivering a working increment of the system.

**Iteration 1 — Core Infrastructure:** Established the FastAPI backend with project management endpoints, SQLAlchemy database models, and the React frontend with routing and sidebar navigation. Implemented basic CSV upload and storage.

**Iteration 2 — Drift Detection Engine:** Implemented the DriftDetector class with Fast Mode (KS test + sampling) and High Accuracy Mode (KS + Wasserstein + PSI + histograms). Integrated the drift table and metric cards into the dashboard.

**Iteration 3 — Visualisation:** Implemented the FeatureDistributionChart component using Recharts, displaying baseline and current distributions as overlaid line charts. Added the feature selector and statistics panel to the right column of the dashboard.

**Iteration 4 — ML Model Monitoring:** Implemented the ModelEvaluator class with feature alignment, metric computation, feature importance extraction, and the suggestion engine. Added the model upload UI and model performance section to the dashboard.

**Iteration 5 — AI Integration:** Implemented the ai_helper module with the four-prompt Ollama integration. Resolved the key naming mismatch bug between _build_drift_summary and _build_context. Added the AI Insights panel to the dashboard.

**Iteration 6 — UI Polish:** Replaced plain text status labels with PSI-graded badges. Moved the AI Insights panel below the feature table as a full-width expandable section. Improved typography, spacing, and code block scrollability.

**Iteration 7 — Documentation and Cleanup:** Moved all markdown documentation to the docs/ directory, rewrote the README, and created the comprehensive architecture document.

## 3.10 Economic Feasibility

DriftGauge is designed to be economically feasible for organisations of all sizes. The entire system is built on open-source components with no licensing costs. The infrastructure requirements are minimal — the system runs on a standard developer workstation or a modest cloud VM.

Compared to commercial alternatives, the cost savings are substantial. Enterprise ML monitoring platforms such as Arize AI and Fiddler AI charge thousands of dollars per month for comparable functionality. WhyLabs offers a free tier with significant limitations and charges for production usage. DriftGauge eliminates these costs entirely.

The development cost is also modest. The system was built by a small team using widely available open-source technologies. The codebase is approximately 2,000 lines of Python and 1,500 lines of JavaScript/JSX, making it maintainable by a single developer.

The operational cost is effectively zero for local deployment. For cloud deployment, a modest VM with 16 GB RAM (sufficient for Ollama) costs approximately $50–100 per month on major cloud providers, compared to thousands of dollars for equivalent commercial monitoring services.

---

---

# CHAPTER 4: SYSTEM DESIGN

## 4.1 Use Case Diagram

The Use Case Diagram for DriftGauge identifies the primary actor (the Data Scientist / ML Engineer) and the system use cases they can perform.

```
                    ┌─────────────────────────────────────────────┐
                    │              DriftGauge System               │
                    │                                             │
                    │  ┌─────────────────────┐                   │
                    │  │   Manage Projects    │                   │
                    │  │  (Create / Select)   │                   │
                    │  └─────────────────────┘                   │
                    │                                             │
                    │  ┌─────────────────────┐                   │
                    │  │   Upload Datasets    │                   │
                    │  │ (Baseline + Current) │                   │
                    │  └─────────────────────┘                   │
                    │                                             │
  ┌──────────┐      │  ┌─────────────────────┐                   │
  │  Data    │      │  │  Upload ML Model     │                   │
  │Scientist │──────┤  │    (.pkl file)       │                   │
  │  / ML    │      │  └─────────────────────┘                   │
  │Engineer  │      │                                             │
  └──────────┘      │  ┌─────────────────────┐                   │
                    │  │   Run Drift Analysis │                   │
                    │  │  (Fast / High Acc.)  │                   │
                    │  └─────────────────────┘                   │
                    │                                             │
                    │  ┌─────────────────────┐                   │
                    │  │  View Dashboard      │                   │
                    │  │ (Metrics, Charts,    │                   │
                    │  │  AI Insights)        │                   │
                    │  └─────────────────────┘                   │
                    │                                             │
                    │  ┌─────────────────────┐                   │
                    │  │  Browse Analysis     │                   │
                    │  │     History          │                   │
                    │  └─────────────────────┘                   │
                    │                                             │
                    │  ┌─────────────────────┐                   │
                    │  │  View Feature        │                   │
                    │  │  Distribution Chart  │                   │
                    │  └─────────────────────┘                   │
                    │                                             │
                    └─────────────────────────────────────────────┘

  Secondary Actors:
  ┌──────────┐      Interacts with: Run Drift Analysis
  │  Ollama  │◄─────(AI Insights generation via HTTP)
  │  (llama3)│
  └──────────┘
```

**Use Case Descriptions:**

- **Manage Projects:** The user creates a new project by providing a name and optional description. Projects serve as namespaces for datasets, models, and analyses. The user can switch between projects using the sidebar.

- **Upload Datasets:** The user uploads a baseline CSV (representing training data distribution) and a current CSV (representing recent production data). Files can be uploaded via file browser or drag-and-drop.

- **Upload ML Model:** Optionally, the user uploads a trained scikit-learn model in pickle format. The user also specifies the name of the target column in the datasets.

- **Run Drift Analysis:** The user selects a processing mode and initiates analysis. The system performs statistical drift detection, optional model evaluation, and AI insight generation.

- **View Dashboard:** The user views the analysis results including metric cards, the feature drift table with severity badges, distribution charts, model performance metrics, and AI insights.

- **Browse Analysis History:** The user views a list of past analyses for the selected project and can navigate to any historical analysis on the dashboard.

- **View Feature Distribution Chart:** The user selects a feature from the dropdown to view its baseline and current distributions as overlaid line charts.

## 4.2 Class Diagram

The class diagram describes the key classes in the DriftGauge backend and their relationships.

```
┌─────────────────────────────────────────────────────────────────┐
│                         DriftDetector                           │
├─────────────────────────────────────────────────────────────────┤
│ - threshold: float = 0.05                                       │
│ - wasserstein_threshold: float = 0.1                            │
│ - psi_threshold: float = 0.25                                   │
├─────────────────────────────────────────────────────────────────┤
│ + preprocess(baseline_df, current_df): tuple                    │
│ + apply_sampling(baseline_df, current_df, sample_size): tuple   │
│ + calculate_psi(expected, actual, bins): float                  │
│ + calculate_histogram_data(baseline, current, bins): dict       │
│ + get_numeric_columns(df): list                                 │
│ + detect_drift_fast(baseline_df, current_df): dict              │
│ + detect_drift_accurate(baseline_df, current_df): dict          │
│ + detect_drift(baseline_df, current_df, mode): dict             │
│ - _build_drift_summary(...): dict                               │
│ - _get_ai_insights(drift_summary, model_metrics): dict          │
└─────────────────────────────────────────────────────────────────┘
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ModelEvaluator                          │
├─────────────────────────────────────────────────────────────────┤
│ - feature_importance_threshold: float = 0.1                     │
│ - performance_drop_threshold: float = 0.05                      │
├─────────────────────────────────────────────────────────────────┤
│ + load_model(model_path): object                                │
│ + extract_feature_importance(model): array                      │
│ + calculate_metrics(y_true, y_pred): dict                       │
│ + evaluate_model(model, baseline_df, current_df, ...): dict     │
│ + generate_suggestions(drift_report, model_evaluation): list    │
│ + analyze_model_drift(model_path, baseline_df, ...): dict       │
└─────────────────────────────────────────────────────────────────┘
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          AIHelper                               │
├─────────────────────────────────────────────────────────────────┤
│ OLLAMA_URL: str = "http://localhost:11434/api/generate"          │
│ OLLAMA_MODEL: str = "llama3"                                    │
├─────────────────────────────────────────────────────────────────┤
│ + query_ollama(prompt): str                                     │
│ + generate_ai_insights(drift_summary, model_metrics): dict      │
│ + generate_ai_insight(drift_summary, performance_summary): str  │
│ - _build_context(...): str                                      │
│ - _ask_explanation(context): str                                │
│ - _ask_root_cause(context): str                                 │
│ - _ask_recommendation(context): str                             │
│ - _ask_code_fix(context, top_feature): str                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐     ┌──────────────────────────────┐
│         Project          │     │          Analysis            │
├──────────────────────────┤     ├──────────────────────────────┤
│ id: Integer (PK)         │     │ id: Integer (PK)             │
│ name: String (UNIQUE)    │1   *│ project_id: Integer (FK)     │
│ description: Text        │─────│ mode: String                 │
│ created_at: DateTime     │     │ drift_score: Float           │
└──────────────────────────┘     │ drifted_features: Text(JSON) │
                                 │ report: Text (JSON)          │
                                 │ created_at: DateTime         │
                                 └──────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      Pydantic Schemas                        │
├──────────────────────────────────────────────────────────────┤
│ ProjectCreate: { name, description? }                        │
│ ProjectResponse: { id, name, description, created_at }       │
│ AnalysisRequest: { mode, target_column?, feature_columns? }  │
│ ModelDriftRequest: { mode, target_column, feature_columns? } │
│ AnalysisResponse: { id, project_id, mode, drift_score,       │
│                     drifted_features, report, created_at }   │
└──────────────────────────────────────────────────────────────┘
```

## 4.3 Sequence Diagram

The sequence diagram illustrates the step-by-step interactions between the user, frontend, backend, and Ollama during a complete analysis with model monitoring.

```
User        Frontend       Backend API    DriftDetector  ModelEvaluator  AIHelper    Ollama
 │              │               │               │               │            │           │
 │─Create proj─►│               │               │               │            │           │
 │              │─POST /projects►               │               │            │           │
 │              │◄──ProjectResp─┤               │               │            │           │
 │              │               │               │               │            │           │
 │─Upload files─►               │               │               │            │           │
 │              │─POST /upload──►               │               │            │           │
 │              │─POST /upload──►               │               │            │           │
 │              │─POST /upload──►               │               │            │           │
 │              │               │               │               │            │           │
 │─Click Analyze►               │               │               │            │           │
 │              │─POST /analyze─►               │               │            │           │
 │              │               │─detect_drift()►               │            │           │
 │              │               │               │─preprocess()  │            │           │
 │              │               │               │─KS test       │            │           │
 │              │               │               │─Wasserstein   │            │           │
 │              │               │               │─PSI           │            │           │
 │              │               │               │─histograms    │            │           │
 │              │               │◄──drift_result┤               │            │           │
 │              │               │               │               │            │           │
 │              │               │─evaluate_model()──────────────►            │           │
 │              │               │               │               │─align feat │           │
 │              │               │               │               │─predict    │           │
 │              │               │               │               │─metrics    │           │
 │              │               │◄──────────────────model_eval──┤            │           │
 │              │               │               │               │            │           │
 │              │               │─generate_ai_insights()────────────────────►│           │
 │              │               │               │               │            │─POST ────►│
 │              │               │               │               │            │◄─explain──┤
 │              │               │               │               │            │─POST ────►│
 │              │               │               │               │            │◄─root────-┤
 │              │               │               │               │            │─POST ────►│
 │              │               │               │               │            │◄─recommend┤
 │              │               │               │               │            │─POST ────►│
 │              │               │               │               │            │◄─code_fix─┤
 │              │               │◄──────────────────────────ai_insights──────┤           │
 │              │               │               │               │            │           │
 │              │               │─save to SQLite│               │            │           │
 │              │◄──AnalysisResp┤               │               │            │           │
 │              │               │               │               │            │           │
 │◄─navigate to─┤               │               │               │            │           │
 │  /dashboard  │               │               │               │            │           │
 │              │               │               │               │            │           │
 │─Select feature►              │               │               │            │           │
 │◄─chart renders┤              │               │               │            │           │
```

## 4.4 Deployment Diagram

The deployment diagram shows the physical and logical deployment of DriftGauge components on a single developer machine.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer Workstation                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Web Browser                           │   │
│  │  React SPA (served by Vite dev server, port 5173)        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │UploadPage│ │Dashboard │ │ History  │ │Settings  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │ HTTP REST (localhost:8000)         │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │              FastAPI Application (Uvicorn)               │   │
│  │                     port 8000                            │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │   │
│  │  │DriftDetector │ │ModelEvaluator│ │   ai_helper.py   │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────┘ │   │
│  │                                                          │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐ │   │
│  │  │  SQLite Database     │  │  Filesystem Storage       │ │   │
│  │  │  driftgauge.db       │  │  uploads/{id}/            │ │   │
│  │  │  (projects, analyses)│  │  models/{id}/model.pkl    │ │   │
│  │  └──────────────────────┘  └──────────────────────────┘ │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │ HTTP (localhost:11434)             │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │              Ollama Runtime (port 11434)                  │   │
│  │              Model: llama3:latest                         │   │
│  │              (~4-8 GB RAM)                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4.5 State Chart Diagram

The state chart diagram describes the lifecycle of an Analysis object from creation to completion.

```
                    ┌─────────────┐
                    │   INITIAL   │
                    │  (No files) │
                    └──────┬──────┘
                           │ User uploads baseline CSV
                           ▼
                    ┌─────────────┐
                    │  BASELINE   │
                    │  UPLOADED   │
                    └──────┬──────┘
                           │ User uploads current CSV
                           ▼
                    ┌─────────────┐
                    │   READY     │◄──────────────────────┐
                    │ (Both files │                       │
                    │  present)   │                       │
                    └──────┬──────┘                       │
                           │                              │
              ┌────────────┼────────────┐                 │
              │            │            │                 │
              ▼            ▼            ▼                 │
        [Fast Mode]  [High Acc.]  [With Model]            │
              │            │            │                 │
              └────────────┼────────────┘                 │
                           │ POST /analyze                │
                           ▼                              │
                    ┌─────────────┐                       │
                    │  PROCESSING │                       │
                    │  (Running   │                       │
                    │   analysis) │                       │
                    └──────┬──────┘                       │
                           │                              │
              ┌────────────┴────────────┐                 │
              │                         │                 │
              ▼                         ▼                 │
       ┌─────────────┐          ┌─────────────┐          │
       │   SUCCESS   │          │   FAILED    │          │
       │  (Analysis  │          │  (HTTP 400/ │          │
       │  persisted) │          │   500 error)│          │
       └──────┬──────┘          └─────────────┘          │
              │                                           │
              ▼                                           │
       ┌─────────────┐                                   │
       │  DISPLAYED  │                                   │
       │ (Dashboard  │                                   │
       │  rendered)  │                                   │
       └──────┬──────┘                                   │
              │ User clicks "New Analysis"               │
              └───────────────────────────────────────────┘
```

## 4.6 Activity Diagram

The activity diagram describes the parallel and sequential activities during the analysis pipeline.

```
┌─────────────────────────────────────────────────────────────────┐
│                        START ANALYSIS                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Load CSV files    │
                    │  from filesystem   │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Preprocess:       │
                    │  align columns,    │
                    │  drop NaN rows     │
                    └─────────┬──────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
    ┌─────────▼──────────┐       ┌────────────▼───────────┐
    │    FAST MODE        │       │   HIGH ACCURACY MODE   │
    │  Sample 5000 rows  │       │   Full dataset         │
    │  KS test only      │       │   KS + Wasserstein     │
    │                    │       │   + PSI + histograms   │
    └─────────┬──────────┘       └────────────┬───────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Compute drift     │
                    │  score and         │
                    │  drifted features  │
                    └─────────┬──────────┘
                              │
              ┌───────────────┴───────────────┐
              │ Model uploaded?               │
    ┌─────────▼──────────┐       ┌────────────▼───────────┐
    │       NO            │       │          YES           │
    │  Skip model eval   │       │  Align features        │
    │                    │       │  Predict baseline      │
    │                    │       │  Predict current       │
    │                    │       │  Compute metrics       │
    │                    │       │  Extract importance    │
    │                    │       │  Generate suggestions  │
    └─────────┬──────────┘       └────────────┬───────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Build drift       │
                    │  summary (no       │
                    │  histogram data)   │
                    └─────────┬──────────┘
                              │
              ┌───────────────┴───────────────┐
              │ Ollama available?             │
    ┌─────────▼──────────┐       ┌────────────▼───────────┐
    │       NO            │       │          YES           │
    │  Return fallback   │       │  4 Ollama API calls    │
    │  static messages   │       │  (explanation,         │
    │                    │       │   root_cause,          │
    │                    │       │   recommendation,      │
    │                    │       │   code_fix)            │
    └─────────┬──────────┘       └────────────┬───────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Merge all results │
                    │  Save to SQLite    │
                    │  Return response   │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Frontend renders  │
                    │  Dashboard         │
                    └────────────────────┘
```

---

---

# CHAPTER 5: ARCHITECTURE AND IMPLEMENTATION

## 5.1 Frontend Implementation

The DriftGauge frontend is a single-page application (SPA) built with React 18 and bundled with Vite 5. The application follows a component-based architecture with a clear separation between page-level components, reusable UI components, and service modules.

### Application Structure and Routing

The root component `App.jsx` establishes the application layout and routing. It maintains the `selectedProject` state, which represents the currently active project and is passed as a prop to all page components. The layout consists of a fixed-width sidebar (224px) and a main content area that occupies the remaining viewport width. React Router DOM v6 handles client-side routing with four routes: the upload page at the root path, the dashboard at `/dashboard`, the analysis history at `/history`, and settings at `/settings`.

### Sidebar Component

The `Sidebar.jsx` component serves dual purposes: navigation and project management. It fetches the list of projects from the backend on mount and displays them as a scrollable list. Each project entry is clickable and sets the selected project in the parent state. An inline form allows users to create new projects without leaving the current page. The sidebar highlights the active route using React Router's `useLocation` hook and applies conditional styling to the active navigation item.

### Upload Page

The `UploadPage.jsx` component manages the complete file upload and analysis initiation workflow. It maintains local state for the baseline file, current file, model file, target column name, processing mode, and loading status. The component implements drag-and-drop file upload using the HTML5 Drag and Drop API, with visual feedback when files are dragged over the drop zones. File validation is performed client-side before upload — CSV files are accepted for datasets and `.pkl` files for models.

The ML Model Monitoring section is conditionally rendered based on a toggle switch. When enabled, it reveals the model upload zone and target column input. The processing mode selector presents two options as clickable cards with visual selection indicators. The "Start Drift Analysis" button is disabled until both required files are uploaded, preventing premature submission.

Upon successful analysis, the component navigates to the dashboard using React Router's `useNavigate` hook, passing the complete analysis result in the navigation state object. This pattern avoids an additional API call on the dashboard and ensures the freshest data is displayed immediately.

### Dashboard Page

The `DashboardPage.jsx` component is the most complex component in the application. It implements a two-column layout: a flexible main column on the left and a fixed-width (380px) feature detail panel on the right.

The component checks `location.state?.analysisResult` on mount. If a fresh result is present (from a just-completed analysis), it uses that directly. Otherwise, it fetches the most recent analysis for the selected project from the backend. After consuming the navigation state, it clears it using `window.history.replaceState` to prevent stale data on page refresh.

The `DriftBadge` component implements the PSI-based severity grading. It accepts `psiScore` and `pValue` as props and returns a styled badge element. PSI is used as the primary signal when available; p-value is used as a fallback for fast mode results where PSI is not computed.

The `AIInsightsPanel` component renders the four AI insight sections in a collapsible panel below the feature table. It uses Framer Motion's `AnimatePresence` and `motion.div` for smooth expand/collapse animation. The panel detects fallback content by checking for known fallback strings in the explanation field and displays an "Ollama offline" warning badge when detected.

The feature distribution chart is rendered in the right panel using the `FeatureDistributionChart` component. The selected feature is tracked in local state and updated when the user clicks a table row or changes the dropdown selector. The right panel also displays a PSI scale legend for quick reference.

### Feature Distribution Chart

The `FeatureDistributionChart.jsx` component renders a Recharts `LineChart` with two data series: baseline (blue, `#3b82f6`) and current (orange, `#f59e0b`). The X-axis represents bin centre values and the Y-axis represents frequency as a percentage. The chart uses a `ResponsiveContainer` to fill its parent element. Tooltips display the bin value and both frequencies on hover. The chart data comes from the `histogram_data.histogram` array in the feature scores, which contains objects with `bin`, `baseline`, and `current` keys.

### State Management Philosophy

DriftGauge deliberately avoids global state management libraries such as Redux or Zustand. The application's state requirements are modest: the selected project is the only truly global state, and it is managed with a single `useState` in `App.jsx`. All other state is local to the component that owns it. This approach keeps the codebase simple and reduces cognitive overhead for developers maintaining the system.

### Styling Architecture

The application uses Tailwind CSS for utility-first styling, supplemented by custom CSS classes defined in `index.css` for components that require more complex styling. The custom classes include `.card` for the glassmorphism card style, `.badge`, `.badge-stable`, `.badge-monitor`, `.badge-critical` for the drift severity badges, `.ai-panel`, `.ai-section`, `.ai-section-label`, `.ai-section-text`, and `.ai-code-block` for the AI insights panel. The colour scheme uses `#0f1419` for the background, `#1a1f2e` for cards, and `#2563eb` for the primary accent colour.

## 5.2 Backend Implementation

The DriftGauge backend is a FastAPI application that provides a RESTful API for all system operations. FastAPI was chosen for its high performance (built on Starlette and Pydantic), automatic OpenAPI documentation generation, and native support for asynchronous request handling.

### Application Initialisation

The `main.py` module initialises the FastAPI application, registers CORS middleware, creates database tables, and performs a startup Ollama connectivity check. The CORS middleware is configured to allow requests from `localhost:5173` and `localhost:5174` (the Vite development server ports). The `_check_ollama()` function makes a GET request to the Ollama `/api/tags` endpoint on startup and logs the available models, warning if llama3 is not found.

### Database Layer

The database layer uses SQLAlchemy 2.0 with a SQLite backend. The `database.py` module creates the engine with `check_same_thread=False` (required for SQLite with FastAPI's threading model), defines the session factory, and provides the `get_db()` dependency function that yields a database session and ensures it is closed after each request.

The `models.py` module defines two SQLAlchemy ORM models: `Project` and `Analysis`. The `Analysis` model stores the complete analysis result as a JSON string in the `report` column, allowing the schema to evolve without database migrations. The `drifted_features` column stores a JSON array of feature names.

### Request Validation

All request bodies are validated using Pydantic schemas defined in `schemas.py`. The `AnalysisRequest` schema accepts `mode` (required), `target_column` (optional), and `feature_columns` (optional). The `AnalysisResponse` schema defines the structure of the response, with the `report` field typed as `Dict` to accommodate the variable structure of analysis results.

### File Management

Uploaded files are stored in two directory trees: `uploads/{project_id}/` for CSV files and `models/{project_id}/` for model files. Both directories are created automatically using `Path.mkdir(exist_ok=True)`. File uploads use FastAPI's `UploadFile` type, which provides asynchronous file reading. Files are written to disk using synchronous I/O within the async endpoint handlers, which is acceptable for the expected file sizes.

### Unified Analysis Pipeline

The `analyze_drift` endpoint implements the unified pipeline. It first runs drift detection unconditionally, then conditionally runs model evaluation if a model file exists and a target column is provided. If model evaluation succeeds, it re-calls `generate_ai_insights` with the enriched context (including model metrics and feature importance). If model evaluation fails for any reason, the failure is caught and stored as `{"error": str(e)}` in the `model_metrics` field, ensuring that drift results are always returned regardless of model evaluation success.

The complete result dictionary is constructed by spreading the drift result and adding model-specific fields. This approach ensures backward compatibility — clients that do not use model monitoring receive the same drift result structure as before, with `model_metrics` set to `None`.

## 5.3 Drift Detection Engine

The drift detection engine is the core analytical component of DriftGauge. It is implemented in the `DriftDetector` class in `drift_engine.py`.

### Kolmogorov-Smirnov Test

The two-sample Kolmogorov-Smirnov (KS) test is a non-parametric statistical test that determines whether two samples are drawn from the same distribution. The test statistic D is defined as:

```
D = sup_x |F_baseline(x) - F_current(x)|
```

where F_baseline(x) and F_current(x) are the empirical cumulative distribution functions (ECDFs) of the baseline and current samples respectively, and sup denotes the supremum (maximum) over all values of x.

The null hypothesis of the KS test is that both samples are drawn from the same distribution. A small p-value (below the significance threshold of 0.05) leads to rejection of the null hypothesis, indicating that the distributions are significantly different.

The KS test is implemented using `scipy.stats.ks_2samp(baseline[col], current[col])`, which returns both the test statistic and the p-value. The test is applied independently to each numeric feature, providing feature-level drift detection.

The KS test has several properties that make it well-suited for drift detection: it is non-parametric (makes no assumptions about the underlying distribution), it is sensitive to differences in both location and shape of the distributions, and it is computationally efficient (O(n log n) for sorted samples).

### Wasserstein Distance

The Wasserstein distance (also known as the Earth Mover's Distance or EMD) measures the minimum amount of "work" required to transform one probability distribution into another. For one-dimensional distributions, the Wasserstein-1 distance is defined as:

```
W_1(P, Q) = ∫|F_P(x) - F_Q(x)| dx
```

where F_P and F_Q are the cumulative distribution functions of distributions P and Q respectively. This is equivalent to the area between the two CDFs.

The Wasserstein distance provides a geometrically meaningful measure of distributional difference that is sensitive to the magnitude of the shift, not just its statistical significance. A feature with a large mean shift will have a large Wasserstein distance even if the KS test p-value is not significant (which can happen with small sample sizes).

The Wasserstein distance is implemented using `scipy.stats.wasserstein_distance(baseline[col], current[col])`. The threshold of 0.1 is used as the default cutoff, though this threshold is scale-dependent and may need adjustment for features with very large or very small value ranges.

### Population Stability Index

The Population Stability Index (PSI) measures the shift in the distribution of a variable between two time periods. It is calculated by discretising both distributions into bins and comparing the proportion of observations in each bin.

The PSI formula is:

```
PSI = Σ_i (Actual%_i - Expected%_i) × ln(Actual%_i / Expected%_i)
```

where the sum is over all bins i, Actual%_i is the proportion of current observations in bin i, and Expected%_i is the proportion of baseline observations in bin i.

In DriftGauge, PSI is computed using 10 equal-width bins defined by the range of the baseline distribution. A small epsilon value (1e-6) is added to all proportions to avoid division by zero and undefined logarithms when a bin is empty in one of the datasets.

The PSI thresholds used in DriftGauge follow the industry standard:
- PSI < 0.10: No significant change (Stable)
- 0.10 ≤ PSI < 0.25: Moderate change (Monitor)
- PSI ≥ 0.25: Significant change (Critical Drift)

These thresholds were originally established in the credit risk industry and have been validated empirically across multiple domains.

### Multi-Criteria Drift Decision

A key design decision in DriftGauge is the use of a multi-criteria OR logic for the drift decision. A feature is classified as drifted if any of the following conditions are met:

```
is_drifted = (p_value < 0.05) OR (wasserstein_distance > 0.1) OR (psi_score >= 0.25)
```

This approach is more sensitive than any single criterion alone. The KS test may miss gradual shifts that are statistically significant but small in magnitude. The Wasserstein distance may flag large shifts in features with high variance even when the KS test does not. PSI may flag population shifts that are not captured by the other two metrics. By combining all three, the system provides more comprehensive coverage of different types of drift.

### Histogram Computation

For visualisation purposes, DriftGauge computes 20-bin histograms for each feature in High Accuracy Mode. The bin edges are defined by the combined range of both distributions (min of both minimums to max of both maximums), ensuring that both distributions are plotted on the same scale. The histogram values are normalised to percentages (frequency / total × 100) to make the distributions comparable regardless of sample size differences.

The histogram data is stored as an array of objects with `bin` (bin centre), `baseline` (baseline frequency %), and `current` (current frequency %) keys, which maps directly to the Recharts data format.

### Fast Mode vs High Accuracy Mode

Fast Mode is designed for quick approximate results. It samples up to 5,000 rows from each dataset using a fixed random seed (42) for reproducibility, then applies only the KS test. This mode is appropriate for large datasets where a quick check is needed, or for frequent monitoring where speed is prioritised over depth.

High Accuracy Mode uses the full dataset and applies all three statistical tests plus histogram computation. It is appropriate for periodic deep analysis, model retraining decisions, and situations where the full characterisation of drift is needed.

## 5.4 Module Descriptions

**`main.py`** — The application entry point. Defines all FastAPI routes, orchestrates the analysis pipeline, manages file I/O, and handles database persistence. Contains the startup Ollama check and logging configuration.

**`drift_engine.py`** — Implements the `DriftDetector` class. Contains all statistical computation logic including KS test, Wasserstein distance, PSI, histogram computation, and the multi-criteria drift decision. Also contains the `_build_drift_summary` and `_get_ai_insights` methods that bridge the drift engine to the AI layer.

**`model_evaluator.py`** — Implements the `ModelEvaluator` class. Handles model loading, feature alignment, prediction, metric computation, feature importance extraction, and suggestion generation. The suggestion engine implements rule-based logic that combines drift severity with model performance metrics.

**`ai_helper.py`** — Implements the Ollama integration. Contains the `query_ollama` function for low-level HTTP communication, the `_build_context` function for constructing the prompt context, four focused prompt functions, and the `generate_ai_insights` public API. Implements comprehensive error handling with graceful fallback.

**`models.py`** — Defines SQLAlchemy ORM models for the `projects` and `analyses` tables.

**`schemas.py`** — Defines Pydantic schemas for request validation and response serialisation.

**`database.py`** — Configures the SQLAlchemy engine, session factory, and provides the `get_db` dependency function.

## 5.5 API Design

The DriftGauge API follows RESTful conventions with resource-oriented URLs and standard HTTP methods.

### Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects` | Create a new project |
| GET | `/projects` | List all projects |
| POST | `/projects/{id}/upload-baseline` | Upload baseline CSV |
| POST | `/projects/{id}/upload-current` | Upload current CSV |
| POST | `/projects/{id}/upload-model` | Upload .pkl model |
| POST | `/projects/{id}/analyze` | Run unified analysis |
| GET | `/projects/{id}/analyses` | Get all analyses for project |
| GET | `/analysis/{id}` | Get specific analysis by ID |
| POST | `/projects/{id}/analyze-model-drift` | Legacy model drift endpoint |

### Analysis Request Schema

```json
{
  "mode": "fast" | "high_accuracy",
  "target_column": "string (optional)",
  "feature_columns": ["string"] (optional)
}
```

### Analysis Response Schema (abbreviated)

```json
{
  "id": 42,
  "project_id": 1,
  "mode": "high_accuracy",
  "drift_score": 0.67,
  "drifted_features": ["income", "credit_score"],
  "report": {
    "feature_scores": {
      "income": {
        "ks_statistic": 0.333,
        "p_value": 0.0,
        "wasserstein_distance": 15621.45,
        "psi_score": 1.03,
        "histogram_data": { "histogram": [...] }
      }
    },
    "ai_insights": {
      "explanation": "...",
      "root_cause": "...",
      "recommendation": "...",
      "code_fix": "..."
    },
    "model_metrics": {
      "baseline_accuracy": 0.91,
      "current_accuracy": 0.74,
      "performance_drop": 0.17,
      "has_degradation": true
    },
    "suggestions": ["..."]
  },
  "created_at": "2026-03-24T10:00:00"
}
```

---

---

# CHAPTER 6: TESTING

## 6.1 Testing Strategy

The testing strategy for DriftGauge encompasses four levels of testing: unit testing of individual modules, integration testing of module interactions, system testing of the complete end-to-end workflow, and performance testing of the drift detection engine under varying dataset sizes.

The testing approach is pragmatic and focused on the most critical components: the statistical computations in the drift engine, the feature alignment logic in the model evaluator, and the Ollama integration in the AI helper. These components contain the most complex logic and are the most likely sources of subtle bugs.

## 6.2 Unit Testing

### Drift Detection Engine Tests

**Test: KS Test Correctness**
Two samples drawn from identical normal distributions (mean=0, std=1) are passed to the KS test. The expected result is a high p-value (> 0.05), indicating no significant drift. Two samples drawn from distributions with different means (mean=0 vs mean=2) are expected to produce a low p-value (< 0.05), indicating significant drift.

```python
# Identical distributions — no drift expected
baseline = np.random.normal(0, 1, 1000)
current  = np.random.normal(0, 1, 1000)
ks_stat, p_value = stats.ks_2samp(baseline, current)
assert p_value > 0.05  # No drift

# Different distributions — drift expected
current_shifted = np.random.normal(2, 1, 1000)
ks_stat, p_value = stats.ks_2samp(baseline, current_shifted)
assert p_value < 0.05  # Drift detected
```

**Test: PSI Calculation**
PSI is computed for two identical distributions and verified to be near zero. PSI is then computed for two distributions with a large shift and verified to exceed 0.25.

```python
detector = DriftDetector()
# Identical distributions
psi = detector.calculate_psi(pd.Series(baseline), pd.Series(baseline))
assert psi < 0.01  # Near zero for identical distributions

# Shifted distribution
psi_shifted = detector.calculate_psi(
    pd.Series(np.random.normal(0, 1, 1000)),
    pd.Series(np.random.normal(3, 1, 1000))
)
assert psi_shifted > 0.25  # Significant drift
```

**Test: Histogram Data Structure**
The `calculate_histogram_data` method is tested to verify that it returns the correct structure with 20 bins, that bin values are within the combined range of both distributions, and that frequencies sum to approximately 100%.

**Test: Numeric Column Detection**
The `get_numeric_columns` method is tested with DataFrames containing mixed types (numeric, string, datetime) to verify that only numeric columns are returned.

**Test: Preprocessing**
The `preprocess` method is tested with DataFrames that have different column sets to verify that only common columns are retained, and with DataFrames containing NaN values to verify that rows with NaN are dropped.

### Model Evaluator Tests

**Test: Feature Alignment**
A model trained on features [A, B, C] is evaluated on a DataFrame with columns [C, A, B, D] (different order, extra column). The test verifies that the features are reordered to [A, B, C] and that column D is dropped before prediction.

**Test: Missing Feature Handling**
A model trained on features [A, B, C] is evaluated on a DataFrame missing column B. The test verifies that column B is added with default value 0 and that the model receives features in the correct order.

**Test: Metric Calculation**
Known predictions and ground truth labels are passed to `calculate_metrics`. The expected accuracy, precision, recall, and F1 score are computed manually and compared to the function output.

**Test: Performance Degradation Detection**
`has_degradation` is verified to be True when `performance_drop > 0.05` and False when `performance_drop <= 0.05`.

### AI Helper Tests

**Test: Ollama Connectivity**
The `query_ollama` function is tested with a simple prompt ("Say OK in one word") and verified to return a non-empty string that does not start with "Error:".

**Test: Fallback on Connection Error**
The `query_ollama` function is tested with an invalid URL to verify that it returns an "Error: Could not connect" string rather than raising an exception.

**Test: Code Fence Stripping**
The `_ask_code_fix` function is tested with a mocked Ollama response that includes markdown code fences (```python ... ```) and verified that the fences are stripped from the output.

**Test: No-Drift Shortcut**
`generate_ai_insights` is called with an empty `drifted_features` list and no model degradation. The test verifies that no Ollama calls are made and that the "stable" messages are returned.

## 6.3 Integration Testing

### Upload and Analysis Integration

The complete upload and analysis workflow is tested end-to-end using the FastAPI test client. A baseline CSV and current CSV are uploaded to a test project, and the `/analyze` endpoint is called. The test verifies that:
- The response status code is 200
- The response contains `drift_score`, `drifted_features`, and `report` fields
- The `report` contains `feature_scores` with the expected feature names
- The `report` contains `ai_insights` with all four keys

### Model Evaluation Integration

A sample model is created using `create_sample_model.py`, uploaded to a test project, and the `/analyze` endpoint is called with a `target_column`. The test verifies that:
- `model_metrics` is present in the report
- `baseline_accuracy` and `current_accuracy` are between 0 and 1
- `feature_importance` contains entries for the model's features
- `suggestions` is a non-empty list

### Database Persistence Integration

After running an analysis, the `/projects/{id}/analyses` endpoint is called to verify that the analysis was persisted. The `/analysis/{id}` endpoint is called with the returned ID to verify that the full report can be retrieved and matches the original response.

### Frontend-Backend Integration

The frontend API client (`services/api.js`) is tested by running the complete application and verifying that:
- Project creation via the sidebar creates a project visible in the list
- File uploads succeed and show the success state in the UI
- Analysis completion navigates to the dashboard with results
- History page shows the completed analysis

## 6.4 System Testing

System testing validates the complete end-to-end behaviour of DriftGauge from the user's perspective.

**Test Scenario 1 — Drift-Only Analysis (Fast Mode):**
A baseline dataset with 10,000 rows and a current dataset with 10,000 rows (with artificially shifted distributions for 3 features) are uploaded. Fast Mode is selected. The test verifies that the 3 shifted features are detected as drifted, the drift score is 3/total_features, and the dashboard displays the correct badges.

**Test Scenario 2 — Drift-Only Analysis (High Accuracy Mode):**
The same datasets are analysed in High Accuracy Mode. The test verifies that PSI scores are present for all features, histogram data is available for distribution charts, and the severity badges correctly reflect the PSI values.

**Test Scenario 3 — Full Pipeline with Model:**
A Random Forest classifier trained on the baseline dataset is uploaded along with the datasets. The test verifies that model metrics are displayed, feature importance is shown, suggestions are generated, and AI insights are populated (when Ollama is running).

**Test Scenario 4 — Ollama Offline:**
The analysis is run with Ollama not running. The test verifies that the analysis completes successfully, drift results are correct, and the AI insights panel shows the "Ollama offline" warning badge with fallback messages.

**Test Scenario 5 — History Navigation:**
After completing an analysis, the user navigates to the History page and clicks on the completed analysis. The test verifies that the dashboard loads with the historical analysis data.

## 6.5 Performance Testing

Performance testing evaluates the system's behaviour under varying dataset sizes and modes.

| Dataset Size | Mode | Processing Time | Memory Usage |
|-------------|------|----------------|--------------|
| 1,000 rows | Fast | < 0.1s | < 50 MB |
| 10,000 rows | Fast | < 0.5s | < 100 MB |
| 100,000 rows | Fast | < 2s | < 200 MB |
| 1,000 rows | High Accuracy | < 0.5s | < 100 MB |
| 10,000 rows | High Accuracy | < 3s | < 200 MB |
| 100,000 rows | High Accuracy | < 30s | < 500 MB |

The AI insight generation time is dominated by Ollama inference and is independent of dataset size. With llama3 on a CPU, each of the four prompts takes approximately 10–30 seconds, for a total AI generation time of 40–120 seconds. On a machine with a GPU, this is reduced to 5–15 seconds total.

The SQLite database performs well for the expected usage patterns. Analysis records are typically 50–500 KB in size (dominated by histogram data). For projects with hundreds of analyses, the database remains responsive for all read operations.

---

---

# CHAPTER 7: RESULTS AND DISCUSSION

## Drift Detection Results

DriftGauge was evaluated on a synthetic dataset designed to simulate a realistic credit risk scoring scenario. The baseline dataset contains 10,000 records representing the training population, with six numeric features: `income`, `credit_score`, `loan_amount`, `age`, `employment_years`, and `default` (the target variable). The current dataset contains 10,000 records representing a production population collected six months after model deployment, with artificially introduced distribution shifts in several features to simulate real-world drift.

The High Accuracy Mode analysis was run on this dataset, producing the following results:

| Feature | KS Statistic | P-Value | Wasserstein | PSI | Status Badge |
|---------|-------------|---------|-------------|-----|--------------|
| income | 0.333 | 0.0000 | 15621.45 | 1.03 | Critical Drift |
| credit_score | 0.351 | 0.0000 | 51.67 | 0.96 | Critical Drift |
| loan_amount | 0.351 | 0.0000 | 50434.51 | 0.54 | Critical Drift |
| age | 0.360 | 0.0000 | 9.87 | 0.87 | Critical Drift |
| default | 0.170 | 0.0000 | 0.17 | 0.12 | Monitor |
| employment_years | 0.347 | 0.0000 | 1.98 | 0.88 | Critical Drift |

The overall drift score was 100% (6 out of 6 features drifted), indicating severe distributional shift across the entire feature space. This result is consistent with the synthetic data generation, which introduced shifts in all features to simulate a significant population change.

The PSI values are particularly informative. The `income` feature has a PSI of 1.03, which is dramatically above the 0.25 threshold for significant drift. This indicates that the income distribution in the current population is fundamentally different from the training population — likely reflecting a change in the target demographic being served by the model. The `default` feature, with a PSI of 0.12, shows only moderate drift, suggesting that the label distribution has not changed as dramatically as the input features.

The Wasserstein distances reveal the scale of the shifts. The `income` feature has a Wasserstein distance of 15,621.45, reflecting the large absolute values of income (in currency units) and the significant shift in the income distribution. The `employment_years` feature has a much smaller Wasserstein distance of 1.98, reflecting both the smaller scale of the feature and the more modest shift.

## Feature-Wise Analysis

The feature distribution charts provide visual confirmation of the statistical findings. For the `income` feature, the baseline distribud for use with real production datasets in operational ML monitoring scenarios.
SQLAlchemy Documentation. (2024). SQLAlchemy — The Python SQL Toolkit and Object Relational Mapper. Retrieved from https://www.sqlalchemy.org

25. Recharts Documentation. (2024). Recharts — A composable charting library built on React components. Retrieved from https://recharts.org

---

*End of Report*

---

> **Note:** This report was prepared for academic submission purposes. All statistical results presented in Chapter 7 are based on synthetic datasets generated for evaluation purposes. The system is designeetection. *Proceedings of the 39th International Conference on Machine Learning*, PMLR 162, 4087–4111.

21. FastAPI Documentation. (2024). FastAPI — Modern, fast web framework for building APIs with Python. Retrieved from https://fastapi.tiangolo.com

22. React Documentation. (2024). React — The library for web and native user interfaces. Retrieved from https://react.dev

23. Ollama Documentation. (2024). Ollama — Get up and running with large language models locally. Retrieved from https://ollama.com

24. loying machine learning: A survey of case studies. *ACM Computing Surveys*, 55(6), 1–29.

18. Shankar, S., Garcia, R., Hellerstein, J. M., & Parameswaran, A. (2022). Operationalizing machine learning: An interview study. *arXiv preprint arXiv:2209.09125*.

19. Bommasani, R., Hudson, D. A., Aditi, E., Altman, R., Arora, S., von Arx, S., ... & Liang, P. (2021). On the opportunities and risks of foundation models. *arXiv preprint arXiv:2108.07258*.

20. Cobb, O., & Van Looveren, A. (2022). Context-aware drift debt in machine learning systems. *Advances in Neural Information Processing Systems*, 28.

15. Klaise, J., Van Looveren, A., Vacanti, G., & Coca, A. (2020). Alibi Detect: Algorithms for outlier, adversarial and drift detection. *Journal of Machine Learning Research*, 23(172), 1–6.

16. Klaise, J., Van Looveren, A., Cox, C., Vacanti, G., & Coca, A. (2021). Monitoring and explainability of models in production. *arXiv preprint arXiv:2007.06299*.

17. Paleyes, A., Urma, R. G., & Lawrence, N. D. (2022). Challenges in depmann, S., & Lipton, Z. C. (2019). Failing loudly: An empirical study of methods for detecting dataset shift. *Advances in Neural Information Processing Systems*, 32.

13. Breck, E., Cai, S., Nielsen, E., Salib, M., & Sculley, D. (2017). The ML test score: A rubric for ML production readiness and technical debt reduction. *Proceedings of the IEEE International Conference on Big Data*, 1123–1132.

14. Sculley, D., Holt, G., Golovin, D., Davydov, E., Phillips, T., Ebner, D., ... & Dennison, D. (2015). Hidden technical dime-changing data with adaptive windowing. *Proceedings of the 2007 SIAM International Conference on Data Mining*, 443–448.

10. Page, E. S. (1954). Continuous inspection schemes. *Biometrika*, 41(1/2), 100–115.

11. Frías-Blanco, I., del Campo-Ávila, J., Ramos-Jiménez, G., Morales-Bueno, R., Ortiz-Díaz, A., & Caballero-Mota, Y. (2015). Online and non-parametric drift detection methods based on Hoeffding's bounds. *IEEE Transactions on Knowledge and Data Engineering*, 27(3), 810–823.

12. Rabanser, S., Günneasi, C., & Guibas, L. J. (2000). The Earth Mover's Distance as a metric for image retrieval. *International Journal of Computer Vision*, 40(2), 99–121.

7. Siddiqi, N. (2006). *Credit Risk Scorecards: Developing and Implementing Intelligent Credit Scoring*. Wiley.

8. Gama, J., Medas, P., Castillo, G., & Rodrigues, P. (2004). Learning with drift detection. *Advances in Artificial Intelligence – SBIA 2004*, Lecture Notes in Computer Science, 3171, 286–295.

9. Bifet, A., & Gavalda, R. (2007). Learning from tQuiñonero-Candela, J., Sugiyama, M., Schwaighofer, A., & Lawrence, N. D. (2009). *Dataset Shift in Machine Learning*. MIT Press.

3. Kolmogorov, A. N. (1933). Sulla determinazione empirica di una legge di distribuzione. *Giornale dell'Istituto Italiano degli Attuari*, 4, 83–91.

4. Smirnov, N. V. (1948). Table for estimating the goodness of fit of empirical distributions. *Annals of Mathematical Statistics*, 19(2), 279–281.

5. Villani, C. (2008). *Optimal Transport: Old and New*. Springer.

6. Rubner, Y., Tomation — including the comprehensive architecture document, the README, and this project report — is designed to be educational as well as practical, helping practitioners understand the statistical foundations of drift detection and the engineering patterns for building monitoring systems.

---

# CHAPTER 11: REFERENCES

1. Shimodaira, H. (2000). Improving predictive inference under covariate shift by weighting the log-likelihood function. *Journal of Statistical Planning and Inference*, 90(2), 227–244.

2. olders.

## SDG 17 — Partnerships for the Goals

SDG 17 emphasises the importance of partnerships and the sharing of knowledge and technology. DriftGauge is released as open-source software, enabling the global community of data scientists and ML engineers to use, adapt, and contribute to the system. By sharing the implementation of drift detection algorithms, model evaluation methods, and AI integration patterns, the project contributes to the collective knowledge base of the ML community.

The system's documentns may no longer be valid for the current population.

DriftGauge supports AI accountability by providing a systematic record of model performance over time. The analysis history feature creates an audit trail of drift monitoring activities, demonstrating that the organisation is actively monitoring its AI systems. The AI-generated explanations translate statistical findings into natural language, making it easier for organisations to communicate the status of their AI systems to regulators, auditors, and other stakehmographic features are driving the shift, enabling targeted investigation of potential fairness issues.

## SDG 16 — Peace, Justice and Strong Institutions

SDG 16 promotes accountable and transparent institutions. In the context of AI systems, transparency and accountability require that organisations can explain and justify the decisions made by their models. A model that has drifted significantly from its training distribution may make decisions that are difficult to justify, as the model's learned pattere model's predictions may be systematically biased against the new population if the model was trained on a different demographic.

DriftGauge directly addresses this risk by detecting when the distribution of the population being served has shifted from the training distribution. By alerting data scientists to these shifts, the system enables timely model updates that maintain fairness and accuracy across diverse populations. The feature-level drift analysis is particularly valuable for identifying which deng, contributing to the development of more resilient and trustworthy AI infrastructure globally.

## SDG 10 — Reduced Inequalities

SDG 10 aims to reduce inequality within and among countries. Machine learning models deployed in high-stakes domains such as credit scoring, hiring, and healthcare can perpetuate or amplify existing inequalities if they are not monitored for distributional shift. When the population served by a model changes (e.g., a credit scoring model is deployed in a new geographic market), thriftGauge democratises access to tools that ensure AI systems remain reliable and accurate over time. This is particularly relevant for small and medium enterprises (SMEs) and organisations in developing economies that cannot afford enterprise monitoring platforms.

The system's lightweight architecture — running entirely on local hardware without cloud dependencies — reduces the infrastructure barrier to responsible AI deployment. This enables a broader range of organisations to implement systematic ML monitorith several of the United Nations Sustainable Development Goals (SDGs), reflecting the broader societal impact of responsible AI monitoring.

## SDG 9 — Industry, Innovation and Infrastructure

SDG 9 calls for building resilient infrastructure, promoting inclusive and sustainable industrialisation, and fostering innovation. DriftGauge contributes to this goal by providing open-source infrastructure for responsible AI deployment. By making ML monitoring accessible to organisations without large MLOps budgets, Dr more complex model types such as neural networks (via ONNX format) and gradient boosting frameworks (XGBoost, LightGBM) would also broaden the system's applicability.

## Multi-User Support

The current system has no authentication or authorisation mechanism. Adding multi-user support with role-based access control would make DriftGauge suitable for team environments where different users should have different levels of access to projects and analyses.

---

# CHAPTER 10: SDG ALIGNMENT

DriftGauge aligns wiport categorical drift detection would require implementing appropriate statistical tests such as the chi-squared test for categorical distributions and the Jensen-Shannon divergence for comparing categorical probability distributions.

## Model Type Expansion

The current model evaluation component supports only classification models. Extending support to regression models would require implementing regression metrics (MAE, RMSE, R²) and appropriate drift detection for continuous target variables. Support for replacing the production model with the retrained version. The system would need to implement safeguards to prevent unnecessary retraining (e.g., requiring human approval for high-stakes models) and to validate the retrained model before deployment.

## Categorical Feature Support

The current drift detection engine only analyses numeric features. Many real-world datasets contain categorical features (e.g., country, product category, user segment) that can also drift significantly. Extending the system to supt does not take any automated action. A natural extension would be the implementation of automated model retraining triggered by drift detection. When drift exceeds a configurable threshold and model performance degradation is detected, the system could automatically initiate a retraining pipeline using the current dataset.

This would require integration with a model training framework (such as scikit-learn pipelines or MLflow), a mechanism for storing and versioning trained models, and a deployment pipeline foting these methods would provide more comprehensive drift coverage, particularly for datasets where feature correlations are important for model performance.

Dimensionality reduction techniques such as PCA or UMAP could be used to project high-dimensional feature spaces into lower-dimensional representations before applying multivariate tests, making the approach computationally feasible for datasets with many features.

## Automated Retraining

The current system detects drift and generates recommendations buanifests in the correlations between features rather than in the marginal distributions of individual features. For example, if the correlation between income and credit score changes significantly while both marginal distributions remain stable, the current system would not detect this as drift.

Multivariate drift detection methods such as Maximum Mean Discrepancy (MMD) and the Least-Squares Density Difference (LSDD) test can detect changes in the joint distribution of multiple features simultaneously. Implemennes.

Real-time monitoring would also enable the implementation of alerting mechanisms — email notifications, Slack messages, or webhook calls — when drift exceeds configurable thresholds. This would transform DriftGauge from a reactive analysis tool into a proactive monitoring system.

## Multivariate Drift Detection

The current drift detection engine analyses each feature independently (univariate analysis). While this approach is interpretable and computationally efficient, it cannot detect drift that miated feature values, maintaining a rolling window of recent observations, and computing drift metrics incrementally as new data arrives.

The ADWIN (Adaptive Windowing) algorithm would be well-suited for this purpose, as it automatically adjusts the window size based on detected changes and provides theoretical guarantees on false positive and false negative rates. Integration with message queuing systems such as Apache Kafka or Redis Streams would enable the system to handle high-throughput prediction pipelipen-source components can provide the core monitoring capabilities needed by the majority of ML teams in production.

---

# CHAPTER 9: FUTURE ENHANCEMENTS

## Real-Time Monitoring

The current implementation of DriftGauge operates in batch mode, comparing two complete datasets. A significant enhancement would be the addition of real-time or near-real-time monitoring capabilities. This would involve implementing a streaming data ingestion pipeline that continuously receives prediction requests and their assoctifies severe distributional shifts, accurately measures the magnitude of drift using multiple metrics, and correctly correlates drift severity with model performance degradation. The suggestion engine's cross-referencing of drifted features with feature importance provides actionable guidance that goes beyond simple drift reporting.

In conclusion, DriftGauge demonstrates that comprehensive ML monitoring does not require enterprise-grade infrastructure or cloud services. A well-designed, lightweight system built on o than single-prompt approaches that suffered from JSON truncation issues.

The system's design philosophy of lightweight, self-hosted deployment without cloud dependencies makes it accessible to teams of all sizes, including academic projects, startups, and organisations with strict data privacy requirements. The entire system runs on a standard developer workstation with no external API keys or subscription costs.

The evaluation on a synthetic credit risk dataset demonstrated that DriftGauge correctly idenmendations.

The AI insights layer, powered by Ollama and llama3, represents a significant advancement over purely metric-based monitoring tools. By generating natural language explanations of statistical findings, DriftGauge makes drift analysis accessible to a broader audience and reduces the time required to translate monitoring results into remediation actions. The four-prompt architecture — generating explanation, root cause, recommendation, and code fix as separate focused prompts — proved more reliablemented ML monitoring tooling by providing a complete, self-contained platform for data drift detection and model performance monitoring. The system integrates three complementary statistical tests (KS test, Wasserstein distance, and PSI) into a unified drift detection engine that provides feature-level analysis with standardised severity grading. The optional ML model evaluation component cross-references drift findings with model performance metrics and feature importance to generate targeted, actionable recomle runs, though the exact wording varied due to the stochastic nature of LLM generation.

**Observation 5 — Suggestion Engine Accuracy:** The suggestion engine correctly identified the high-drift, high-importance features (`income` and `credit_score`) as the primary candidates for remediation and recommended immediate retraining given the combination of high drift and severe performance degradation.

---

# CHAPTER 8: CONCLUSION

DriftGauge successfully addresses the identified problem of inaccessible, fragn distances cannot be directly compared across features with different scales. PSI, being a ratio-based metric, does not have this limitation.

**Observation 4 — AI Insights Quality:** The AI insights generated by llama3 via Ollama accurately identified the population shift as the likely root cause of the drift, recommended retraining the model on updated data, and provided a relevant Python code snippet for monitoring the income feature distribution. The quality of the insights was consistent across multipity to non-technical stakeholders. The PSI value of 1.03 for `income` is immediately understandable as "very significant drift" without requiring knowledge of the KS test or Wasserstein distance.

**Observation 3 — Wasserstein Distance Scale Dependency:** The Wasserstein distance for `income` (15,621.45) is dramatically larger than for `employment_years` (1.98), primarily because income values are in the tens of thousands while employment years are in single digits. This scale dependency means that Wassersteiobservations emerge from the analysis results:

**Observation 1 — Multi-Criteria Consistency:** All three statistical tests (KS, Wasserstein, PSI) agree on the drift status of all features. This consistency across methods increases confidence in the results and suggests that the drift is genuine and substantial rather than a statistical artefact.

**Observation 2 — PSI as the Most Interpretable Metric:** While all three metrics provide useful information, PSI is the most interpretable for communicating drift sever (importance: 0.35) and `credit_score` (importance: 0.28) are the two most important features for the model. Both of these features show Critical Drift status with PSI values above 0.25. This cross-referencing of drift severity with feature importance is the key insight provided by DriftGauge's suggestion engine: the features that have drifted the most are also the features that the model relies on most heavily, explaining the severe performance degradation.

## Observations and Interpretation

Several important Baseline | Current | Change |
|--------|----------|---------|--------|
| Accuracy | 91.2% | 74.3% | -16.9% |
| Precision | 89.5% | 71.8% | -17.7% |
| Recall | 88.1% | 70.2% | -17.9% |
| F1 Score | 88.8% | 71.0% | -17.8% |

The performance degradation is severe: accuracy dropped by 16.9 percentage points, well above the 5% threshold for flagging degradation. This result is expected given the magnitude of the distributional shift observed in the drift analysis.

The feature importance analysis revealed that `income`ly.

The `age` feature shows a bimodal distribution in the current dataset that was not present in the baseline, suggesting that the current population includes a new demographic segment (younger borrowers) that was not well-represented in the training data.

## Model Performance Comparison

A Random Forest classifier trained on the baseline dataset was evaluated on both datasets. The model was trained with 100 estimators and a maximum depth of 10, achieving strong performance on the baseline dataset.

| Metric | cate that the current population consists of higher-quality borrowers, which would be consistent with a change in the bank's customer acquisition strategy.

The `default` feature, which is the target variable, shows a more subtle shift. The proportion of defaults in the current dataset is slightly lower than in the baseline, which is reflected in the moderate PSI of 0.12. This suggests that while the input feature distributions have changed significantly, the overall default rate has not changed as dramaticaltion (blue line) shows a roughly normal distribution centred around $52,000, while the current distribution (orange line) is shifted rightward and has a different shape, centred around $68,000. This shift is consistent with the high PSI and Wasserstein distance values.

The `credit_score` feature shows a similar pattern: the baseline distribution is centred around 650 with moderate variance, while the current distribution is shifted toward higher scores (centred around 700) with lower variance. This could indi
---

# CHAPTER 11: REFERENCES

1. Shimodaira, H. (2000). Improving predictive inference under covariate shift by weighting the log-likelihood function. *Journal of Statistical Planning and Inference*, 90(2), 227-244.

2. Quinonero-Candela, J., Sugiyama, M., Schwaighofer, A., & Lawrence, N. D. (2009). *Dataset Shift in Machine Learning*. MIT Press.

3. Kolmogorov, A. N. (1933). Sulla determinazione empirica di una legge di distribuzione. *Giornale dell'Istituto Italiano degli Attuari*, 4, 83-91.

4. Smirnov, N. V. (1948). Table for estimating the goodness of fit of empirical distributions. *Annals of Mathematical Statistics*, 19(2), 279-281.

5. Villani, C. (2008). *Optimal Transport: Old and New*. Springer.

6. Rubner, Y., Tomasi, C., & Guibas, L. J. (2000). The Earth Mover's Distance as a metric for image retrieval. *International Journal of Computer Vision*, 40(2), 99-121.

7. Siddiqi, N. (2006). *Credit Risk Scorecards: Developing and Implementing Intelligent Credit Scoring*. Wiley.

8. Gama, J., Medas, P., Castillo, G., & Rodrigues, P. (2004). Learning with drift detection. *Advances in Artificial Intelligence - SBIA 2004*, LNCS 3171, 286-295.

9. Bifet, A., & Gavalda, R. (2007). Learning from time-changing data with adaptive windowing. *Proceedings of the 2007 SIAM International Conference on Data Mining*, 443-448.

10. Page, E. S. (1954). Continuous inspection schemes. *Biometrika*, 41(1/2), 100-115.

11. Rabanser, S., Gunnemann, S., & Lipton, Z. C. (2019). Failing loudly: An empirical study of methods for detecting dataset shift. *Advances in Neural Information Processing Systems*, 32.

12. Breck, E., Cai, S., Nielsen, E., Salib, M., & Sculley, D. (2017). The ML test score: A rubric for ML production readiness and technical debt reduction. *IEEE International Conference on Big Data*, 1123-1132.

13. Sculley, D., Holt, G., Golovin, D., Davydov, E., Phillips, T., Ebner, D., & Dennison, D. (2015). Hidden technical debt in machine learning systems. *Advances in Neural Information Processing Systems*, 28.

14. Klaise, J., Van Looveren, A., Vacanti, G., & Coca, A. (2020). Alibi Detect: Algorithms for outlier, adversarial and drift detection. *Journal of Machine Learning Research*, 23(172), 1-6.

15. Paleyes, A., Urma, R. G., & Lawrence, N. D. (2022). Challenges in deploying machine learning: A survey of case studies. *ACM Computing Surveys*, 55(6), 1-29.

16. Bommasani, R., Hudson, D. A., et al. (2021). On the opportunities and risks of foundation models. *arXiv preprint arXiv:2108.07258*.

17. FastAPI Documentation. (2024). FastAPI - Modern, fast web framework for building APIs with Python. https://fastapi.tiangolo.com

18. Ollama Documentation. (2024). Ollama - Get up and running with large language models locally. https://ollama.com

19. Recharts Documentation. (2024). Recharts - A composable charting library built on React. https://recharts.org

20. SQLAlchemy Documentation. (2024). The Python SQL Toolkit and Object Relational Mapper. https://www.sqlalchemy.org

---

*End of Report*
