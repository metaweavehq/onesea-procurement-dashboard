import { useState, useEffect } from 'react';
import ProcurementFunnel from './ProcurementFunnel';
import CycleTimeChart from './CycleTimeChart';
import BottleneckAlerts from './BottleneckAlerts';
import AgingAnalysis from './AgingAnalysis';

function PipelineAnalysis() {
  const [funnel, setFunnel] = useState(null);
  const [cycleTimes, setCycleTimes] = useState(null);
  const [bottlenecks, setBottlenecks] = useState(null);
  const [aging, setAging] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/pipeline/funnel').then(r => r.json()),
      fetch('/api/pipeline/cycle-times').then(r => r.json()),
      fetch('/api/pipeline/bottlenecks').then(r => r.json()),
      fetch('/api/pipeline/aging').then(r => r.json()),
    ])
      .then(([funnelData, cycleData, bottleneckData, agingData]) => {
        setFunnel(funnelData);
        setCycleTimes(cycleData);
        setBottlenecks(bottleneckData);
        setAging(agingData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching pipeline data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-one-magenta"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Funnel and Cycle Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcurementFunnel data={funnel} />
        <CycleTimeChart data={cycleTimes} />
      </div>

      {/* Bottleneck Alerts */}
      <BottleneckAlerts alerts={bottlenecks?.alerts || []} />

      {/* Aging Analysis */}
      <AgingAnalysis data={aging} />
    </div>
  );
}

export default PipelineAnalysis;
