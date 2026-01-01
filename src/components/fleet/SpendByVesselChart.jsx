import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../KPICard';

function SpendByVesselChart({ data }) {
  const chartData = data.map(item => ({
    name: item.vesselName?.length > 15 ? item.vesselName.substring(0, 15) + '...' : item.vesselName,
    fullName: item.vesselName,
    spend: item.spendUSD,
    count: item.poCount,
  }));

  const colors = [
    '#EC008C', '#C70076', '#FF4DB8', '#9B0060', '#FF80CC',
    '#7A004D', '#FF99D6', '#5C003A', '#FFB3E0', '#3D0027'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Vessels by Spend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip
              formatter={(value, name, props) => [formatCurrency(value), 'Spend']}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SpendByVesselChart;
