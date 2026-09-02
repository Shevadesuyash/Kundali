import psycopg2, sqlite3, json
from psycopg2.extras import RealDictCursor

DB_URL = 'postgresql://postgres:GEb7Q74d9utGjSRu@db.hpmrjdnmzluxhdyidizq.supabase.co:5432/postgres'
pg = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
cur = pg.cursor()

# Create tables
cur.execute("""
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_place TEXT,
  year INT NOT NULL, month INT NOT NULL, day INT NOT NULL,
  hour INT NOT NULL, minute INT NOT NULL,
  lat FLOAT, lon FLOAT, timezone_str TEXT,
  moon_sign TEXT, nakshatra TEXT, lagna TEXT,
  is_manglik BOOLEAN, active_dasha TEXT, tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)""")

cur.execute("""
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id SERIAL PRIMARY KEY,
  ip_address TEXT UNIQUE NOT NULL,
  user_id TEXT,
  last_query_timestamp TIMESTAMPTZ DEFAULT NOW(),
  query_count INT DEFAULT 1
)""")

cur.execute("""
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id TEXT PRIMARY KEY,
  credits INT DEFAULT 0,
  unlimited_until TIMESTAMPTZ,
  tier TEXT DEFAULT 'free',
  updated_at TIMESTAMPTZ DEFAULT NOW()
)""")

cur.execute("""
CREATE TABLE IF NOT EXISTS location_cache (
  query TEXT PRIMARY KEY,
  results_json TEXT NOT NULL,
  source TEXT DEFAULT 'nominatim',
  created_at TIMESTAMPTZ DEFAULT NOW()
)""")

cur.execute("""
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT PRIMARY KEY,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  display_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
)""")

pg.commit()
print('SUCCESS: All 5 tables created in Supabase Postgres.')

# Count existing
cur.execute('SELECT COUNT(*) as cnt FROM profiles')
row = cur.fetchone()
existing = row['cnt']
print(f'Existing profiles in Supabase: {existing}')

# Migrate from SQLite if Supabase has 0 profiles
if existing == 0:
    print('Migrating profiles from SQLite...')
    sl = sqlite3.connect('profiles.db')
    sl.row_factory = sqlite3.Row
    sqlite_profiles = sl.execute(
        'SELECT user_id, name, gender, birth_place, year, month, day, hour, minute, lat, lon, timezone_str, moon_sign, nakshatra, lagna, is_manglik, active_dasha, tag, created_at FROM profiles ORDER BY id'
    ).fetchall()
    sl.close()
    
    count = 0
    for row in sqlite_profiles:
        cur.execute("""
            INSERT INTO profiles (user_id, name, gender, birth_place, year, month, day, hour, minute, lat, lon, timezone_str, moon_sign, nakshatra, lagna, is_manglik, active_dasha, tag, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (row['user_id'], row['name'], row['gender'], row['birth_place'],
              row['year'], row['month'], row['day'], row['hour'], row['minute'],
              row['lat'], row['lon'], row['timezone_str'],
              row['moon_sign'], row['nakshatra'], row['lagna'],
              bool(row['is_manglik']) if row['is_manglik'] is not None else None,
              row['active_dasha'], row['tag'], row['created_at']))
        count += 1
    pg.commit()
    print(f'Migrated {count} profiles from SQLite -> Supabase Postgres.')
else:
    print(f'Supabase already has {existing} profiles. Skipping migration.')

# Verify
cur.execute('SELECT id, name, gender, user_id FROM profiles ORDER BY id')
rows = cur.fetchall()
print('Profiles now in Supabase:')
for r in rows:
    print(f"  #{r['id']} {r['name']} ({r['gender']}) user_id={r['user_id']}")

pg.close()
print('Done.')
