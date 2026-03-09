import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

const AnalysisHistory = ({ selectedProject }) => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [selectedProject]);

  const loadHistory = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const res = await api.getAnalyses(selectedProject.id);
      setAnalyses(res.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalysis = async (analysisId) => {
    try {
      const res = await api.getAnalysisById(analysisId);
      // Navigate to dashboard with the selected analysis
      navigate('/dashboard', { state: { analysisResult: res.data } });
    } catch (error) {
      console.error('Failed to load analysis:', error);
      alert('Failed to load analysis. Please try again.');
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : analyses.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock size={48} className="mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">No analysis history yet</p>
          <p className="text-sm text-slate-500 mt-2">Run your first drift analysis to see results here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:border-[#374151] transition-colors cursor-pointer"
              onClick={() => handleViewAnalysis(analysis.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      analysis.mode === 'fast' 
                        ? 'bg-cyan-600 bg-opacity-20 text-cyan-400 border border-cyan-600 border-opacity-30'
                        : 'bg-purple-600 bg-opacity-20 text-purple-400 border border-purple-600 border-opacity-30'
                    }`}>
                      {analysis.mode === 'fast' ? 'Fast Mode' : 'High Accuracy'}
                    </span>
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(analysis.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Drift Score</p>
                      <p className="text-2xl font-bold">{(analysis.drift_score * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Drifted Features</p>
                      <p className="text-2xl font-bold">{analysis.drifted_features.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Total Features</p>
                      <p className="text-2xl font-bold">{analysis.report.total_features}</p>
                    </div>
                    {analysis.report.processing_time && (
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Processing Time</p>
                        <p className="text-2xl font-bold">{analysis.report.processing_time}s</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <TrendingUp size={32} className="text-blue-400" />
                  <ArrowRight size={24} className="text-slate-400 hover:text-slate-200 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AnalysisHistory;
