import mysql from 'mysql2/promise';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

/**
 * Database Connection Configuration
 *
 * Uses shared configuration pattern with support for:
 * - Cloud SQL via proxy (port 3308) - default for production
 * - Local MySQL (port 3306) - for development
 *
 * Environment Variables:
 *   DB_HOST - Database host (default: 127.0.0.1)
 *   DB_PORT - Database port (default: 3308 for Cloud SQL proxy, use 3306 for local)
 *   DB_USER - Database user (default: root)
 *   DB_PASSWORD - Database password (default: safenet123 for cloud, empty for local)
 *   DB_NAME - Database name (default: safenet)
 *
 * For Local MySQL:
 *   Set DB_PORT=3306 and DB_PASSWORD= in .env
 *
 * For Cloud SQL:
 *   Start proxy: ./cloud-sql-proxy lifeosai-481608:asia-south1:safenet-mysql --port=3308
 *   Use default settings (port 3308)
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3308,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'safenet123',
  database: process.env.DB_NAME || 'safenet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Test the database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    const config = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 3308,
      database: process.env.DB_NAME || 'safenet'
    };
    console.log(`Database connected successfully to ${config.host}:${config.port}/${config.database}`);
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
}

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
