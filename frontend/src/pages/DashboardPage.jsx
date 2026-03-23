import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layers, AlertTriangle, TrendingUp, CheckCircle, Download, FileText, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import FeatureDistributionChart from '../components/FeatureDistributionChart';

const DashboardPage = ({ selectedProject }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAnalysis = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const res = await api.getAnalyses(selectedProject.id);
      if (res.data.length > 0) {
        setAnalysis(res.data[0]);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we have a fresh analysis result from navigation state
    if (location.state?.analysisResult) {
      setAnalysis(location.state.analysisResult);
      setLoading(false);
      // Clear the navigation state to prevent stale data
      window.history.replaceState({}, document.title);
    } else {
      // Otherwise, load the latest analysis from the database
      loadAnalysis();
    }
  }, [selectedProject, location.state]);

  // Set first feature as default if none selected
  useEffect(() => {
    if (analysis?.report?.feature_scores) {
      const featureNames = Object.keys(analysis.report.feature_scores);
      if (featureNames.length > 0 && !selectedFeature) {
        setSelectedFeature(featureNames[0]);
      }
    }
  }, [analysis, selectedFeature]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <p className="text-xl text-slate-300">No analysis found</p>
          <p className="text-slate-400 mt-2">Upload datasets and run analysis first</p>
        </div>
      </div>
    );
  }

  const features = Object.entries(analysis?.report?.feature_scores || {}).map(([name, scores]) => ({
    name,
    ...scores
  }));

  const selectedFeatureData = features.find(f => f.name === selectedFeature);

  const getDriftStatus = (pValue) => {
    if (pValue >= 0.05) return { label: 'No Drift', color: 'green', icon: '✓' };
    if (pValue >= 0.01) return { label: 'Moderate Drift', color: 'yellow', icon: '⚠' };
    return { label: 'Significant Drift', color: 'red', icon: '●' };
  };

  return (
    <div className="min-h-screen p-6 max-w-[1800px] mx-auto">
      {/* Two Column Layout */}
      <div className="flex gap-6">
        
        {/* LEFT SECTION - Main Analysis Panel */}
        <div className="flex-1 space-y-6">
          
          {/* Analysis Completed Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={20} className="text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Analysis Completed!</h3>
                  <p className="text-sm text-slate-400">
                    Drift analysis finished in {analysis.report.processing_time || '0.14'} seconds using {analysis.mode === 'fast' ? 'Fast Mode' : 'High Accuracy Mode'}. 
                    Analyzed {analysis.report.samples_used?.baseline?.toLocaleString() || '5,000'} baseline samples and {analysis.report.samples_used?.current?.toLocaleString() || '5,000'} current samples.
                  </p>
                  {analysis.mode === 'high_accuracy' && !analysis.report.thresholds && (
                    <p className="text-xs text-yellow-400 mt-1">
                      ⚠️ Run a new analysis to see PSI and enhanced metrics.
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => navigate('/history')}
                className="text-sm text-blue-400 hover:text-blue-300 underline whitespace-nowrap"
              >
                View History
              </button>
            </div>
          </motion.div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <Layers size={24} className="text-[#3b82f6]" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Features</p>
                  <p className="text-3xl font-bold">{analysis.report.total_features}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#4a3520] flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={24} className="text-[#f59e0b]" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Drifted Features</p>
                  <p className="text-3xl font-bold">{analysis.drifted_features.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#4a3520] flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={24} className="text-[#f59e0b]" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Drift Severity</p>
                  <p className="text-3xl font-bold">{(analysis.drift_score * 100).toFixed(0)}%</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Model Performance Analysis (if available) */}
          {analysis.report.model_metrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                <h2 className="text-xl font-bold">Model Performance Analysis</h2>
              </div>

              {analysis.report.model_metrics.has_degradation && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle size={20} />
                    <span className="font-semibold">Model Performance Degradation Detected</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-2">
                    Performance dropped by {(analysis.report.model_metrics.performance_drop * 100).toFixed(1)}%. 
                    Review the suggestions below for recommended actions.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Baseline Accuracy</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(analysis.report.model_metrics.baseline_accuracy * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Current Accuracy</p>
                  <p className={`text-2xl font-bold ${
                    analysis.report.model_metrics.has_degradation ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {(analysis.report.model_metrics.current_accuracy * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Baseline F1 Score</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {(analysis.report.model_metrics.baseline_f1 * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-[#1a1f2e] rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Current F1 Score</p>
                  <p className={`text-2xl font-bold ${
                    analysis.report.model_metrics.has_degradation ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {(analysis.report.model_metrics.current_f1 * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              {analysis.report.suggestions && analysis.report.suggestions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Recommended Actions
                  </h3>
                  <div className="space-y-2">
                    {analysis.report.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-3 text-sm text-slate-300"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Feature Drift Table */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium">
                  All Features
                </button>
                <button className="px-4 py-2 bg-[#252b3b] text-slate-400 hover:text-slate-200 rounded-lg text-sm font-medium transition-colors">
                  Drifted Only
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#252b3b] hover:bg-[#2d3748] rounded-lg text-sm font-medium transition-colors">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">FEATURE</th>
                    <th className="text-left">DRIFT SCORE</th>
                    <th className="text-left">P-VALUE</th>
                    <th className="text-left">WASSERSTEIN</th>
                    <th className="text-left">PSI</th>
                    <th className="text-left">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => {
                    const status = getDriftStatus(feature.p_value);
                    return (
                      <motion.tr
                        key={feature.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedFeature(feature.name)}
                        className={`cursor-pointer transition-colors hover:bg-[#1e293b] ${
                          selectedFeature === feature.name ? 'bg-[#252b3b]' : ''
                        }`}
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                            <span className="font-medium">{feature.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[120px] h-2 bg-[#252b3b] rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  status.color === 'red' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                  status.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                  'bg-gradient-to-r from-green-500 to-emerald-500'
                                }`}
                                style={{ width: `${Math.min(feature.ks_statistic * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono">{feature.ks_statistic.toFixed(3)}</span>
                          </div>
                        </td>
                        <td className="font-mono text-sm">{feature.p_value.toFixed(4)}</td>
                        <td className="font-mono text-sm">
                          {feature.wasserstein_distance !== undefined ? feature.wasserstein_distance.toFixed(2) : 'N/A'}
                        </td>
                        <td className="font-mono text-sm">
                          {feature.psi_score !== undefined ? (
                            <span className={
                              feature.psi_score >= 0.25 ? 'text-red-400' :
                              feature.psi_score >= 0.1 ? 'text-yellow-400' :
                              'text-green-400'
                            }>
                              {feature.psi_score.toFixed(2)}
                            </span>
                          ) : 'N/A'}
                        </td>
                        <td>
                          <span className={`status-pill status-${status.color}`}>
                            <span>{status.icon}</span>
                            <span>{status.label}</span>
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#252b3b] hover:bg-[#2d3748] rounded-lg font-medium transition-colors">
              <Download size={18} />
              <span>Download Report</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#252b3b] hover:bg-[#2d3748] rounded-lg font-medium transition-colors">
              <FileText size={18} />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg font-medium transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* RIGHT SECTION - Feature Analysis Panel */}
        <div className="w-[400px] flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 sticky top-6"
          >
            <h2 className="text-xl font-bold mb-4">Feature Drift Analysis</h2>

            {/* Feature Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Select Feature
              </label>
              <div className="relative">
                <select
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg appearance-none cursor-pointer bg-[#1a1f2e] border border-[#2d3748] text-slate-200"
                >
                  {features.map((feature) => (
                    <option key={feature.name} value={feature.name}>
                      {feature.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Selected Feature Info */}
            {selectedFeatureData && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="font-semibold">{selectedFeature}</span>
                  </div>
                  <span className="text-sm text-slate-400">
                    Drift Score: <span className="font-bold text-white">{selectedFeatureData.ks_statistic.toFixed(4)}</span>
                  </span>
                </div>

                {/* Distribution Chart */}
                <div className="mb-6 bg-[#0f1419] rounded-lg p-4">
                  {selectedFeatureData.histogram_data && selectedFeatureData.histogram_data.histogram && selectedFeatureData.histogram_data.histogram.length > 0 ? (
                    <FeatureDistributionChart
                      featureName={selectedFeature}
                      histogramData={selectedFeatureData.histogram_data.histogram}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-slate-400">
                      <p className="text-sm">Distribution data not available</p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                      <span className="text-slate-400">Baseline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                      <span className="text-slate-400">Current</span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-[#2d3748]">
                    <span className="text-sm text-slate-400">KS Statistic:</span>
                    <span className="font-bold">{selectedFeatureData.ks_statistic.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#2d3748]">
                    <span className="text-sm text-slate-400">P-Value:</span>
                    <span className="font-bold">{selectedFeatureData.p_value.toFixed(4)}</span>
                  </div>
                  {selectedFeatureData.wasserstein_distance !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b border-[#2d3748]">
                      <span className="text-sm text-slate-400">Wasserstein Distance:</span>
                      <span className="font-bold text-purple-400">{selectedFeatureData.wasserstein_distance.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedFeatureData.psi_score !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b border-[#2d3748]">
                      <span className="text-sm text-slate-400">PSI:</span>
                      <span className={`font-bold ${
                        selectedFeatureData.psi_score >= 0.25 ? 'text-red-400' :
                        selectedFeatureData.psi_score >= 0.1 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {selectedFeatureData.psi_score.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Insights Panel */}
                {(() => {
                  const insights = analysis.report.ai_insights;
                  if (!insights) return null;
                  const sections = [
                    { key: 'explanation',    label: 'Explanation',    icon: '🔍', color: 'blue' },
                    { key: 'root_cause',     label: 'Root Cause',     icon: '🧬', color: 'orange' },
                    { key: 'recommendation', label: 'Recommendation', icon: '💡', color: 'green' },
                    { key: 'code_fix',       label: 'Code Fix',       icon: '🛠️', color: 'purple' },
                  ];
                  return (
                    <div className="bg-[#0f1419] border border-[#2d3748] rounded-lg overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d3748] bg-[#1a1f2e]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                        </svg>
                        <span className="text-sm font-semibold text-slate-200">AI Drift Insights</span>
                        <span className="ml-auto text-xs text-slate-500">llama3</span>
                      </div>
                      <div className="divide-y divide-[#2d3748]">
                        {sections.map(({ key, label, icon }) => (
                          <div key={key} className="p-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                              {icon} {label}
                            </p>
                            {key === 'code_fix' ? (
                              <pre className="text-xs text-green-300 bg-[#0a0f14] rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                                {insights[key]}
                              </pre>
                            ) : (
                              <p className="text-sm text-slate-300 leading-relaxed">{insights[key]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
