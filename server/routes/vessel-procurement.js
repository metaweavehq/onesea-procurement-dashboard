import express from 'express';
import { query, currencyConversion, CURRENCY_JOINS } from '../db.js';

const router = express.Router();

/**
 * GET /api/vessel/:shipId/overview
 * Returns KPIs for a specific vessel
 * Query params: year (default: current year)
 */
router.get('/:shipId/overview', async (req, res, next) => {
  try {
    const { shipId } = req.params;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const sql = `
      SELECT
        COUNT(*) as total_pos,
        SUM(${currencyConversion('rps.TOTAL_COST')}) as total_spend_usd,
        SUM(CASE WHEN rps.LAST_STATUS_LOOKUPITEM IN (1090, 10910, 10914) THEN 1 ELSE 0 END) as open_pos,
        SUM(CASE WHEN rps.LAST_STATUS_LOOKUPITEM = 10913 THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN rps.LAST_STATUS_LOOKUPITEM = 1095 THEN 1 ELSE 0 END) as closed,
        ROUND(AVG(CASE WHEN rps.AVG_ISSUED_TO_DELIVERED_DAYS > 0 THEN rps.AVG_ISSUED_TO_DELIVERED_DAYS ELSE NULL END), 1) as avg_lead_time
      FROM rpt_po_status rps
      ${CURRENCY_JOINS}
      WHERE rps.DOC_CANCELLED = 0
        AND rps.SHIP_ID = ?
        AND YEAR(rps.CREATED_ON) = ${year}
    `;

    // Get overdue for this vessel (current overdue, regardless of year)
    const overdueSql = `
      SELECT COUNT(*) as overdue_count
      FROM rpt_po_delivery_item rdi
      WHERE rdi.DOC_CANCELLED = 0
        AND rdi.DUE_DATE < CURDATE()
        AND rdi.QUANTITY_DELIVERED < rdi.QUANTITY_ORDERED
        AND rdi.SHIP_ID = ?
    `;

    const [kpiResult, overdueResult] = await Promise.all([
      query(sql, [shipId]),
      query(overdueSql, [shipId])
    ]);

    res.json({
      shipId: parseInt(shipId),
      year: year,
      totalPOs: kpiResult[0]?.total_pos || 0,
      totalSpendUSD: Math.round(kpiResult[0]?.total_spend_usd || 0),
      openPOs: kpiResult[0]?.open_pos || 0,
      delivered: kpiResult[0]?.delivered || 0,
      closed: kpiResult[0]?.closed || 0,
      avgLeadTimeDays: kpiResult[0]?.avg_lead_time || 0,
      overdueItems: overdueResult[0]?.overdue_count || 0
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/vessel/:shipId/open-orders
 * Returns POs for a specific vessel
 * Query params: year, limit (default: 100)
 */
router.get('/:shipId/open-orders', async (req, res, next) => {
  try {
    const { shipId } = req.params;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    const sql = `
      SELECT
        rps.DOCUMENT_ID,
        rps.PO_NUMBER as po_code,
        rps.CREATED_ON as date_created,
        lv.DESCRIPTION as status,
        ${currencyConversion('rps.TOTAL_COST')} as amount_usd,
        c.ABBREVIATION as currency,
        rps.TOTAL_COST as native_amount,
        rps.TITLE as title,
        rps.AVG_ISSUED_TO_DELIVERED_DAYS as lead_time_days
      FROM rpt_po_status rps
      ${CURRENCY_JOINS}
      LEFT JOIN lookup_value lv ON rps.LAST_STATUS_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      WHERE rps.DOC_CANCELLED = 0
        AND rps.SHIP_ID = ?
        AND YEAR(rps.CREATED_ON) = ${year}
      ORDER BY rps.CREATED_ON DESC
      LIMIT ${limit}
    `;

    const result = await query(sql, [shipId]);
    res.json(result.map(row => ({
      id: row.DOCUMENT_ID,
      po_code: row.po_code,
      title: row.title || 'Untitled',
      status: row.status || 'Unknown',
      amount_usd: Math.round(row.amount_usd || 0),
      date_created: row.date_created,
      currency: row.currency,
      native_amount: row.native_amount,
      lead_time_days: row.lead_time_days
    })));
  } catch (err) {
    next(err);
  }
});

export default router;
