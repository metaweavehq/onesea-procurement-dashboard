import { useState, useEffect } from 'react';
import KPICard, { formatCurrency, formatNumber } from '../KPICard';
import FilterableTable from '../common/FilterableTable';

function VesselProcurement({ shipIds = [], vesselNames = [], year }) {
  const [overview, setOverview] = useState(null);
  const [openOrders, setOpenOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine if we're showing fleet-wide or vessel-specific
  const isFleetWide = shipIds.length === 0;
  const isSingleVessel = shipIds.length === 1;
  const isMultiVessel = shipIds.length > 1;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ year: year || new Date().getFullYear() });

    // Add ship IDs if specific vessels selected
    if (shipIds.length > 0) {
      params.append('shipIds', shipIds.join(','));
    }

    Promise.all([
      fetch(`/api/purchase-orders/overview?${params}`).then(r => r.json()),
      fetch(`/api/purchase-orders/list?${params}`).then(r => r.json()),
    ])
      .then(([overviewData, ordersData]) => {
        setOverview(overviewData);
        setOpenOrders(Array.isArray(ordersData) ? ordersData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching purchase order data:', err);
        setLoading(false);
      });
  }, [shipIds.join(','), year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-one-magenta"></div>
      </div>
    );
  }

  // Table columns - include vessel column for fleet-wide or multi-vessel view
  const columns = [
    { key: 'po_code', label: 'PO #', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    ...(!isSingleVessel ? [{ key: 'ship_name', label: 'Vessel', type: 'text', filterable: true }] : []),
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'amount_usd', label: 'Amount (USD)', type: 'currency' },
    { key: 'date_created', label: 'Created', type: 'date' },
  ];

  // Header text
  const headerTitle = isFleetWide
    ? 'All Vessels'
    : isSingleVessel
      ? vesselNames[0]
      : `${vesselNames.length} Selected Vessels`;

  const headerSubtitle = isFleetWide
    ? `Fleet Purchase Orders - ${year}`
    : isSingleVessel
      ? `Purchase Orders - ${year}`
      : `${vesselNames.slice(0, 3).join(', ')}${vesselNames.length > 3 ? '...' : ''} - ${year}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-one-magenta rounded-lg p-4 text-white">
        <h2 className="text-xl font-bold">{headerTitle}</h2>
        <p className="text-one-magenta-light text-sm">{headerSubtitle}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Spend (USD)"
          value={formatCurrency(overview?.totalSpendUSD)}
          subtitle={`${formatNumber(overview?.totalPOs)} total POs`}
          color="magenta"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Open POs"
          value={formatNumber(overview?.openPOs)}
          subtitle="Awaiting delivery"
          color="blue"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <KPICard
          title="Delivered"
          value={formatNumber(overview?.delivered)}
          subtitle="Items received"
          color="green"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <KPICard
          title="Overdue"
          value={formatNumber(overview?.overdueItems)}
          subtitle="Past due date"
          color={overview?.overdueItems > 0 ? 'red' : 'green'}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Purchase Orders Table with Filters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Orders</h3>
        <FilterableTable
          columns={columns}
          data={openOrders}
          searchPlaceholder="Search by PO number, title, or vessel..."
        />
      </div>
    </div>
  );
}

export default VesselProcurement;
