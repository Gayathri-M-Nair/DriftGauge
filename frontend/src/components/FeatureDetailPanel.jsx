import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FeatureDetailPanel = ({ feature, onClose }) => {
  // Mock histogram data - in real app, this would come from backend
  const histogramData = Array.from({ length: 10 }, (_, i) => ({
    bin: i,
    baseline: Math.random() * 100,
    current: Math.random() * 100,
  }));

  return (
    <AnimatePresence>
      {feature && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{feature.name}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="glass rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">KS Statistic</p>
                <p className="text-2xl font-bold">{feature.ks_statistic.toFixed(4)}</p>
              </div>
              <div className="glass rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">P-Value</p>
                <p className="text-2xl font-bold">{feature.p_value.toFixed(4)}</p>
              </div>
              <div className="glass rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Drift Score</p>
                <p className="text-2xl font-bold">{(feature.ks_statistic * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Additional High Accuracy Metrics */}
            {feature.wasserstein_distance !== undefined && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Wasserstein Distance</p>
                    <p className="text-2xl font-bold text-purple-400">{feature.wasserstein_distance.toFixed(4)}</p>
                    <p className="text-xs text-slate-500 mt-1">Earth Mover's Distance</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">PSI Score</p>
                    <p className={`text-2xl font-bold ${
                      feature.psi_score >= 0.25 ? 'text-red-400' :
                      feature.psi_score >= 0.1 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {feature.psi_score ? feature.psi_score.toFixed(4) : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {feature.psi_score >= 0.25 ? 'Significant Drift' :
                       feature.psi_score >= 0.1 ? 'Moderate Drift' :
                       'No Significant Change'}
                    </p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Mean Shift</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {feature.mean_shift ? feature.mean_shift.toFixed(2) : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {feature.baseline_mean && feature.current_mean && 
                        `${feature.baseline_mean.toFixed(2)} → ${feature.current_mean.toFixed(2)}`
                      }
                    </p>
                  </div>
                </div>

                {/* Drift Criteria Explanation */}
                <div className="glass rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold mb-3">Drift Detection Criteria</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">KS Test (p-value &lt; 0.05)</span>
                      <span className={feature.p_value < 0.05 ? 'text-red-400 font-semibold' : 'text-green-400'}>
                        {feature.p_value < 0.05 ? '✓ Drifted' : '✗ No Drift'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Wasserstein Distance (&gt; 0.1)</span>
                      <span className={feature.wasserstein_distance > 0.1 ? 'text-red-400 font-semibold' : 'text-green-400'}>
                        {feature.wasserstein_distance > 0.1 ? '✓ Drifted' : '✗ No Drift'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">PSI Score (≥ 0.25)</span>
                      <span className={feature.psi_score >= 0.25 ? 'text-red-400 font-semibold' : 'text-green-400'}>
                        {feature.psi_score >= 0.25 ? '✓ Drifted' : '✗ No Drift'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic">
                    Feature is marked as drifted if ANY of the above criteria are met.
                  </p>
                </div>
              </>
            )}

            {/* Distribution Comparison */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Distribution Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="bin" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="baseline" fill="#3b82f6" name="Baseline" />
                  <Bar dataKey="current" fill="#22c55e" name="Current" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeatureDetailPanel;
