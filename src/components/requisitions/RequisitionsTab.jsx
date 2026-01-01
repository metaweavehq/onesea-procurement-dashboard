import { useState, useEffect } from 'react';
import KPICard, { formatNumber } from '../KPICard';
import FilterableTable from '../common/FilterableTable';

function RequisitionsTab({ year, shipIds = [] }) {
  const [overview, setOverview] = useState(null);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [priorityBreakdown, setPriorityBreakdown] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ year });
    if (shipIds.length > 0) params.append('shipIds', shipIds.join(','));

    Promise.all([
      fetch(`/api/requisitions/overview?${params}`).then(r => r.json()),
      fetch(`/api/requisitions/status-breakdown?${params}`).then(r => r.json()),
      fetch(`/api/requisitions/priority-breakdown?${params}`).then(r => r.json()),
      fetch(`/api/requisitions/list?${params}`).then(r => r.json()),
    ])
      .then(([overviewData, statusData, priorityData, listData]) => {
        setOverview(overviewData);
        setStatusBreakdown(Array.isArray(statusData) ? statusData : []);
        setPriorityBreakdown(Array.isArray(priorityData) ? priorityData : []);
        setRequisitions(Array.isArray(listData) ? listData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching requisition data:', err);
        setLoading(false);
      });
  }, [year, shipIds.join(',')]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-one-magenta"></div>
      </div>
    );
  }

  // Status funnel data
  const statusOrder = ['CREATED', 'AUTHORIZED', 'REVIEWED', 'CANCELLED'];
  const statusColors = {
    'CREATED': '#94A3B8',
    'AUTHORIZED': '#3B82F6',
    'REVIEWED': '#22C55E',
    'CANCELLED': '#EF4444'
  };

  // Priority labels
  const priorityLabels = {
    'A': 'Critical',
    'B': 'Important',
    'C': 'Planned',
    'D': 'Routine'
  };
  const priorityColors = {
    'A': '#EF4444',
    'B': '#F97316',
    'C': '#EAB308',
    'D': '#94A3B8'
  };

  // Table columns
  const columns = [
    { key: 'req_number', label: 'Req #', type: 'text' },
    { key: 'ship_name', label: 'Vessel', type: 'text', filterable: true },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'priority', label: 'Priority', type: 'priority' },
    { key: 'item_count', label: 'Items', type: 'number' },
    { key: 'critical_count', label: 'Critical', type: 'number' },
    { key: 'date_created', label: 'Created', type: 'date' },
    { key: 'date_needed', label: 'Needed By', type: 'date' },
  ];

  // Header text based on vessel selection
  const getHeaderTitle = () => {
    if (shipIds.length === 0) return 'All Vessels';
    if (shipIds.length === 1) return 'Selected Vessel';
    return `${shipIds.length} Selected Vessels`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-one-magenta rounded-lg p-4 text-white">
        <h2 className="text-xl font-bold">{getHeaderTitle()}</h2>
        <p className="text-one-magenta-light text-sm">Requisitions - {year}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Requisitions"
          value={formatNumber(overview?.total)}
          subtitle={`Year ${year}`}
          color="magenta"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <KPICard
          title="Created/Authorized"
          value={formatNumber(overview?.pending)}
          subtitle="Pending review"
          color="yellow"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Reviewed"
          value={formatNumber(overview?.reviewed)}
          subtitle="Completed"
          color="green"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <KPICard
          title="Cancelled"
          value={formatNumber(overview?.cancelled)}
          subtitle="Terminated"
          color="red"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
        <KPICard
          title="Critical Items"
          value={formatNumber(overview?.criticalItems)}
          subtitle="High priority parts"
          color={overview?.criticalItems > 0 ? 'red' : 'green'}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Status and Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {statusOrder.map(status => {
              const data = statusBreakdown.find(s => s.status === status);
              const count = data?.count || 0;
              const percentage = overview?.total > 0 ? (count / overview.total * 100).toFixed(1) : 0;
              const maxCount = Math.max(...statusBreakdown.map(s => s.count), 1);
              const barWidth = (count / maxCount * 100);

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{status}</span>
                    <span className="text-gray-500">{formatNumber(count)} ({percentage}%)</span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: statusColors[status] || '#94A3B8'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map(priority => {
              const data = priorityBreakdown.find(p => p.priority === priority);
              const count = data?.count || 0;
              const percentage = overview?.total > 0 ? (count / overview.total * 100).toFixed(1) : 0;
              const maxCount = Math.max(...priorityBreakdown.map(p => p.count), 1);
              const barWidth = (count / maxCount * 100);

              return (
                <div key={priority} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {priority} - {priorityLabels[priority]}
                    </span>
                    <span className="text-gray-500">{formatNumber(count)} ({percentage}%)</span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: priorityColors[priority] || '#94A3B8'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Items Alert */}
      {overview?.criticalItems > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-red-800 font-medium">
              {formatNumber(overview.criticalItems)} critical spare parts pending in requisitions
            </span>
          </div>
        </div>
      )}

      {/* Requisitions Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Requisitions List</h3>
        <FilterableTable
          columns={columns}
          data={requisitions}
          searchPlaceholder="Search by requisition number, title, or vessel..."
        />
      </div>
    </div>
  );
}

export default RequisitionsTab;
