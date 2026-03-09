import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

const AnalysisHistory = ({ selectedProject }) => {
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    loadHistory();
  }, [selectedProject]);

  const loadHistory = async () => {
    if (!selectedProject) return;
    try {
      const res = await api.getAnalyses(selectedProject.id);
      setAnalyses(res.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
        <p className="text-slate-400">View past drift detection results</p>
      </div>

      <div className="space-y-4">
        {analyses.map((analysis, index) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl p-6 card-hover"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-medium">
                    {analysis.mode}
                  </span>
                  <span className="text-sm text-slate-400 flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(analysis.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-slate-400">Drift Score</p>
                    <p className="text-2xl font-bold">{(analysis.drift_score * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Drifted Features</p>
                    <p className="text-2xl font-bold">{analysis.drifted_features.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Features</p>
                    <p className="text-2xl font-bold">{analysis.report.total_features}</p>
                  </div>
                </div>
              </div>
              <TrendingUp size={32} className="text-blue-400" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AnalysisHistory;
