import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatNumber } from '../KPICard';

const STATUS_COLORS = {
  'CREATED': '#9CA3AF',
  'ISSUED': '#FBBF24',
  'IN-TRANSIT': '#60A5FA',
  'DELIVERED': '#34D399',
  'COMPLETION_RECORDED': '#818CF8',
  'CLOSED': '#10B981',
  'CANCELLED': '#EF4444',
};

function POStatusBreakdown({ data }) {
  const chartData = data.map(item => ({
    name: item.statusName,
    value: item.count,
    spend: item.spendUSD,
    color: STATUS_COLORS[item.statusName?.toUpperCase()?.replace(' ', '_')] || '#6B7280',
  }));

  const totalCount = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PO Status Distribution</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${formatNumber(value)} POs (${formatCurrency(props.payload.spend)})`,
                  name
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Status Details</h4>
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(item.value)} ({((item.value / totalCount) * 100).toFixed(1)}%)
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatCurrency(item.spend)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default POStatusBreakdown;
