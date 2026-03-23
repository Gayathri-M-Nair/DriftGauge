"""
Sample script to create a test model and datasets for DriftGauge ML monitoring demo
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
from pathlib import Path

# Set random seed for reproducibility
np.random.seed(42)

# Create sample dataset
n_samples = 10000

# Generate baseline data
baseline_data = {
    'age': np.random.normal(35, 10, n_samples).clip(18, 80),
    'income': np.random.normal(50000, 15000, n_samples).clip(20000, 150000),
    'credit_score': np.random.normal(700, 50, n_samples).clip(300, 850),
    'loan_amount': np.random.normal(25000, 10000, n_samples).clip(5000, 100000),
    'employment_years': np.random.normal(8, 5, n_samples).clip(0, 40),
}

# Create target based on features (loan approval)
baseline_data['target'] = (
    (baseline_data['credit_score'] > 650) & 
    (baseline_data['income'] > 40000) & 
    (baseline_data['employment_years'] > 2)
).astype(int)

baseline_df = pd.DataFrame(baseline_data)

# Generate current data with drift
# Simulate population shift: older, higher income, but lower credit scores
current_data = {
    'age': np.random.normal(45, 12, n_samples).clip(18, 80),  # Older population
    'income': np.random.normal(60000, 18000, n_samples).clip(20000, 150000),  # Higher income
    'credit_score': np.random.normal(680, 60, n_samples).clip(300, 850),  # Lower credit scores
    'loan_amount': np.random.normal(30000, 12000, n_samples).clip(5000, 100000),  # Higher loans
    'employment_years': np.random.normal(10, 6, n_samples).clip(0, 40),  # More experience
}

# Create target with same logic
current_data['target'] = (
    (current_data['credit_score'] > 650) & 
    (current_data['income'] > 40000) & 
    (current_data['employment_years'] > 2)
).astype(int)

current_df = pd.DataFrame(current_data)

# Train a model on baseline data
X_train = baseline_df.drop('target', axis=1)
y_train = baseline_df['target']

model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
model.fit(X_train, y_train)

# Create directories
Path('uploads/sample').mkdir(parents=True, exist_ok=True)
Path('models/sample').mkdir(parents=True, exist_ok=True)

# Save datasets
baseline_df.to_csv('uploads/sample/baseline.csv', index=False)
current_df.to_csv('uploads/sample/current.csv', index=False)

# Save model
joblib.dump(model, 'models/sample/model.pkl')

print("✅ Sample data and model created successfully!")
print(f"\nBaseline dataset: {len(baseline_df)} rows")
print(f"Current dataset: {len(current_df)} rows")
print(f"Features: {list(X_train.columns)}")
print(f"Target column: 'target'")
print(f"\nBaseline approval rate: {baseline_df['target'].mean():.2%}")
print(f"Current approval rate: {current_df['target'].mean():.2%}")
print(f"\nModel training accuracy: {model.score(X_train, y_train):.2%}")

# Test model on current data
X_current = current_df.drop('target', axis=1)
y_current = current_df['target']
current_accuracy = model.score(X_current, y_current)
print(f"Model accuracy on current data: {current_accuracy:.2%}")
print(f"Performance drop: {(model.score(X_train, y_train) - current_accuracy):.2%}")

print("\n📁 Files created:")
print("  - uploads/sample/baseline.csv")
print("  - uploads/sample/current.csv")
print("  - models/sample/model.pkl")
print("\n🚀 You can now test the ML monitoring feature!")
print("   Target column name: 'target'")
