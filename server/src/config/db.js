const { Pool } = require('pg');
const logger = require('../utils/logger');

// PostgreSQL configuration with environment variable fallbacks
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'linc_user',
  password: process.env.DB_PASSWORD || 'linc_secure_pass',
  database: process.env.DB_NAME || 'linc_db',
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client: ' + err.message);
});

/**
 * Check database connection status
 * @returns {Promise<{connected: boolean, message: string, serverTime?: string}>}
 */
async function checkDbConnection() {
  try {
    const result = await pool.query('SELECT NOW() AS current_time, current_database() AS db_name, version() AS version');
    return {
      connected: true,
      message: 'PostgreSQL database connected successfully',
      host: process.env.DB_HOST || 'postgres',
      database: result.rows[0].db_name,
      serverTime: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1],
    };
  } catch (error) {
    logger.warn('PostgreSQL connection check failed: ' + error.message);
    return {
      connected: false,
      message: `Database unreachable at ${process.env.DB_HOST || 'postgres'}: ${error.message}`,
      host: process.env.DB_HOST || 'postgres',
    };
  }
}

module.exports = {
  pool,
  checkDbConnection,
};
