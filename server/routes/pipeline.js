import express from 'express';
import { query } from '../db.js';

const router = express.Router();

/**
 * GET /api/pipeline/funnel
 * Returns procurement funnel counts (Requisitions → RFQs → POs → Delivered)
 */
router.get('/funnel', async (req, res, next) => {
  try {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM requisition) as requisitions,
        (SELECT COUNT(*) FROM rfq) as rfqs,
        (SELECT COUNT(*) FROM rpt_po_status WHERE DOC_CANCELLED = 0) as pos,
        (SELECT COUNT(*) FROM rpt_po_status WHERE DOC_CANCELLED = 0 AND LAST_STATUS_LOOKUPITEM = 10913) as delivered,
        (SELECT COUNT(*) FROM rpt_po_status WHERE DOC_CANCELLED = 0 AND LAST_STATUS_LOOKUPITEM = 1095) as closed
    `;

    const result = await query(sql);
    res.json({
      requisitions: result[0]?.requisitions || 0,
      rfqs: result[0]?.rfqs || 0,
      pos: result[0]?.pos || 0,
      delivered: result[0]?.delivered || 0,
      closed: result[0]?.closed || 0
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/pipeline/cycle-times
 * Returns average cycle times for different procurement stages
 */
router.get('/cycle-times', async (req, res, next) => {
  try {
    const sql = `
      SELECT
        ROUND(AVG(CASE WHEN AVG_CREATED_TO_ISSUED_DAYS > 0 THEN AVG_CREATED_TO_ISSUED_DAYS ELSE NULL END), 1) as created_to_issued,
        ROUND(AVG(CASE WHEN AVG_ISSUED_TO_DELIVERED_DAYS > 0 THEN AVG_ISSUED_TO_DELIVERED_DAYS ELSE NULL END), 1) as issued_to_delivered,
        ROUND(AVG(CASE WHEN AVG_ISSUED_TO_RECEIVED_DAYS > 0 THEN AVG_ISSUED_TO_RECEIVED_DAYS ELSE NULL END), 1) as issued_to_received,
        ROUND(AVG(CASE WHEN AVG_CREATED_TO_ISSUED_DAYS + AVG_ISSUED_TO_DELIVERED_DAYS > 0 THEN AVG_CREATED_TO_ISSUED_DAYS + AVG_ISSUED_TO_DELIVERED_DAYS ELSE NULL END), 1) as created_to_delivered
      FROM rpt_po_status
      WHERE DOC_CANCELLED = 0
    `;

    const result = await query(sql);
    res.json({
      createdToIssued: result[0]?.created_to_issued || 0,
      issuedToDelivered: result[0]?.issued_to_delivered || 0,
      issuedToReceived: result[0]?.issued_to_received || 0,
      createdToDelivered: result[0]?.created_to_delivered || 0
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/pipeline/bottlenecks
 * Returns bottleneck alerts (stuck POs, overdue items, pending approvals)
 */
router.get('/bottlenecks', async (req, res, next) => {
  try {
    // POs stuck in CREATED status for >30 days
    const stuckCreatedSql = `
      SELECT COUNT(*) as count
      FROM rpt_po_status
      WHERE DOC_CANCELLED = 0
        AND LAST_STATUS_LOOKUPITEM = 1090
        AND DATEDIFF(CURDATE(), CREATED_ON) > 30
    `;

    // POs issued but not delivered for >60 days
    const stuckIssuedSql = `
      SELECT COUNT(*) as count
      FROM rpt_po_status
      WHERE DOC_CANCELLED = 0
        AND LAST_STATUS_LOOKUPITEM = 10910
        AND DATEDIFF(CURDATE(), CREATED_ON) > 60
    `;

    // Overdue delivery items
    const overdueSql = `
      SELECT COUNT(*) as count
      FROM rpt_po_delivery_item
      WHERE DOC_CANCELLED = 0
        AND DUE_DATE < CURDATE()
        AND QUANTITY_DELIVERED < QUANTITY_ORDERED
    `;

    // High priority POs not yet issued
    const highPrioritySql = `
      SELECT COUNT(*) as count
      FROM rpt_po_status rps
      WHERE rps.DOC_CANCELLED = 0
        AND rps.LAST_STATUS_LOOKUPITEM = 1090
        AND rps.PRIORITY_LOOKUPITEM IN (1170, 1171)
    `;

    const [stuckCreated, stuckIssued, overdue, highPriority] = await Promise.all([
      query(stuckCreatedSql),
      query(stuckIssuedSql),
      query(overdueSql),
      query(highPrioritySql)
    ]);

    res.json({
      alerts: [
        {
          type: 'stuck_created',
          label: 'POs stuck in Created (>30 days)',
          count: stuckCreated[0]?.count || 0,
          severity: 'warning'
        },
        {
          type: 'stuck_issued',
          label: 'POs issued but not delivered (>60 days)',
          count: stuckIssued[0]?.count || 0,
          severity: 'warning'
        },
        {
          type: 'overdue',
          label: 'Overdue delivery items',
          count: overdue[0]?.count || 0,
          severity: 'critical'
        },
        {
          type: 'high_priority_pending',
          label: 'High priority POs pending issue',
          count: highPriority[0]?.count || 0,
          severity: 'critical'
        }
      ]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/pipeline/aging
 * Returns PO aging analysis (by days since creation)
 */
router.get('/aging', async (req, res, next) => {
  try {
    const sql = `
      SELECT
        CASE
          WHEN DATEDIFF(CURDATE(), CREATED_ON) <= 7 THEN '0-7 days'
          WHEN DATEDIFF(CURDATE(), CREATED_ON) <= 14 THEN '8-14 days'
          WHEN DATEDIFF(CURDATE(), CREATED_ON) <= 30 THEN '15-30 days'
          WHEN DATEDIFF(CURDATE(), CREATED_ON) <= 60 THEN '31-60 days'
          ELSE '60+ days'
        END as age_bucket,
        COUNT(*) as count,
        SUM(CASE WHEN LAST_STATUS_LOOKUPITEM IN (1090, 10910, 10914) THEN 1 ELSE 0 END) as open_count
      FROM rpt_po_status
      WHERE DOC_CANCELLED = 0
      GROUP BY age_bucket
      ORDER BY FIELD(age_bucket, '0-7 days', '8-14 days', '15-30 days', '31-60 days', '60+ days')
    `;

    const result = await query(sql);
    res.json(result.map(row => ({
      ageBucket: row.age_bucket,
      totalCount: row.count,
      openCount: row.open_count
    })));
  } catch (err) {
    next(err);
  }
});

export default router;
