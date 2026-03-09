import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Layers, AlertTriangle, TrendingUp, Clock, CheckCircle, Search, Download, FileText, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import FeatureDetailPanel from '../components/FeatureDetailPanel';
import DriftHistogram from '../components/DriftHistogram';
import FeatureDistributionChart from '../components/FeatureDistributionChart';

const DashboardPage = ({ selectedProject }) => {
  const location = useLocation();
  const [analysis, setAnalysis] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedDistributionFeature, setSelectedDistributionFeature] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <p className="text-xl text-slate-300">No analysis found</p>
          <p className="text-slate-400 mt-2">Upload datasets and run analysis first</p>
        </div>
      </div>
    );
  }

  const features = Object.entries(analysis.report.feature_scores || {}).map(([name, scores]) => ({
    name,
    ks_statistic: scores.ks_statistic,
    p_value: scores.p_value,
  }));

  const getDriftStatus = (pValue) => {
    if (pValue >= 0.05) return { label: 'No Drift', color: 'slight', icon: '✓' };
    if (pValue >= 0.01) return { label: 'Moderate Drift', color: 'moderate', icon: '⚠' };
    return { label: 'Significant Drift', color: 'significant', icon: '●' };
  };

  const filteredFeatures = features.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMode === 'all') return matchesSearch;
    if (filterMode === 'drifted') return matchesSearch && f.p_value < 0.05;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 mb-6 border-l-4 border-green-500"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
            <CheckCircle size={20} className="text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Analysis Completed!</h3>
            <p className="text-sm text-slate-400">
              Drift analysis finished in {analysis.report.processing_time || '2.34'} seconds using {analysis.mode === 'fast' ? 'Fast Mode' : 'High Accuracy Mode'}.
              {analysis.report.samples_used && (
                <span> Analyzed {analysis.report.samples_used.baseline.toLocaleString()} baseline samples and {analysis.report.samples_used.current.toLocaleString()} current samples.</span>
              )}
            </p>
            {analysis.mode === 'high_accuracy' && !analysis.report.thresholds && (
              <p className="text-xs text-yellow-400 mt-1">
                ⚠️ This analysis was run with an older version. Run a new analysis to see PSI and enhanced metrics.
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="metric-badge bg-[#1e3a5f]">
              <Layers size={24} className="text-[#3b82f6]" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Features</p>
              <p className="text-3xl font-bold">{analysis.report.total_features}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="metric-badge bg-[#4a3520]">
              <AlertTriangle size={24} className="text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Drifted Features</p>
              <p className="text-3xl font-bold">{analysis.drifted_features.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="metric-badge bg-[#4a3520]">
              <TrendingUp size={24} className="text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Drift Severity</p>
              <p className="text-3xl font-bold">{(analysis.drift_score * 100).toFixed(0)}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Table */}
      <div className="card p-6 mb-6">
        {/* Search and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Feature"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg text-sm w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === 'all'
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-[#252b3b] text-slate-400 hover:text-slate-200'
                }`}
              >
                All Features
              </button>
              <button
                onClick={() => setFilterMode('drifted')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === 'drifted'
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-[#252b3b] text-slate-400 hover:text-slate-200'
                }`}
              >
                Drifted Only
              </button>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#252b3b] hover:bg-[#2d3748] rounded-lg text-sm font-medium transition-colors">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Drift Score</th>
                <th>P-Value</th>
                {analysis.mode === 'high_accuracy' && (
                  <>
                    <th>Wasserstein</th>
                    <th>PSI</th>
                  </>
                )}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((feature, index) => {
                const status = getDriftStatus(feature.p_value);
                return (
                  <motion.tr
                    key={feature.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedFeature(feature)}
                    className="cursor-pointer"
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span className="font-medium">{feature.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[200px] h-2 bg-[#252b3b] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              status.color === 'significant' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                              status.color === 'moderate' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}
                            style={{ width: `${Math.min(feature.ks_statistic * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{feature.ks_statistic.toFixed(3)}</span>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{feature.p_value.toFixed(4)}</td>
                    {analysis.mode === 'high_accuracy' && (
                      <>
                        <td className="font-mono text-sm text-purple-400">
                          {feature.wasserstein_distance ? feature.wasserstein_distance.toFixed(3) : 'N/A'}
                        </td>
                        <td className="font-mono text-sm">
                          {feature.psi_score !== undefined ? (
                            <span className={
                              feature.psi_score >= 0.25 ? 'text-red-400' :
                              feature.psi_score >= 0.1 ? 'text-yellow-400' :
                              'text-green-400'
                            }>
                              {feature.psi_score.toFixed(3)}
                            </span>
                          ) : 'N/A'}
                        </td>
                      </>
                    )}
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

      {/* Histogram Section */}
      {selectedFeature && (
        <DriftHistogram feature={selectedFeature} />
      )}

      {/* Feature Distribution Analysis Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6"
      >
        <h2 className="text-xl font-bold mb-4">Feature Distribution Analysis</h2>
        <p className="text-sm text-slate-400 mb-6">
          Compare baseline and current distributions for any feature to visualize drift patterns
        </p>

        {/* Feature Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Feature to Analyze
          </label>
          <div className="relative">
            <select
              value={selectedDistributionFeature}
              onChange={(e) => setSelectedDistributionFeature(e.target.value)}
              className="w-full px-4 py-3 rounded-lg appearance-none cursor-pointer bg-[#1a1f2e] border border-[#2d3748] text-slate-200"
            >
              <option value="">Choose a feature...</option>
              {features.map((feature) => (
                <option key={feature.name} value={feature.name}>
                  {feature.name} - Drift Score: {feature.ks_statistic.toFixed(3)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Distribution Chart */}
        {selectedDistributionFeature ? (
          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Distribution Comparison: {selectedDistributionFeature}
                </h3>
                <p className="text-sm text-slate-400">
                  Blue line represents baseline data, Orange line represents current data
                </p>
              </div>
              {(() => {
                const feature = features.find(f => f.name === selectedDistributionFeature);
                if (feature) {
                  const status = getDriftStatus(feature.p_value);
                  return (
                    <span className={`status-pill status-${status.color}`}>
                      <span>{status.icon}</span>
                      <span>{status.label}</span>
                    </span>
                  );
                }
                return null;
              })()}
            </div>
            
            {(() => {
              const feature = features.find(f => f.name === selectedDistributionFeature);
              if (feature && feature.histogram_data && feature.histogram_data.histogram) {
                return (
                  <FeatureDistributionChart
                    featureName={selectedDistributionFeature}
                    histogramData={feature.histogram_data.histogram}
                  />
                );
              }
              return (
                <div className="flex items-center justify-center h-64 text-slate-400">
                  <p>Distribution data not available for this feature</p>
                </div>
              );
            })()}

            {/* Statistics Summary */}
            {(() => {
              const feature = features.find(f => f.name === selectedDistributionFeature);
              if (feature) {
                return (
                  <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#2d3748]">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">KS Statistic</p>
                      <p className="text-lg font-bold">{feature.ks_statistic.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">P-Value</p>
                      <p className="text-lg font-bold">{feature.p_value.toFixed(4)}</p>
                    </div>
                    {feature.wasserstein_distance !== undefined && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Wasserstein Distance</p>
                        <p className="text-lg font-bold text-purple-400">
                          {feature.wasserstein_distance.toFixed(4)}
                        </p>
                      </div>
                    )}
                    {feature.psi_score !== undefined && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">PSI Score</p>
                        <p className={`text-lg font-bold ${
                          feature.psi_score >= 0.25 ? 'text-red-400' :
                          feature.psi_score >= 0.1 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {feature.psi_score.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ) : (
          <div className="glass rounded-lg p-12 text-center">
            <TrendingUp size={48} className="mx-auto mb-4 text-slate-500" />
            <p className="text-slate-400">Select a feature from the dropdown to view its distribution comparison</p>
          </div>
        )}
      </motion.div>

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
        <button className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg font-medium transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>New Analysis</span>
        </button>
      </div>

      {/* Feature Detail Modal */}
      <FeatureDetailPanel
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />
    </div>
  );
};

export default DashboardPage;
