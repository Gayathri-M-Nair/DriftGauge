import { motion } from 'framer-motion';
import { Brain, AlertCircle, Lightbulb } from 'lucide-react';

const AIExplanation = ({ explanation }) => {
  if (!explanation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-xl p-6 max-h-[600px] overflow-y-auto"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Brain size={20} />
        </div>
        <h2 className="text-xl font-bold">AI Drift Explanation</h2>
      </div>

      <div className="space-y-4">
        {/* Why Drift Occurred */}
        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-blue-400" />
            <h3 className="font-semibold">Why Drift Occurred</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {explanation.why || 'The statistical distribution of features has shifted significantly from the baseline dataset.'}
          </p>
        </div>

        {/* Possible Reasons */}
        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={18} className="text-yellow-400" />
            <h3 className="font-semibold">Possible Reasons</h3>
          </div>
          <ul className="text-sm text-slate-300 space-y-2">
            {(explanation.reasons || [
              'Changes in data collection process',
              'Seasonal or temporal variations',
              'Population shift in target demographics',
              'System or sensor calibration changes'
            ]).map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div className="glass rounded-lg p-4">
          <h3 className="font-semibold mb-2">Recommended Actions</h3>
          <ul className="text-sm text-slate-300 space-y-2">
            {(explanation.actions || [
              'Retrain model with recent data',
              'Investigate data pipeline changes',
              'Review feature engineering process',
              'Monitor model performance metrics'
            ]).map((action, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-400 font-bold">→</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default AIExplanation;
