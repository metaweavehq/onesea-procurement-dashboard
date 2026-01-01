import express from 'express';
import cors from 'cors';
import vesselsRoutes from './routes/vessels.js';
import fleetRoutes from './routes/fleet.js';
import pipelineRoutes from './routes/pipeline.js';
import materialServiceRoutes from './routes/material-service.js';
import vesselProcurementRoutes from './routes/vessel-procurement.js';
import requisitionsRoutes from './routes/requisitions.js';
import rfqRoutes from './routes/rfq.js';
import purchaseOrdersRoutes from './routes/purchase-orders.js';

const app = express();
const PORT = 5007;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/vessels', vesselsRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/material-service', materialServiceRoutes);
app.use('/api/vessel', vesselProcurementRoutes);
app.use('/api/requisitions', requisitionsRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Procurement Dashboard API running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  GET /api/health - Health check');
  console.log('  GET /api/vessels - List all vessels');
  console.log('  GET /api/fleet/overview - Fleet KPIs');
  console.log('  GET /api/fleet/monthly-spend - Monthly spend trend');
  console.log('  GET /api/fleet/spend-by-vessel - Spend per vessel');
  console.log('  GET /api/fleet/status-breakdown - PO status distribution');
  console.log('  GET /api/pipeline/funnel - Procurement funnel');
  console.log('  GET /api/pipeline/cycle-times - Cycle time metrics');
  console.log('  GET /api/pipeline/bottlenecks - Bottleneck alerts');
  console.log('  GET /api/pipeline/aging - PO aging analysis');
  console.log('  GET /api/material-service/split - Material vs Service');
  console.log('  GET /api/vessel/:shipId/overview - Vessel KPIs');
  console.log('  GET /api/vessel/:shipId/open-orders - Vessel open POs');
  console.log('  GET /api/vessel/:shipId/requisitions - Requisition status');
  console.log('  GET /api/delivery/:shipId/fill-rate - Fill rate');
  console.log('  GET /api/delivery/:shipId/pending - Pending deliveries');
  console.log('  GET /api/delivery/overdue - Fleet-wide overdue');
});
