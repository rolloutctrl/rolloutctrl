#!/bin/sh

set -e

echo "Waiting for PostgreSQL and applying migrations..."

MAX_RETRIES=30
RETRY_COUNT=0

until npx prisma migrate deploy 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Failed to connect to PostgreSQL after $MAX_RETRIES attempts."
    exit 1
  fi
  echo "  Waiting for PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES) - retrying in 2s..."
  sleep 2
done

echo "Database migrations applied!"

SEED_CHECK=$(node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT COUNT(*)::int AS count FROM \"Organization\"', (err, res) => {
  if (err) { console.log(-1); pool.end(); return; }
  console.log(res.rows[0].count);
  pool.end();
});
" 2>/dev/null)

if [ "$SEED_CHECK" = "0" ]; then
  echo "Seeding database..."
  npx prisma db seed 2>&1
  echo "Seed completed!"
elif [ "$SEED_CHECK" -gt 0 ] 2>/dev/null; then
  echo "Database already has data — skipping seed."
else
  echo "Could not determine database state — attempting seed anyway..."
  npx prisma db seed 2>&1 || echo "Seed failed. Continuing..."
fi

echo "Database initialization complete!"
