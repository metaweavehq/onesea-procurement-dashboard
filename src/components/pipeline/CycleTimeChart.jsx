import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function CycleTimeChart({ data }) {
  const chartData = [
    { name: 'Created → Issued', days: data?.createdToIssued || 0, color: '#FBBF24' },
    { name: 'Issued → Delivered', days: data?.issuedToDelivered || 0, color: '#EC008C' },
    { name: 'Issued → Received', days: data?.issuedToReceived || 0, color: '#6366F1' },
    { name: 'Total Cycle', days: data?.createdToDelivered || 0, color: '#10B981' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Cycle Times</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} unit=" days" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={130}
            />
            <Tooltip
              formatter={(value) => [`${value} days`, 'Average']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="days" fill="#EC008C" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-one-magenta">{data?.issuedToDelivered || 0}</p>
          <p className="text-xs text-gray-500">Avg days to deliver</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{data?.createdToDelivered || 0}</p>
          <p className="text-xs text-gray-500">Total cycle time</p>
        </div>
      </div>
    </div>
  );
}

export default CycleTimeChart;
