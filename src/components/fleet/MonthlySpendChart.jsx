import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../KPICard';

function MonthlySpendChart({ data }) {
  const chartData = data.map(item => ({
    name: item.monthName?.substring(0, 3) || `M${item.month}`,
    spend: item.spendUSD,
    count: item.poCount,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spend Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Spend']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="spend" fill="#EC008C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MonthlySpendChart;
