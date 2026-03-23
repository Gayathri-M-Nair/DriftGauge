import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Layers, AlertTriangle, TrendingUp, CheckCircle,
  Download, FileText, ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import FeatureDistributionChart from '../components/FeatureDistributionChart';

// ─── PSI-based graded badge ───────────────────────────────────────────────────
const DriftBadge = ({ psiScore, pValue }) => {
  // Prefer PSI when available, fall back to p-value
  if (psiScore !== undefined && psiScore !== null) {
    if (psiScore < 0.1)  return <span className="badge badge-stable"><span className="badge-dot"/>Stable</span>;
    if (psiScore < 0.25) return <span className="badge badge-monitor"><span className="badge-dot"/>Monitor</span>;
    return                      <span className="badge badge-critical"><span className="badge-dot"/>Critical Drift</span>;
  }
  // Fallback: p-value only (fast mode)
  if (pValue >= 0.05)  return <span className="badge badge-stable"><span className="badge-dot"/>Stable</span>;
  if (pValue >= 0.01)  return <span className="badge badge-monitor"><span className="badge-dot"/>Monitor</span>;
  return                      <span className="badge badge-critical"><span className="badge-dot"/>Critical Drift</span>;
};

// ─── AI Insights expandable panel ────────────────────────────────────────────
const AI_SECTIONS = [
  { key: 'explanation',    label: 'Explanation',    icon: '🔍', cls: 'explanation' },
  { key: 'root_cause',     label: 'Root Cause',     icon: '🧬', cls: 'root_cause' },
  { key: 'recommendation', label: 'Recommendation', icon: '💡', cls: 'recommendation' },
  { key: 'code_fix',       label: 'Code Fix',       icon: '🛠️', cls: 'code_fix' },
];

