import { neon } from '@neondatabase/serverless';

// Get database URL from environment
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
};

// Create a SQL query function
export const sql = neon(getDatabaseUrl());

// Initialize database tables
export async function initDatabase() {
  try {
    // Create referrers table
    await sql`
      CREATE TABLE IF NOT EXISTS referrers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        referral_code VARCHAR(100) UNIQUE NOT NULL,
        referral_link TEXT NOT NULL,
        total_referrals INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create referrals table
    await sql`
      CREATE TABLE IF NOT EXISTS referrals (
        id VARCHAR(100) PRIMARY KEY,
        referrer_email VARCHAR(255) NOT NULL,
        referrer_name VARCHAR(255) NOT NULL,
        referred_email VARCHAR(255) NOT NULL,
        referred_name VARCHAR(255) NOT NULL,
        referred_phone VARCHAR(50),
        referred_child_grade VARCHAR(20),
        signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        purchase_date TIMESTAMP,
        reward_eligible_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        reward_issued_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}
