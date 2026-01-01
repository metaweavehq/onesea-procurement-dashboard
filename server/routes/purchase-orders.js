import express from 'express';
import { query, currencyConversion, CURRENCY_JOINS } from '../db.js';

const router = express.Router();

// GET /api/purchase-orders/overview - KPI overview (fleet-wide or vessel-specific)
router.get('/overview', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const shipIds = req.query.shipIds ? req.query.shipIds.split(',').map(id => parseInt(id)) : [];

    let whereClause = `WHERE rps.DOC_CANCELLED = 0 AND YEAR(rps.CREATED_ON) = ${parseInt(year)}`;
    if (shipIds.length > 0) {
      whereClause += ` AND rps.SHIP_ID IN (${shipIds.join(',')})`;
    }

    const sql = `
      SELECT
        COUNT(DISTINCT rps.DOCUMENT_ID) as total_pos,
        SUM(${currencyConversion('rps.TOTAL_COST')}) as total_spend_usd,
        SUM(CASE WHEN lv.DESCRIPTION NOT IN ('COMPLETION RECORDED', 'CLOSED', 'CANCELLED') THEN 1 ELSE 0 END) as open_pos,
        SUM(CASE WHEN lv.DESCRIPTION IN ('COMPLETION RECORDED', 'CLOSED') THEN 1 ELSE 0 END) as delivered
      FROM rpt_po_status rps
      ${CURRENCY_JOINS}
      LEFT JOIN lookup_value lv ON rps.LAST_STATUS_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      ${whereClause}
    `;

    // Get overdue items count separately
    let overdueWhereClause = `WHERE DOC_CANCELLED = 0 AND DUE_DATE < CURDATE() AND QUANTITY_DELIVERED < QUANTITY_ORDERED`;
    if (shipIds.length > 0) {
      overdueWhereClause += ` AND SHIP_ID IN (${shipIds.join(',')})`;
    }
    const overdueSql = `
      SELECT COUNT(*) as overdue_count
      FROM rpt_po_delivery_item
      ${overdueWhereClause}
    `;

    const [result, overdueResult] = await Promise.all([
      query(sql),
      query(overdueSql)
    ]);

    res.json({
      year: parseInt(year),
      totalPOs: Number(result[0]?.total_pos) || 0,
      totalSpendUSD: parseFloat(result[0]?.total_spend_usd) || 0,
      openPOs: Number(result[0]?.open_pos) || 0,
      delivered: Number(result[0]?.delivered) || 0,
      overdueItems: Number(overdueResult[0]?.overdue_count) || 0
    });
  } catch (error) {
    console.error('Error fetching PO overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchase-orders/list - Full list (fleet-wide or vessel-specific)
router.get('/list', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const shipIds = req.query.shipIds ? req.query.shipIds.split(',').map(id => parseInt(id)) : [];
    const limit = parseInt(req.query.limit) || 10000; // Allow all records for client-side pagination

    let whereClause = `WHERE rps.DOC_CANCELLED = 0 AND YEAR(rps.CREATED_ON) = ${parseInt(year)}`;
    if (shipIds.length > 0) {
      whereClause += ` AND rps.SHIP_ID IN (${shipIds.join(',')})`;
    }

    const sql = `
      SELECT
        rps.PO_NUMBER as po_code,
        rps.TITLE as title,
        s.NAME as ship_name,
        COALESCE(lv.DESCRIPTION, 'UNKNOWN') as status,
        ${currencyConversion('rps.TOTAL_COST')} as amount_usd,
        rps.CREATED_ON as date_created
      FROM rpt_po_status rps
      ${CURRENCY_JOINS}
      LEFT JOIN ship s ON rps.SHIP_ID = s.SHIP_ID
      LEFT JOIN lookup_value lv ON rps.LAST_STATUS_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      ${whereClause}
      ORDER BY rps.CREATED_ON DESC
      LIMIT ${limit}
    `;

    const result = await query(sql);
    res.json(result);
  } catch (error) {
    console.error('Error fetching PO list:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