const AIInsightsPanel = ({ insights }) => {
  const [open, setOpen] = useState(true);
  if (!insights) return null;

  const isFallback = insights.explanation?.includes('AI explanation unavailable') ||
                     insights.explanation?.includes('AI-generated explanations');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="ai-panel"
    >
      {/* Header / toggle */}
      <div className="ai-panel-header" onClick={() => setOpen(o => !o)}>
        <Sparkles size={16} className="text-purple-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-slate-100">AI Drift Insights</span>
        {isFallback && (
          <span className="ml-2 text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-0.5">
            Ollama offline
          </span>
        )}
        <span className="ml-auto text-xs text-slate-500 mr-2">llama3</span>
        {open ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="ai-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {AI_SECTIONS.map(({ key, label, icon, cls }) => (
              <div key={key} className="ai-section">
                <div className={`ai-section-label ${cls}`}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
                {key === 'code_fix' ? (
                  <code className="ai-code-block">{insights[key]}</code>
                ) : (
                  <p className="ai-section-text">{insights[key]}</p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashboardPage = ({ selectedProject }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [analysis, setAnalysis]             = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [loading, setLoading]               = useState(true);
  const [tableFilter, setTableFilter]       = useState('all'); // 'all' | 'drifted'

  const loadAnalysis = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const res = await api.getAnalyses(selectedProject.id);
      if (res.data.length > 0) setAnalysis(res.data[0]);
    } catch (e) {
      console.error('Failed to load analysis:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.analysisResult) {
      setAnalysis(location.state.analysisResult);
      setLoading(false);
      window.history.replaceState({}, document.title);
    } else {
      loadAnalysis();
    }
  }, [selectedProject, location.state]);

  useEffect(() => {
    if (analysis?.report?.feature_scores) {
      const names = Object.keys(analysis.report.feature_scores);
      if (names.length > 0 && !selectedFeature) setSelectedFeature(names[0]);
    }
  }, [analysis, selectedFeature]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-slate-400">Loading analysis...</p>
      </div>
    </div>
  );

  if (!analysis) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500"/>
        <p className="text-xl text-slate-300">No analysis found</p>
        <p className="text-slate-400 mt-2">Upload datasets and run analysis first</p>
      </div>
    </div>
  );

  const allFeatures = Object.entries(analysis?.report?.feature_scores || {}).map(([name, s]) => ({ name, ...s }));
  const driftedSet  = new Set(analysis.drifted_features || []);
  const features    = tableFilter === 'drifted' ? allFeatures.filter(f => driftedSet.has(f.name)) : allFeatures;
  const selectedFeatureData = allFeatures.find(f => f.name === selectedFeature);

  return (
    <div className="min-h-screen p-6 max-w-[1800px] mx-auto">
      <div className="flex gap-6">

        {/* ── LEFT: main panel ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Banner */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="card p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={20} className="text-green-500"/>
                </div>
                <div>
                  <h3 className="font-semibold">Analysis Completed</h3>
                  <p className="text-sm text-slate-400">
                    Finished in {analysis.report.processing_time || '—'}s &nbsp;·&nbsp;
                    {analysis.mode === 'fast' ? 'Fast Mode' : 'High Accuracy Mode'} &nbsp;·&nbsp;
                    {analysis.report.samples_used?.baseline?.toLocaleString() || '—'} baseline
                    / {analysis.report.samples_used?.current?.toLocaleString() || '—'} current samples
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/history')}
                className="text-sm text-blue-400 hover:text-blue-300 underline whitespace-nowrap">
                View History
              </button>
            </div>
          </motion.div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Layers size={22} className="text-blue-400"/>,   bg: 'bg-blue-900/30',   label: 'Total Features',  value: analysis.report.total_features },
              { icon: <AlertTriangle size={22} className="text-amber-400"/>, bg: 'bg-amber-900/30', label: 'Drifted Features', value: analysis.drifted_features.length },
              { icon: <TrendingUp size={22} className="text-amber-400"/>,    bg: 'bg-amber-900/30', label: 'Drift Severity',   value: `${(analysis.drift_score * 100).toFixed(0)}%` },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">{c.label}</p>
                    <p className="text-3xl font-bold">{c.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Model Performance (optional) */}
          {analysis.report.model_metrics && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }} className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                <h2 className="text-lg font-bold">Model Performance Analysis</h2>
              </div>
              {analysis.report.model_metrics.has_degradation && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-5 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="font-semibold text-red-400 text-sm">Model Performance Degradation Detected</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Performance dropped by {(analysis.report.model_metrics.performance_drop * 100).toFixed(1)}%.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Baseline Accuracy', val: analysis.report.model_metrics.baseline_accuracy, color: 'text-green-400' },
                  { label: 'Current Accuracy',  val: analysis.report.model_metrics.current_accuracy,  color: analysis.report.model_metrics.has_degradation ? 'text-red-400' : 'text-green-400' },
                  { label: 'Baseline F1',        val: analysis.report.model_metrics.baseline_f1,       color: 'text-blue-400' },
                  { label: 'Current F1',         val: analysis.report.model_metrics.current_f1,        color: analysis.report.model_metrics.has_degradation ? 'text-red-400' : 'text-blue-400' },
                ].map((m, i) => (
                  <div key={i} className="bg-[#0f1419] rounded-lg p-4 border border-[#1f2937]">
                    <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                    <p className={`text-2xl font-bold ${m.color}`}>{(m.val * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
              {analysis.report.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recommended Actions</p>
                  <div className="space-y-2">
                    {analysis.report.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 bg-[#0f1419] border border-[#1f2937] rounded-lg p-3 text-sm text-slate-300">
                        <span className="text-blue-400 mt-0.5 flex-shrink-0">›</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Feature Drift Table */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTableFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tableFilter === 'all' ? 'bg-[#2563eb] text-white' : 'bg-[#252b3b] text-slate-400 hover:text-slate-200'
                  }`}>
                  All Features
                </button>
                <button
                  onClick={() => setTableFilter('drifted')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tableFilter === 'drifted' ? 'bg-[#2563eb] text-white' : 'bg-[#252b3b] text-slate-400 hover:text-slate-200'
                  }`}>
                  Drifted Only
                  {driftedSet.size > 0 && (
                    <span className="ml-2 bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full">
                      {driftedSet.size}
                    </span>
                  )}
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#252b3b] hover:bg-[#2d3748] rounded-lg text-sm font-medium transition-colors">
                <Download size={15}/>
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
                  {features.map((feature, index) => (
                    <motion.tr
                      key={feature.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => setSelectedFeature(feature.name)}
                      className={`cursor-pointer transition-colors hover:bg-[#1e293b] ${
                        selectedFeature === feature.name ? 'bg-[#1e2a3a] ring-1 ring-inset ring-blue-800/40' : ''
                      }`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            driftedSet.has(feature.name) ? 'bg-red-400' : 'bg-green-400'
                          }`}/>
                          <span className="font-medium text-sm">{feature.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 bg-[#252b3b] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (feature.psi_score ?? 1) >= 0.25 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                (feature.psi_score ?? 1) >= 0.1  ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                                'bg-gradient-to-r from-green-500 to-emerald-400'
                              }`}
                              style={{ width: `${Math.min((feature.ks_statistic || 0) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-slate-300">
                            {(feature.ks_statistic || 0).toFixed(3)}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono text-sm text-slate-300">
                        {(feature.p_value || 0).toFixed(4)}
                      </td>
                      <td className="font-mono text-sm text-slate-300">
                        {feature.wasserstein_distance !== undefined
                          ? feature.wasserstein_distance.toFixed(2)
                          : <span className="text-slate-600">—</span>}
                      </td>
                      <td>
                        {feature.psi_score !== undefined ? (
                          <span className={`font-mono text-sm font-semibold ${
                            feature.psi_score >= 0.25 ? 'text-red-400' :
                            feature.psi_score >= 0.1  ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {feature.psi_score.toFixed(3)}
                          </span>
                        ) : <span className="text-slate-600 text-sm">—</span>}
                      </td>
                      <td>
                        <DriftBadge psiScore={feature.psi_score} pValue={feature.p_value}/>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights — full width below table */}
          <AIInsightsPanel insights={analysis.report.ai_insights}/>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pb-6">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#252b3b] hover:bg-[#2d3748] rounded-lg text-sm font-medium transition-colors">
              <Download size={16}/><span>Download Report</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#252b3b] hover:bg-[#2d3748] rounded-lg text-sm font-medium transition-colors">
              <FileText size={16}/><span>Export CSV</span>
            </button>
            <button onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg text-sm font-medium transition-colors ml-auto">
              <span>New Analysis</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── RIGHT: feature detail panel ── */}
        <div className="w-[380px] flex-shrink-0">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="card p-5 sticky top-6">
            <h2 className="text-base font-bold mb-4 text-slate-100">Feature Distribution</h2>

            {/* Feature selector */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                Select Feature
              </label>
              <div className="relative">
                <select
                  value={selectedFeature}
                  onChange={e => setSelectedFeature(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg appearance-none cursor-pointer bg-[#0f1419] border border-[#2d3748] text-slate-200 text-sm"
                >
                  {allFeatures.map(f => (
                    <option key={f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
              </div>
            </div>

            {selectedFeatureData && (
              <>
                {/* Badge for selected feature */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-200">{selectedFeature}</span>
                  <DriftBadge psiScore={selectedFeatureData.psi_score} pValue={selectedFeatureData.p_value}/>
                </div>

                {/* Distribution chart */}
                <div className="bg-[#0a0f14] rounded-lg p-3 mb-4 border border-[#1f2937]">
                  {selectedFeatureData.histogram_data?.histogram?.length > 0 ? (
                    <FeatureDistributionChart
                      featureName={selectedFeature}
                      histogramData={selectedFeatureData.histogram_data.histogram}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-slate-600">
                      <p className="text-sm">Distribution data not available</p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-5 mt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"/>
                      <span className="text-slate-500">Baseline</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"/>
                      <span className="text-slate-500">Current</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-0 rounded-lg overflow-hidden border border-[#1f2937]">
                  {[
                    { label: 'KS Statistic',         val: (selectedFeatureData.ks_statistic || 0).toFixed(4),  color: '' },
                    { label: 'P-Value',               val: (selectedFeatureData.p_value || 0).toFixed(4),       color: '' },
                    selectedFeatureData.wasserstein_distance !== undefined && {
                      label: 'Wasserstein',
                      val: selectedFeatureData.wasserstein_distance.toFixed(3),
                      color: 'text-purple-400',
                    },
                    selectedFeatureData.psi_score !== undefined && {
                      label: 'PSI',
                      val: selectedFeatureData.psi_score.toFixed(3),
                      color: selectedFeatureData.psi_score >= 0.25 ? 'text-red-400'
                           : selectedFeatureData.psi_score >= 0.1  ? 'text-yellow-400'
                           : 'text-green-400',
                    },
                  ].filter(Boolean).map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-[#0f1419] border-b border-[#1f2937] last:border-b-0">
                      <span className="text-xs text-slate-500">{row.label}</span>
                      <span className={`text-sm font-mono font-semibold ${row.color || 'text-slate-200'}`}>{row.val}</span>
                    </div>
                  ))}
                </div>

                {/* PSI legend */}
                <div className="mt-4 bg-[#0a0f14] rounded-lg p-3 border border-[#1f2937]">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">PSI Scale</p>
                  <div className="space-y-1.5">
                    {[
                      { range: '< 0.10', label: 'Stable',        cls: 'badge-stable' },
                      { range: '0.10 – 0.25', label: 'Monitor',  cls: 'badge-monitor' },
                      { range: '> 0.25', label: 'Critical Drift', cls: 'badge-critical' },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-mono">{r.range}</span>
                        <span className={`badge ${r.cls} text-xs`}>
                          <span className="badge-dot"/>{r.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
