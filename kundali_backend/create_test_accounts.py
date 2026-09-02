"""
create_test_accounts.py
-----------------------
Creates 4 Supabase accounts + seeds profiles + sets roles.
Run ONCE: python create_test_accounts.py
"""
import httpx, psycopg2, json
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone

DB_URL      = 'postgresql://postgres:GEb7Q74d9utGjSRu@db.hpmrjdnmzluxhdyidizq.supabase.co:5432/postgres'
SUPA_URL    = 'https://hpmrjdnmzluxhdyidizq.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbXJqZG5temx1eGhkeWlkaXpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk3OTUyMSwiZXhwIjoyMTAzNTU1NTIxfQ.0APHgHGSc9tWsBFXH2UEUObZuT8J7NQDVqfcOkOmmcQ'

ACCOUNTS = [
    {
        'email': 'admin@kundali.app',
        'password': 'Admin@Suyash2024!',
        'display_name': 'Suyash Shevade (Admin)',
        'role': 'super_admin',
        'profiles': [
            dict(name='Suyash Dilip Shevade', gender='male', birth_place='Pune, Maharashtra',
                 year=2000, month=1, day=1, hour=6, minute=30,
                 lat=18.5204, lon=73.8567, timezone_str='Asia/Kolkata',
                 moon_sign='Vrishabha', nakshatra='Rohini', lagna='Makara',
                 is_manglik=False, active_dasha='Rahu', tag='self'),
        ],
    },
    {
        'email': 'testuser1@kundali.app',
        'password': 'TestUser1@2024!',
        'display_name': 'Test User 1 (Male)',
        'role': 'user',
        'profiles': [
            dict(name='Arjun Sharma', gender='male', birth_place='Jaipur, Rajasthan',
                 year=1995, month=6, day=15, hour=10, minute=45,
                 lat=26.9124, lon=75.7873, timezone_str='Asia/Kolkata',
                 moon_sign='Mithuna', nakshatra='Ardra', lagna='Simha',
                 is_manglik=True, active_dasha='Saturn', tag='self'),
        ],
    },
    {
        'email': 'testuser2@kundali.app',
        'password': 'TestUser2@2024!',
        'display_name': 'Test User 2 (Female)',
        'role': 'user',
        'profiles': [
            dict(name='Priya Iyer', gender='female', birth_place='Chennai, Tamil Nadu',
                 year=1997, month=3, day=22, hour=14, minute=15,
                 lat=13.0827, lon=80.2707, timezone_str='Asia/Kolkata',
                 moon_sign='Karka', nakshatra='Pushya', lagna='Tula',
                 is_manglik=False, active_dasha='Jupiter', tag='self'),
        ],
    },
    {
        'email': 'testuser3@kundali.app',
        'password': 'TestUser3@2024!',
        'display_name': 'Test User 3 (Family)',
        'role': 'user',
        'profiles': [
            dict(name='Rahul Verma', gender='male', birth_place='Mumbai, Maharashtra',
                 year=1990, month=11, day=5, hour=8, minute=0,
                 lat=19.0760, lon=72.8777, timezone_str='Asia/Kolkata',
                 moon_sign='Dhanu', nakshatra='Purvashadha', lagna='Kanya',
                 is_manglik=False, active_dasha='Mercury', tag='family'),
            dict(name='Ananya Verma', gender='female', birth_place='Nagpur, Maharashtra',
                 year=1993, month=7, day=12, hour=18, minute=30,
                 lat=21.1458, lon=79.0882, timezone_str='Asia/Kolkata',
                 moon_sign='Meena', nakshatra='Uttarabhadra', lagna='Vrishabha',
                 is_manglik=False, active_dasha='Venus', tag='family'),
        ],
    },
]

HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
}

def create_supabase_user(email, password):
    """Create user via Supabase Admin API. Returns user_id or None if already exists."""
    # First check if user exists
    resp = httpx.get(f'{SUPA_URL}/auth/v1/admin/users', headers=HEADERS, params={'email': email}, timeout=20)
    if resp.status_code == 200:
        data = resp.json()
        users = data.get('users', [])
        for u in users:
            if u.get('email') == email:
                print(f'  User already exists: {email} -> {u["id"]}')
                return u['id']

    # Create new user
    resp = httpx.post(
        f'{SUPA_URL}/auth/v1/admin/users',
        headers=HEADERS,
        json={
            'email': email,
            'password': password,
            'email_confirm': True,  # Skip email verification
            'user_metadata': {'display_name': email.split('@')[0]},
        },
        timeout=20,
    )
    if resp.status_code in (200, 201):
        user_id = resp.json()['id']
        print(f'  Created: {email} -> {user_id}')
        return user_id
    else:
        print(f'  ERROR creating {email}: {resp.status_code} {resp.text[:200]}')
        return None

def main():
    pg = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
    cur = pg.cursor()

    print('=== Creating Test Accounts ===\n')
    results = []

    for acc in ACCOUNTS:
        print(f"[{acc['role'].upper()}] {acc['email']}")
        user_id = create_supabase_user(acc['email'], acc['password'])
        if not user_id:
            print(f'  SKIPPED (could not create Supabase user)\n')
            continue

        # Upsert role in user_roles
        now = datetime.now(timezone.utc).isoformat()
        cur.execute("""
            INSERT INTO user_roles (user_id, email, role, display_name, updated_at, updated_by)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                email=EXCLUDED.email, role=EXCLUDED.role,
                display_name=EXCLUDED.display_name, updated_at=EXCLUDED.updated_at
        """, (user_id, acc['email'], acc['role'], acc['display_name'], now, 'create_test_accounts'))

        # Insert profiles (skip if this user already has profiles)
        cur.execute('SELECT COUNT(*) as cnt FROM profiles WHERE user_id = %s', (user_id,))
        existing = cur.fetchone()['cnt']
        if existing == 0:
            for p in acc['profiles']:
                cur.execute("""
                    INSERT INTO profiles (user_id, name, gender, birth_place,
                        year, month, day, hour, minute, lat, lon, timezone_str,
                        moon_sign, nakshatra, lagna, is_manglik, active_dasha, tag)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (user_id, p['name'], p['gender'], p['birth_place'],
                      p['year'], p['month'], p['day'], p['hour'], p['minute'],
                      p['lat'], p['lon'], p['timezone_str'],
                      p['moon_sign'], p['nakshatra'], p['lagna'],
                      p['is_manglik'], p['active_dasha'], p['tag']))
            n = len(acc['profiles'])
            print(f'  Inserted {n} profile(s)')
        else:
            print(f'  Already has {existing} profile(s) — skipping profile insert')

        results.append({'user_id': user_id, 'email': acc['email'], 'role': acc['role']})
        print()

    pg.commit()

    print('=== SUMMARY ===')
    print(f'{"Email":<35} {"Role":<15} {"User ID"}')
    print('-' * 80)
    for r in results:
        email_v = r['email']
        role_v  = r['role']
        uid_v   = r['user_id']
        print(f'{email_v:<35} {role_v:<15} {uid_v}')

    print('\nAdmin panel: http://localhost:5173/admin')
    print('Login credentials saved above.')

    # Print ADMIN_USER_ID to update .env
    admin_result = next((r for r in results if r['role'] == 'super_admin'), None)
    if admin_result:
        admin_uid = admin_result['user_id']
        print(f'\n>>> UPDATE your .env: set ADMIN_USER_ID={admin_uid}')

    pg.close()

if __name__ == '__main__':
    main()
