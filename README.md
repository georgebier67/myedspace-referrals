# MyEdSpace Referral System

A referral tracking system for MyEdSpace that allows customers to generate referral links and earn rewards when their friends sign up.

## Features

- **Referrer Registration** (`/register-referral`): Existing customers can register to get a unique referral link
- **Friend Signup** (`/refer?ref=[code]`): Friends can sign up through referral links
- **Admin Dashboard** (`/admin/referrals`): Track referrals, manage statuses, export data, and process rewards
- **Slack Notifications**: Automatic notifications when referrals qualify for rewards
- **HubSpot Integration**: Form submissions sync with HubSpot CRM, contact properties updated for workflow automation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with brutalist design aesthetic
- **Database**: Supabase (PostgreSQL)
- **Integrations**: HubSpot Forms API, HubSpot Contacts API, Slack Webhooks

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `HUBSPOT_PORTAL_ID` | Your HubSpot Portal ID | Yes |
| `HUBSPOT_FORM_GUID` | HubSpot Form GUID for submissions | Yes |
| `HUBSPOT_ACCESS_TOKEN` | HubSpot Private App access token (for Contacts API) | No |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | No |
| `ADMIN_PASSWORD` | Password for admin dashboard | Yes |
| `BOOKING_URL` | URL to redirect friends after signup | Yes |
| `NEXT_PUBLIC_BASE_URL` | Base URL for referral links | Yes |

## Database Setup

Create the following tables in your Supabase project:

### referrers
```sql
CREATE TABLE referrers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  referral_code VARCHAR(100) UNIQUE NOT NULL,
  referral_link TEXT NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### referrals
```sql
CREATE TABLE referrals (
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
);
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/register-referral` | Referrer registration form |
| `/refer?ref=[code]` | Friend signup page |
| `/admin/referrals` | Admin dashboard (password protected) |
| `/terms` | Terms & Conditions |

## Admin Dashboard

Access at `/admin/referrals` with the password set in `ADMIN_PASSWORD`.

Features:
- View all referrals with status filters
- Search by referrer or friend name/email
- Manual status updates (Pending -> Purchased -> Qualified -> Rewarded)
- Automatic Slack notifications when marking as "Qualified"
- Export referral data to CSV
- View and manage registered referrers
- Delete referrers (and their associated referrals)

## Referral Status Flow

1. **Pending**: Friend signed up through referral link
2. **Purchased**: Friend made a purchase (manually marked by admin)
3. **Qualified**: 30 days passed since purchase (Slack notification sent, HubSpot workflow triggered)
4. **Rewarded**: $150 Amazon gift card sent to referrer
5. **Disqualified**: Refund or cancellation occurred

## HubSpot Integration

### Forms API
- Referrer registration submissions are sent to HubSpot Forms
- Friend signup data is captured for lead tracking

### Contacts API (Optional)
If `HUBSPOT_ACCESS_TOKEN` is configured, the system will update HubSpot contact properties when referral status changes to "qualified" or "rewarded", enabling automated email workflows.

Required HubSpot contact property:
- `referral_status` (dropdown): Options: `qualified`, `rewarded`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Register new referrer |
| `/api/validate-code` | GET | Validate referral code |
| `/api/refer` | POST | Process friend signup |
| `/api/admin/auth` | POST/GET | Admin authentication |
| `/api/admin/referrals` | GET | Get all referrals (admin) |
| `/api/admin/referrers` | DELETE | Delete a referrer (admin) |
| `/api/admin/update-status` | POST | Update referral status (admin) |
| `/api/admin/export` | GET | Export referral data as CSV (admin) |
