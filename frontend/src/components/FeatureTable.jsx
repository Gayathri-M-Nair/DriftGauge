import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const FeatureTable = ({ features, onFeatureClick }) => {
  const getDriftStatus = (pValue) => {
    if (pValue >= 0.05) return { status: 'No Drift', color: 'green', icon: CheckCircle };
    if (pValue >= 0.01) return { status: 'Moderate Drift', color: 'yellow', icon: AlertTriangle };
    return { status: 'Significant Drift', color: 'red', icon: AlertCircle };
  };

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Feature Drift Analysis</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Feature Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Drift Score</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">P-Value</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => {
              const { status, color, icon: Icon } = getDriftStatus(feature.p_value);
              return (
                <motion.tr
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onFeatureClick(feature)}
                  className="border-b border-slate-800 hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{feature.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${
                            color === 'green' ? 'from-green-500 to-emerald-500' :
                            color === 'yellow' ? 'from-yellow-500 to-orange-500' :
                            'from-red-500 to-orange-500'
                          }`}
                          style={{ width: `${Math.min(feature.ks_statistic * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm">{feature.ks_statistic.toFixed(3)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{feature.p_value.toFixed(4)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={`text-${color}-500`} />
                      <span className={`text-sm font-medium text-${color}-500`}>{status}</span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeatureTable;
