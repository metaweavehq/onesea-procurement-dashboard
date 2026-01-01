import express from 'express';
import { query, currencyConversion, CURRENCY_JOINS } from '../db.js';

const router = express.Router();

/**
 * GET /api/fleet/overview
 * Returns fleet-wide KPIs for procurement
 * Query params: year (default: current year)
 */
router.get('/overview', async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    // Get total spend, PO count, open POs, avg lead time
    const kpiSql = `
      SELECT
        COUNT(*) as total_pos,
        SUM(${currencyConversion('rps.TOTAL_COST')}) as total_spend_usd,
        SUM(CASE WHEN rps.LAST_STATUS_LOOKUPITEM IN (1090, 10910, 10914) THEN 1 ELSE 0 END) as open_pos,
        ROUND(AVG(CASE WHEN rps.AVG_ISSUED_TO_DELIVERED_DAYS > 0 THEN rps.AVG_ISSUED_TO_DELIVERED_DAYS ELSE NULL END), 1) as avg_lead_time
      FROM rpt_po_status rps
      ${CURRENCY_JOINS}
      WHERE rps.DOC_CANCELLED = 0
        AND YEAR(rps.CREATED_ON) = ?
    `;

    // Get overdue items count
    const overdueSql = `
      SELECT COUNT(*) as overdue_count
      FROM rpt_po_delivery_item
      WHERE DOC_CANCELLED = 0
        AND DUE_DATE < CURDATE()
        AND QUANTITY_DELIVERED < QUANTITY_ORDERED
    `;

    const [kpiResult, overdueResult] = await Promise.all([
      query(kpiSql, [year]),
      query(overdueSql)
    ]);

    res.json({
      year: parseInt(year),
      totalPOs: kpiResult[0]?.total_pos || 0,
      totalSpendUSD: Math.round(kpiResult[0]?.total_spend_usd || 0),
      openPOs: kpiResult[0]?.open_pos || 0,
      avgLeadTimeDays: kpiResult[0]?.avg_lead_time || 0,
      overdueItems: overdueResult[0]?.overdue_count || 0
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/fleet/monthly-spend
 * Returns monthly spend trend for the specified year
 * Query params: year (default: current year)
 */
router.get('/monthly-spend', async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const sql = `
      SELECT
        MONTH(rps.CREATED_ON) as month,
        MONTHNAME(rps.CREATED_ON) as month_name,
        COUNT(*) as po_count,
        SUM(${currencyConversion('rps.TOTAL_COST')}) as spend_usd
      FROM rpt_po_status rps
      ${CURRENCY_JOINS}
      WHERE rps.DOC_CANCELLED = 0
        AND YEAR(rps.CREATED_ON) = ?
      GROUP BY MONTH(rps.CREATED_ON), MONTHNAME(rps.CREATED_ON)
      ORDER BY month
    `;

    const result = await query(sql, [year]);
    res.json(result.map(row => ({
      month: row.month,
      monthName: row.month_name,
      poCount: row.po_count,
      spendUSD: Math.round(row.spend_usd || 0)
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/fleet/spend-by-vessel
 * Returns spend breakdown by vessel
 * Query params: year, limit (default: 15)
 */
router.get('/spend-by-vessel', async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const limit = parseInt(req.query.limit) || 15;

    const sql = `
      SELECT
        s.SHIP_ID,
        s.NAME as vessel_name,
        COUNT(*) as po_count,
        SUM(${currencyConversion('rps.TOTAL_COST')}) as spend_usd
      FROM rpt_po_status rps
      ${CURRENCY_JOINS}
      JOIN ship s ON rps.SHIP_ID = s.SHIP_ID
      WHERE rps.DOC_CANCELLED = 0
        AND YEAR(rps.CREATED_ON) = ?
      GROUP BY s.SHIP_ID, s.NAME
      ORDER BY spend_usd DESC
      LIMIT ${limit}
    `;

    const result = await query(sql, [year]);
    res.json(result.map(row => ({
      shipId: row.SHIP_ID,
      vesselName: row.vessel_name,
      poCount: row.po_count,
      spendUSD: Math.round(row.spend_usd || 0)
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/fleet/status-breakdown
 * Returns PO status distribution
 * Query params: year
 */
router.get('/status-breakdown', async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const sql = `
      SELECT
        rps.LAST_STATUS_LOOKUPITEM as status_code,
        lv.DESCRIPTION as status_name,
        COUNT(*) as count,
        SUM(${currencyConversion('rps.TOTAL_COST')}) as spend_usd
      FROM rpt_po_status rps
      ${CURRENCY_JOINS}
      LEFT JOIN lookup_value lv ON rps.LAST_STATUS_LOOKUPITEM = lv.LOOKUP_ITEM_ID
      WHERE rps.DOC_CANCELLED = 0
        AND YEAR(rps.CREATED_ON) = ?
      GROUP BY rps.LAST_STATUS_LOOKUPITEM, lv.DESCRIPTION
      ORDER BY count DESC
    `;

    const result = await query(sql, [year]);
    res.json(result.map(row => ({
      statusCode: row.status_code,
      statusName: row.status_name || 'Unknown',
      count: row.count,
      spendUSD: Math.round(row.spend_usd || 0)
    })));
  } catch (err) {
    next(err);
  }
});

export default router;
