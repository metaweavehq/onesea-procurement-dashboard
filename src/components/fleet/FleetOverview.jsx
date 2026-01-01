import { useState, useEffect } from 'react';
import KPICard, { formatCurrency, formatNumber } from '../KPICard';
import MonthlySpendChart from './MonthlySpendChart';
import SpendByVesselChart from './SpendByVesselChart';
import POStatusBreakdown from './POStatusBreakdown';

function FleetOverview({ year }) {
  const [overview, setOverview] = useState(null);
  const [monthlySpend, setMonthlySpend] = useState([]);
  const [spendByVessel, setSpendByVessel] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/fleet/overview?year=${year}`).then(r => r.json()),
      fetch(`/api/fleet/monthly-spend?year=${year}`).then(r => r.json()),
      fetch(`/api/fleet/spend-by-vessel?year=${year}&limit=10`).then(r => r.json()),
      fetch(`/api/fleet/status-breakdown?year=${year}`).then(r => r.json()),
    ])
      .then(([overviewData, monthlyData, vesselData, statusData]) => {
        setOverview(overviewData);
        setMonthlySpend(monthlyData);
        setSpendByVessel(vesselData);
        setStatusBreakdown(statusData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching fleet data:', err);
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

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Spend (USD)"
          value={formatCurrency(overview?.totalSpendUSD)}
          subtitle={`${formatNumber(overview?.totalPOs)} purchase orders`}
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
          subtitle="Awaiting delivery or closure"
          color="blue"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <KPICard
          title="Overdue Items"
          value={formatNumber(overview?.overdueItems)}
          subtitle="Past due date"
          color={overview?.overdueItems > 0 ? 'red' : 'green'}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Avg Lead Time"
          value={`${overview?.avgLeadTimeDays || 0} days`}
          subtitle="Issue to delivery"
          color="gray"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlySpendChart data={monthlySpend} />
        <SpendByVesselChart data={spendByVessel} />
      </div>

      {/* Status Breakdown */}
      <POStatusBreakdown data={statusBreakdown} />
    </div>
  );
}

export default FleetOverview;
