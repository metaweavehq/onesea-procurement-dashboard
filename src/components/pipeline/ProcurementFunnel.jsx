import { formatNumber } from '../KPICard';

function ProcurementFunnel({ data }) {
  const stages = [
    { key: 'requisitions', label: 'Requisitions', color: 'bg-gray-400' },
    { key: 'rfqs', label: 'RFQs', color: 'bg-yellow-500' },
    { key: 'pos', label: 'Purchase Orders', color: 'bg-one-magenta' },
    { key: 'delivered', label: 'Delivered', color: 'bg-green-500' },
    { key: 'closed', label: 'Closed', color: 'bg-blue-500' },
  ];

  const maxValue = Math.max(...stages.map(s => data?.[s.key] || 0));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Procurement Funnel</h3>
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const value = data?.[stage.key] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div key={stage.key} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                <span className="text-sm font-bold text-gray-900">{formatNumber(value)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                >
                  {percentage > 20 && (
                    <span className="text-xs font-medium text-white">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="flex justify-center my-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProcurementFunnel;
