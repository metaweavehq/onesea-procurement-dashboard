import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency, formatNumber } from '../KPICard';

// Import pipeline sub-components
import ProcurementFunnel from '../pipeline/ProcurementFunnel';
import CycleTimeChart from '../pipeline/CycleTimeChart';
import BottleneckAlerts from '../pipeline/BottleneckAlerts';
import AgingAnalysis from '../pipeline/AgingAnalysis';

const COLORS = {
  Material: '#EC008C',
  Service: '#6366F1',
  Unknown: '#9CA3AF',
};

function AnalyticsTab({ year }) {
  // Pipeline state
  const [funnel, setFunnel] = useState(null);
  const [cycleTimes, setCycleTimes] = useState(null);
  const [bottlenecks, setBottlenecks] = useState(null);
  const [aging, setAging] = useState([]);

  // Material/Service state
  const [materialData, setMaterialData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      // Pipeline APIs
      fetch('/api/pipeline/funnel').then(r => r.json()),
      fetch('/api/pipeline/cycle-times').then(r => r.json()),
      fetch('/api/pipeline/bottlenecks').then(r => r.json()),
      fetch('/api/pipeline/aging').then(r => r.json()),
      // Material/Service API
      fetch(`/api/material-service/split?year=${year}`).then(r => r.json()),
    ])
      .then(([funnelData, cycleData, bottleneckData, agingData, matServiceData]) => {
        setFunnel(funnelData);
        setCycleTimes(cycleData);
        setBottlenecks(bottleneckData);
        setAging(agingData);
        setMaterialData(matServiceData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics data:', err);
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

  // Material/Service chart data
  const spendData = materialData?.breakdown?.map(item => ({
    name: item.category,
    value: item.spendUSD,
    percent: item.percentOfSpend,
    color: COLORS[item.category] || COLORS.Unknown,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Section Header - Pipeline Analysis */}
      <div className="border-b border-gray-200 pb-2">
        <h2 className="text-xl font-bold text-gray-800">Pipeline Analysis</h2>
        <p className="text-sm text-gray-500">Procurement workflow and bottleneck identification</p>
      </div>

      {/* Funnel and Cycle Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcurementFunnel data={funnel} />
        <CycleTimeChart data={cycleTimes} />
      </div>

      {/* Bottleneck Alerts */}
      <BottleneckAlerts alerts={bottlenecks?.alerts || []} />

      {/* Aging Analysis */}
      <AgingAnalysis data={aging} />

      {/* Section Header - Material vs Service */}
      <div className="border-b border-gray-200 pb-2 mt-8">
        <h2 className="text-xl font-bold text-gray-800">Material vs Service Analysis</h2>
        <p className="text-sm text-gray-500">Spend breakdown by purchase type</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Total Spend</h4>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(materialData?.totals?.totalSpendUSD)}</p>
          <p className="text-sm text-gray-500 mt-1">{formatNumber(materialData?.totals?.totalPOs)} POs</p>
        </div>
        {materialData?.breakdown?.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[item.category] || COLORS.Unknown }}
              />
              <h4 className="text-sm font-medium text-gray-500">{item.category}</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(item.spendUSD)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {item.percentOfSpend}% of spend | {formatNumber(item.poCount)} POs
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend Distribution Pie Chart */}
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

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Category Comparison</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">POs</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spend</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg PO</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materialData?.breakdown?.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[item.category] || COLORS.Unknown }}
                      />
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatNumber(item.poCount)} ({item.percentOfCount}%)
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatCurrency(item.spendUSD)} ({item.percentOfSpend}%)
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatCurrency(item.poCount > 0 ? Math.round(item.spendUSD / item.poCount) : 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsTab;
