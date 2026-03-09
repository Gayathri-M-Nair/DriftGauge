import { motion } from 'framer-motion';

const MetricCard = ({ icon: Icon, label, value, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-orange-500',
    yellow: 'from-yellow-500 to-orange-500',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-xl p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
};

export default MetricCard;
