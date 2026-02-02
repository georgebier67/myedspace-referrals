# MyEdSpace Referral System

A referral tracking system for MyEdSpace that allows customers to generate referral links and earn rewards when their friends sign up.

## Features

- **Referrer Registration** (`/register-referral`): Existing customers can register to get a unique referral link
- **Friend Signup** (`/refer?ref=[code]`): Friends can sign up through referral links
- **Admin Dashboard** (`/admin/referrals`): Track referrals, manage statuses, and process rewards
- **Slack Notifications**: Automatic notifications when referrals qualify for rewards
- **HubSpot Integration**: Form submissions sync with HubSpot CRM

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with pixelated/retro gaming aesthetic
- **Storage**: Local JSON files (development) - requires database for production
- **Integrations**: HubSpot Forms API, Slack Webhooks

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

| Variable | Description |
|----------|-------------|
| `HUBSPOT_PORTAL_ID` | Your HubSpot Portal ID |
| `HUBSPOT_FORM_GUID` | HubSpot Form GUID for submissions |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |
| `ADMIN_PASSWORD` | Password for admin dashboard |
| `BOOKING_URL` | URL to redirect friends after signup |
| `NEXT_PUBLIC_BASE_URL` | Base URL for referral links |

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
- View registered referrers and their referral counts

## Referral Status Flow

1. **Pending**: Friend signed up through referral link
2. **Purchased**: Friend made a purchase (manually marked by admin)
3. **Qualified**: 30 days passed since purchase (Slack notification sent)
4. **Rewarded**: $150 Amazon gift card sent to referrer
5. **Disqualified**: Refund or cancellation occurred

## Production Deployment Note

The current implementation uses local JSON files for storage, which works for development but **will not persist data on Vercel** (read-only filesystem).

For production, you'll need to add a database:
- **Option 1**: Upstash Redis (recommended for simplicity)
- **Option 2**: Supabase/Postgres (for more complex queries)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Register new referrer |
| `/api/validate-code` | GET | Validate referral code |
| `/api/refer` | POST | Process friend signup |
| `/api/admin/auth` | POST/GET | Admin authentication |
| `/api/admin/referrals` | GET | Get all referrals (admin) |
| `/api/admin/update-status` | POST | Update referral status (admin) |
