import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber } from '../KPICard';

function AgingAnalysis({ data }) {
  const chartData = data.map(item => ({
    bucket: item.ageBucket,
    total: item.totalCount,
    open: item.openCount,
    closed: item.totalCount - item.openCount,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PO Aging Analysis</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value, name) => [formatNumber(value), name === 'open' ? 'Open' : 'Closed']}
              />
              <Legend />
              <Bar dataKey="open" name="Open" stackId="a" fill="#EC008C" />
              <Bar dataKey="closed" name="Closed" stackId="a" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Age Distribution</h4>
          {chartData.map((item, index) => {
            const openPercentage = item.total > 0 ? (item.open / item.total) * 100 : 0;
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{item.bucket}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-one-magenta h-2 rounded-full"
                        style={{ width: `${openPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{openPercentage.toFixed(0)}% open</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatNumber(item.total)}</p>
                  <p className="text-xs text-gray-500">{formatNumber(item.open)} open</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AgingAnalysis;
