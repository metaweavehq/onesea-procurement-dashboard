import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatNumber } from '../KPICard';

const COLORS = {
  Material: '#EC008C',
  Service: '#6366F1',
  Unknown: '#9CA3AF',
};

function MaterialServiceAnalysis({ year }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/material-service/split?year=${year}`)
      .then(r => r.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching material/service data:', err);
        setLoading(false);
      });
  }, [year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-one-magenta"></div>
      </div>
    );
  }

  const spendData = data?.breakdown?.map(item => ({
    name: item.category,
    value: item.spendUSD,
    percent: item.percentOfSpend,
    color: COLORS[item.category] || COLORS.Unknown,
  })) || [];

  const countData = data?.breakdown?.map(item => ({
    name: item.category,
    value: item.poCount,
    percent: item.percentOfCount,
    color: COLORS[item.category] || COLORS.Unknown,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Total Spend</h4>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(data?.totals?.totalSpendUSD)}</p>
          <p className="text-sm text-gray-500 mt-1">{formatNumber(data?.totals?.totalPOs)} purchase orders</p>
        </div>
        {data?.breakdown?.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[item.category] || COLORS.Unknown }}
              />
              <h4 className="text-sm font-medium text-gray-500">{item.category}</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(item.spendUSD)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {item.percentOfSpend}% of spend | {formatNumber(item.poCount)} POs
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spend Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${percent}%`}
                  labelLine={false}
                >
                  {spendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PO Count Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PO Count Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${percent}%`}
                  labelLine={false}
                >
                  {countData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatNumber(value) + ' POs'}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Comparison Table</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">PO Count</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Count</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend (USD)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Spend</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg PO Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.breakdown?.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[item.category] || COLORS.Unknown }}
                    />
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatNumber(item.poCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {item.percentOfCount}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatCurrency(item.spendUSD)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {item.percentOfSpend}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrency(item.poCount > 0 ? Math.round(item.spendUSD / item.poCount) : 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MaterialServiceAnalysis;
