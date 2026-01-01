function KPICard({ title, value, subtitle, icon, trend, color = 'magenta' }) {
  const colorClasses = {
    magenta: 'bg-one-magenta',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <div className="flex items-start justify-between flex-1">
        <div className="flex-1 flex flex-col">
          <p className="text-sm font-medium text-gray-500 h-5">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500 min-h-[20px]">{subtitle || '\u00A0'}</p>
          {trend && (
            <p className={`mt-1 text-sm font-medium ${trendColors[trend.direction] || trendColors.neutral}`}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.text}
            </p>
          )}
        </div>
        {icon && (
          <div className={`${colorClasses[color]} p-3 rounded-lg flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return '$0.00';
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString();
}

export default KPICard;
