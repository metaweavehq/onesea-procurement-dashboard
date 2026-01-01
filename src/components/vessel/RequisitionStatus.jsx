import { formatNumber } from '../KPICard';

const STATUS_COLORS = {
  'CREATED': 'bg-gray-400',
  'APPROVED': 'bg-green-500',
  'AUTHORIZED': 'bg-blue-500',
  'CLOSED': 'bg-indigo-500',
  'CANCELLED': 'bg-red-500',
};

function RequisitionStatus({ data }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Requisition Status Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const colorClass = STATUS_COLORS[item.status?.toUpperCase()] || 'bg-gray-400';

          return (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                <span className="text-sm font-medium text-gray-700">{item.status || 'Unknown'}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(item.count)}</p>
              <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RequisitionStatus;
