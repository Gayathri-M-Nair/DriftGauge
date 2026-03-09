import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from 'recharts';

const DriftHistogram = ({ feature }) => {
  // Mock histogram data - in production, this would come from backend
  const histogramData = Array.from({ length: 20 }, (_, i) => ({
    bin: i * 5,
    baseline: Math.max(0, 60 - Math.abs(i - 10) * 5 + Math.random() * 10),
    current: Math.max(0, 50 - Math.abs(i - 12) * 4 + Math.random() * 10),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">Age: {payload[0].payload.bin}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
              <span className="text-xs text-slate-400">Baseline:</span>
              <span className="text-sm font-medium">{payload[0].value.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              <span className="text-xs text-slate-400">Current:</span>
              <span className="text-sm font-medium">{payload[1].value.toFixed(1)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Feature Drift Analysis: {feature.name}</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">PSI:</span>
              <span className="font-mono font-semibold">{feature.ks_statistic.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-sm font-medium">
            Histogram
          </button>
          <button className="px-3 py-1.5 bg-[#252b3b] text-slate-400 hover:text-slate-200 rounded-lg text-sm font-medium transition-colors">
            Distribution #
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={histogramData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
          <XAxis 
            dataKey="bin" 
            stroke="#9ca3af" 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="baseline" 
            fill="#3b82f6" 
            name="Reference" 
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
          <Bar 
            dataKey="current" 
            fill="#f59e0b" 
            name="Current" 
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
          <Line 
            type="monotone" 
            dataKey="baseline" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            name="KDE"
          />
          <Line 
            type="monotone" 
            dataKey="current" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* AI Explanation Panel */}
      <div className="mt-6 p-5 bg-[#252b3b] rounded-lg border border-[#2d3748]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
              <path d="M12 12v10a10 10 0 0 0 10-10H12z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>AI-Generated</span>
              <span className="text-xs text-slate-400">Explanation Report</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              The feature '{feature.name}' shows significant drift with a drift score of {feature.ks_statistic.toFixed(2)} and a p-value of {feature.p_value.toFixed(4)}, exceeding the significance threshold of 0.05. This drift indicates a notable demographic shift in the incoming data population. It is recommended to retrain the model with updated data to maintain accuracy.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold mb-2">Actions Suggested</h4>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Consider retraining the model with the updated data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Monitor other features for related drifts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Evaluate if the model should be updated.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DriftHistogram;
