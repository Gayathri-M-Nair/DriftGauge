import { motion } from 'framer-motion';
import { Bell, Shield, Database } from 'lucide-react';

const Settings = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-400">Configure your DriftGauge preferences</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={24} className="text-blue-400" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Email alerts for drift detection</span>
              <input type="checkbox" className="w-5 h-5" />
            </label>
            <label className="flex items-center justify-between">
              <span>Slack notifications</span>
              <input type="checkbox" className="w-5 h-5" />
            </label>
          </div>
        </div>

        {/* Thresholds */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-green-400" />
            <h2 className="text-xl font-semibold">Drift Thresholds</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">P-Value Threshold</label>
              <input
                type="number"
                defaultValue="0.05"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Data Storage */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database size={24} className="text-purple-400" />
            <h2 className="text-xl font-semibold">Data Storage</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">Manage your uploaded datasets</p>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
            Clear All Data
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
