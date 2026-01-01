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

// GET /api/rfq/overview - KPI overview
router.get('/overview', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const shipIds = req.query.shipIds ? req.query.shipIds.split(',') : [];

    let whereClause = `WHERE YEAR(r.CREATED_ON) = ${parseInt(year)}`;
    whereClause += buildShipFilter(shipIds);

    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN lv.DESCRIPTION = 'CREATED' THEN 1 ELSE 0 END) as created,
        SUM(CASE WHEN lv.DESCRIPTION IN ('ISSUED', 'EVALUATED') THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN lv.DESCRIPTION = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN lv.DESCRIPTION = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN r.AWAITING_QUOTE = 1 THEN 1 ELSE 0 END) as awaiting_quotes,
        SUM(CASE WHEN r.READY_FOR_PRICING = 1 THEN 1 ELSE 0 END) as ready_for_pricing
      FROM rpt_rfq_status r
      LEFT JOIN lookup_value lv ON r.LAST_STATUS_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      ${whereClause}
    `;

    const result = await query(sql);
    res.json({
      year: parseInt(year),
      total: Number(result[0]?.total) || 0,
      created: Number(result[0]?.created) || 0,
      inProgress: Number(result[0]?.in_progress) || 0,
      approved: Number(result[0]?.approved) || 0,
      cancelled: Number(result[0]?.cancelled) || 0,
      awaitingQuotes: Number(result[0]?.awaiting_quotes) || 0,
      readyForPricing: Number(result[0]?.ready_for_pricing) || 0
    });
  } catch (error) {
    console.error('Error fetching RFQ overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rfq/status-breakdown - Status distribution
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
      FROM rpt_rfq_status r
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
    console.error('Error fetching RFQ status breakdown:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rfq/priority-breakdown - Priority distribution
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
      FROM rpt_rfq_status r
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
    console.error('Error fetching RFQ priority breakdown:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rfq/cycle-times - Average cycle times
router.get('/cycle-times', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const shipIds = req.query.shipIds ? req.query.shipIds.split(',') : [];

    let whereClause = `WHERE YEAR(r.CREATED_ON) = ${parseInt(year)}`;
    whereClause += buildShipFilter(shipIds);

    const sql = `
      SELECT
        AVG(CASE WHEN r.DAYS_ISSUED_TO_EVALUATED > 0 THEN r.DAYS_ISSUED_TO_EVALUATED END) as avg_issue_to_eval,
        AVG(CASE WHEN r.DAYS_EVALUATED_TO_APPROVED > 0 THEN r.DAYS_EVALUATED_TO_APPROVED END) as avg_eval_to_approved
      FROM rpt_rfq_status r
      ${whereClause}
    `;

    const result = await query(sql);
    res.json({
      issueToEvaluation: parseFloat(result[0]?.avg_issue_to_eval) || 0,
      evaluationToApproval: parseFloat(result[0]?.avg_eval_to_approved) || 0
    });
  } catch (error) {
    console.error('Error fetching RFQ cycle times:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rfq/list - Full list with filters
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
        r.RFQ_NUMBER as rfq_number,
        r.TITLE as title,
        s.NAME as ship_name,
        COALESCE(lv.DESCRIPTION, 'UNKNOWN') as status,
        COALESCE(lv2.DESCRIPTION, 'D') as priority,
        COALESCE(r.VENDOR_CNT, 0) as vendor_count,
        COALESCE(r.DAYS_ISSUED_TO_EVALUATED, 0) as days_to_evaluate,
        r.CREATED_ON as date_created,
        r.ISSUED_ON as date_issued,
        r.APPROVED_ON as date_approved
      FROM rpt_rfq_status r
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
    console.error('Error fetching RFQ list:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
