import express from 'express';
import { query, currencyConversion, CURRENCY_JOINS } from '../db.js';

const router = express.Router();

/**
 * GET /api/material-service/split
 * Returns material vs service spend breakdown
 * Query params: year (default: current year)
 */
router.get('/split', async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const sql = `
      SELECT
        CASE pr.MAT_SERV_FLAG
          WHEN 0 THEN 'Material'
          WHEN 1 THEN 'Service'
          ELSE 'Unknown'
        END as category,
        pr.MAT_SERV_FLAG as flag,
        COUNT(*) as po_count,
        SUM(${currencyConversion('rps.TOTAL_COST')}) as spend_usd
      FROM rpt_po_status rps
      ${CURRENCY_JOINS}
      WHERE rps.DOC_CANCELLED = 0
        AND YEAR(rps.CREATED_ON) = ?
      GROUP BY pr.MAT_SERV_FLAG
      ORDER BY spend_usd DESC
    `;

    const result = await query(sql, [year]);

    // Convert spend values to numbers (MySQL may return BigInt as strings)
    const processedResult = result.map(row => ({
      ...row,
      spend_usd: Number(row.spend_usd) || 0,
      po_count: Number(row.po_count) || 0
    }));

    const totalSpend = processedResult.reduce((sum, row) => sum + row.spend_usd, 0);
    const totalCount = processedResult.reduce((sum, row) => sum + row.po_count, 0);

    res.json({
      year: parseInt(year),
      breakdown: processedResult.map(row => ({
        category: row.category,
        poCount: row.po_count,
        spendUSD: Math.round(row.spend_usd),
        percentOfSpend: totalSpend > 0 ? Math.round((row.spend_usd / totalSpend) * 100 * 10) / 10 : 0,
        percentOfCount: totalCount > 0 ? Math.round((row.po_count / totalCount) * 100 * 10) / 10 : 0
      })),
      totals: {
        totalSpendUSD: Math.round(totalSpend),
        totalPOs: totalCount
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
