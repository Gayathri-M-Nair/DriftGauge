import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DriftChart = ({ data }) => {
  const chartData = data.map(feature => ({
    name: feature.name,
    driftScore: feature.ks_statistic,
  }));

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Drift Score by Feature</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="driftScore" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DriftChart;
