const { createRemoteJWKSet, jwtVerify } = require('jose');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const pino = require('pino');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const logger = pino({ level: 'info' });

// We need the Supabase Project Ref to build the JWKS URL
// Alternatively, pass the full JWKS URL in the environment
const SUPABASE_URL = process.env.SUPABASE_URL;

let JWKS;

if (SUPABASE_URL) {
  // Supabase exposes its public keys at this well-known endpoint
  const jwksUrl = new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
  JWKS = createRemoteJWKSet(jwksUrl);
}

/**
 * Verify Supabase JWT token and check if the user is an admin
 * @param {string} token 
 * @returns {Promise<boolean>}
 */
async function verifyAdmin(token) {
  if (!JWKS) {
    logger.warn('SUPABASE_URL not configured. Authentication disabled/failing.');
    return false;
  }

  try {
    // 1. Verify the signature and decode the JWT
    // The jose library automatically fetches and caches the JWKS
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
      audience: 'authenticated'
    });

    const userId = payload.sub;

    if (!userId) {
      return false;
    }

    // 2. Check if the user exists in our Admin table
    const admin = await prisma.admin.findUnique({
      where: { id: userId }
    });

    return !!admin;
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Log an admin action to the database
 * @param {string} action 
 * @param {string} adminId 
 * @param {object} metadata 
 */
async function logActivity(action, adminId, metadata = {}) {
  try {
    console.log(`[DB_LOG] Logging activity: ${action} by ${adminId}`);
    await prisma.activityLog.create({
      data: {
        action,
        adminId,
        metadata
      }
    });
  } catch (error) {
    console.error(`[DB_LOG_ERR] Failed to log activity: ${error.message}`);
    logger.error(`Failed to log activity: ${error.message}`);
  }
}

module.exports = {
  prisma,
  verifyAdmin,
  logActivity
};
