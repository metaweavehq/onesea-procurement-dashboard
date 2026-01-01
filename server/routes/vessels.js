import express from 'express';
import { query } from '../db.js';

const router = express.Router();

/**
 * GET /api/vessels
 * Returns list of all vessels with procurement activity
 */
router.get('/', async (req, res, next) => {
  try {
    const sql = `
      SELECT DISTINCT
        s.SHIP_ID,
        s.NAME,
        s.CODE
      FROM ship s
      WHERE s.SHIP_ID IN (
        SELECT DISTINCT SHIP_ID FROM rpt_po_status WHERE SHIP_ID IS NOT NULL
      )
      ORDER BY s.NAME
    `;
    const vessels = await query(sql);
    res.json(vessels);
  } catch (err) {
    next(err);
  }
});

export default router;
