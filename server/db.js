import mysql from 'mysql2/promise';

// Create connection pool - Local MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'safenet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Currency conversion SQL helper
 * Converts native currency amounts to USD using exchange rate from po_revision
 *
 * Usage in SELECT: ${currencyConversion('rps.TOTAL_COST', 'pr.EXCHANGE_RATE', 'c.ABBREVIATION')}
 *
 * @param {string} amountColumn - Column containing the native currency amount
 * @param {string} exchangeRateColumn - Column containing the exchange rate
 * @param {string} currencyColumn - Column containing the currency abbreviation
 * @returns {string} SQL CASE expression for currency conversion
 */
export function currencyConversion(amountColumn, exchangeRateColumn = 'pr.EXCHANGE_RATE', currencyColumn = 'c.ABBREVIATION') {
  return `CASE
    WHEN ${currencyColumn} = 'USD' OR ${exchangeRateColumn} IS NULL OR ${exchangeRateColumn} = 0 THEN ${amountColumn}
    ELSE ROUND(${amountColumn} * ${exchangeRateColumn}, 2)
  END`;
}

/**
 * Standard currency join fragment for rpt_po_status queries
 * Joins po_revision and currency tables to enable currency conversion
 */
export const CURRENCY_JOINS = `
  LEFT JOIN po_revision pr ON rps.CURRENT_REVISION_ID = pr.DOCUMENT_REVISION_ID
  LEFT JOIN currency c ON pr.CURRENCY_ID = c.CURRENCY_ID
`;

/**
 * Format number as USD currency string
 * @param {number} value - The numeric value
 * @returns {string} Formatted currency string
 */
export function formatUSD(value) {
  if (value === null || value === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Get a single row from query results
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Single row or null
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export default pool;
