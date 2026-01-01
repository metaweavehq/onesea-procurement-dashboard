import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Helper to build ship filter clause
function buildShipFilter(shipIds, alias = 'r') {
  if (!shipIds || shipIds.length === 0) return '';
  const ids = shipIds.map(id => parseInt(id)).filter(id => !isNaN(id));
  if (ids.length === 0) return '';
  return ` AND ${alias}.SHIP_ID IN (${ids.join(',')})`;
}

// GET /api/requisitions/overview - KPI overview
router.get('/overview', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const shipIds = req.query.shipIds ? req.query.shipIds.split(',') : [];

    let whereClause = `WHERE YEAR(r.CREATED_ON) = ${parseInt(year)}`;
    whereClause += buildShipFilter(shipIds);

    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN lv.DESCRIPTION IN ('CREATED', 'AUTHORIZED') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN lv.DESCRIPTION = 'REVIEWED' THEN 1 ELSE 0 END) as reviewed,
        SUM(CASE WHEN lv.DESCRIPTION = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
        SUM(COALESCE(r.CRITICAL_CNT, 0)) as critical_items
      FROM rpt_req_status r
      LEFT JOIN lookup_value lv ON r.LAST_STATUS_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      ${whereClause}
    `;

    const result = await query(sql);
    res.json({
      year: parseInt(year),
      total: Number(result[0]?.total) || 0,
      pending: Number(result[0]?.pending) || 0,
      reviewed: Number(result[0]?.reviewed) || 0,
      cancelled: Number(result[0]?.cancelled) || 0,
      criticalItems: Number(result[0]?.critical_items) || 0
    });
  } catch (error) {
    console.error('Error fetching requisition overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requisitions/status-breakdown - Status distribution
router.get('/status-breakdown', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const shipIds = req.query.shipIds ? req.query.shipIds.split(',') : [];

    let whereClause = `WHERE YEAR(r.CREATED_ON) = ${parseInt(year)}`;
    whereClause += buildShipFilter(shipIds);

    const sql = `
      SELECT
        COALESCE(lv.DESCRIPTION, 'UNKNOWN') as status,
        COUNT(*) as count
      FROM rpt_req_status r
      LEFT JOIN lookup_value lv ON r.LAST_STATUS_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      ${whereClause}
      GROUP BY lv.DESCRIPTION
      ORDER BY count DESC
    `;

    const result = await query(sql);
    res.json(result.map(row => ({
      status: row.status,
      count: Number(row.count)
    })));
  } catch (error) {
    console.error('Error fetching requisition status breakdown:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requisitions/priority-breakdown - Priority distribution
router.get('/priority-breakdown', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const shipIds = req.query.shipIds ? req.query.shipIds.split(',') : [];

    let whereClause = `WHERE YEAR(r.CREATED_ON) = ${parseInt(year)}`;
    whereClause += buildShipFilter(shipIds);

    const sql = `
      SELECT
        COALESCE(lv.DESCRIPTION, 'UNKNOWN') as priority,
        COUNT(*) as count
      FROM rpt_req_status r
      LEFT JOIN lookup_value lv ON r.PRIORITY_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      ${whereClause}
      GROUP BY lv.DESCRIPTION
      ORDER BY
        CASE lv.DESCRIPTION
          WHEN 'A' THEN 1
          WHEN 'B' THEN 2
          WHEN 'C' THEN 3
          WHEN 'D' THEN 4
          ELSE 5
        END
    `;

    const result = await query(sql);
    res.json(result.map(row => ({
      priority: row.priority,
      count: Number(row.count)
    })));
  } catch (error) {
    console.error('Error fetching requisition priority breakdown:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requisitions/critical - Requisitions with critical items
router.get('/critical', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const shipIds = req.query.shipIds ? req.query.shipIds.split(',') : [];
    const limit = parseInt(req.query.limit) || 10000;

    let whereClause = `WHERE YEAR(r.CREATED_ON) = ${parseInt(year)} AND r.CRITICAL_CNT > 0`;
    whereClause += buildShipFilter(shipIds);

    const sql = `
      SELECT
        r.REQ_NUMBER as req_number,
        s.NAME as ship_name,
        COALESCE(lv.DESCRIPTION, 'UNKNOWN') as status,
        COALESCE(lv2.DESCRIPTION, 'D') as priority,
        r.CRITICAL_CNT as critical_count,
        r.ITEM_CNT as item_count,
        r.CREATED_ON as date_created,
        r.DATE_NEEDED as date_needed
      FROM rpt_req_status r
      LEFT JOIN ship s ON r.SHIP_ID = s.SHIP_ID
      LEFT JOIN lookup_value lv ON r.LAST_STATUS_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      LEFT JOIN lookup_value lv2 ON r.PRIORITY_LOOKUPITEM = lv2.LOOKUP_ITEM_ID
      ${whereClause}
      ORDER BY r.CRITICAL_CNT DESC, r.CREATED_ON DESC
      LIMIT ${limit}
    `;

    const result = await query(sql);
    res.json(result);
  } catch (error) {
    console.error('Error fetching critical requisitions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requisitions/list - Full list with filters
router.get('/list', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const shipIds = req.query.shipIds ? req.query.shipIds.split(',') : [];
    const status = req.query.status;
    const priority = req.query.priority;
    const limit = parseInt(req.query.limit) || 10000;

    let whereClause = `WHERE YEAR(r.CREATED_ON) = ${parseInt(year)}`;
    whereClause += buildShipFilter(shipIds);
    if (status) {
      whereClause += ` AND lv.DESCRIPTION = '${status}'`;
    }
    if (priority) {
      whereClause += ` AND lv2.DESCRIPTION = '${priority}'`;
    }

    const sql = `
      SELECT
        r.REQ_NUMBER as req_number,
        s.NAME as ship_name,
        COALESCE(lv.DESCRIPTION, 'UNKNOWN') as status,
        COALESCE(lv2.DESCRIPTION, 'D') as priority,
        COALESCE(r.CRITICAL_CNT, 0) as critical_count,
        COALESCE(r.ITEM_CNT, 0) as item_count,
        r.CREATED_ON as date_created,
        r.DATE_NEEDED as date_needed
      FROM rpt_req_status r
      LEFT JOIN ship s ON r.SHIP_ID = s.SHIP_ID
      LEFT JOIN lookup_value lv ON r.LAST_STATUS_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      LEFT JOIN lookup_value lv2 ON r.PRIORITY_LOOKUPITEM = lv2.LOOKUP_ITEM_ID
      ${whereClause}
      ORDER BY r.CREATED_ON DESC
      LIMIT ${limit}
    `;

    const result = await query(sql);
    res.json(result);
  } catch (error) {
    console.error('Error fetching requisition list:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
