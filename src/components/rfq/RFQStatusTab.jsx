import { useState, useEffect } from 'react';
import KPICard, { formatNumber } from '../KPICard';
import FilterableTable from '../common/FilterableTable';

function RFQStatusTab({ year, shipIds = [] }) {
  const [overview, setOverview] = useState(null);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [priorityBreakdown, setPriorityBreakdown] = useState([]);
  const [cycleTimes, setCycleTimes] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ year });
    if (shipIds.length > 0) params.append('shipIds', shipIds.join(','));

    Promise.all([
      fetch(`/api/rfq/overview?${params}`).then(r => r.json()),
      fetch(`/api/rfq/status-breakdown?${params}`).then(r => r.json()),
      fetch(`/api/rfq/priority-breakdown?${params}`).then(r => r.json()),
      fetch(`/api/rfq/cycle-times?${params}`).then(r => r.json()),
      fetch(`/api/rfq/list?${params}`).then(r => r.json()),
    ])
      .then(([overviewData, statusData, priorityData, cycleData, listData]) => {
        setOverview(overviewData);
        setStatusBreakdown(Array.isArray(statusData) ? statusData : []);
        setPriorityBreakdown(Array.isArray(priorityData) ? priorityData : []);
        setCycleTimes(cycleData);
        setRfqs(Array.isArray(listData) ? listData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching RFQ data:', err);
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
  const statusOrder = ['CREATED', 'ISSUED', 'EVALUATED', 'APPROVED', 'CANCELLED'];
  const statusColors = {
    'CREATED': '#94A3B8',
    'ISSUED': '#3B82F6',
    'EVALUATED': '#A855F7',
    'APPROVED': '#22C55E',
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
    { key: 'rfq_number', label: 'RFQ #', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'ship_name', label: 'Vessel', type: 'text', filterable: true },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'priority', label: 'Priority', type: 'priority' },
    { key: 'vendor_count', label: 'Vendors', type: 'number' },
    { key: 'days_to_evaluate', label: 'Days to Eval', type: 'number' },
    { key: 'date_created', label: 'Created', type: 'date' },
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
        <p className="text-one-magenta-light text-sm">RFQ Status - {year}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total RFQs"
          value={formatNumber(overview?.total)}
          subtitle={`Year ${year}`}
          color="magenta"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Awaiting Quotes"
          value={formatNumber(overview?.awaitingQuotes)}
          subtitle="Waiting for vendors"
          color="yellow"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="In Progress"
          value={formatNumber(overview?.inProgress)}
          subtitle="Issued + Evaluated"
          color="blue"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <KPICard
          title="Approved"
          value={formatNumber(overview?.approved)}
          subtitle="Ready for PO"
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
      </div>

      {/* Cycle Times and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cycle Times */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Cycle Times</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Issue → Evaluation</span>
                <span className="font-semibold text-one-magenta">
                  {cycleTimes?.issueToEvaluation?.toFixed(1) || 0} days
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-one-magenta rounded-full"
                  style={{ width: `${Math.min((cycleTimes?.issueToEvaluation || 0) / 30 * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Evaluation → Approval</span>
                <span className="font-semibold text-green-600">
                  {cycleTimes?.evaluationToApproval?.toFixed(1) || 0} days
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.min((cycleTimes?.evaluationToApproval || 0) / 5 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Cycle</span>
              <span className="font-bold text-gray-800">
                {((cycleTimes?.issueToEvaluation || 0) + (cycleTimes?.evaluationToApproval || 0)).toFixed(1)} days
              </span>
            </div>
          </div>
        </div>

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
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
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
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
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

      {/* RFQ Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">RFQ List</h3>
        <FilterableTable
          columns={columns}
          data={rfqs}
          searchPlaceholder="Search by RFQ number, title, or vessel..."
        />
      </div>
    </div>
  );
}

export default RFQStatusTab;
