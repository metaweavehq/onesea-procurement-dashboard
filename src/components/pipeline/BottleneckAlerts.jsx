import { formatNumber } from '../KPICard';

function BottleneckAlerts({ alerts }) {
  const severityStyles = {
    critical: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const severityIcons = {
    critical: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const activeAlerts = alerts.filter(a => a.count > 0);
  const totalIssues = activeAlerts.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bottleneck Alerts</h3>
        {totalIssues > 0 && (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            {formatNumber(totalIssues)} issues
          </span>
        )}
      </div>

      {activeAlerts.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">No bottlenecks detected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border ${severityStyles[alert.severity]}`}
            >
              <div className="flex items-center gap-3">
                {severityIcons[alert.severity]}
                <span className="font-medium">{alert.label}</span>
              </div>
              <span className="text-lg font-bold">{formatNumber(alert.count)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BottleneckAlerts;
