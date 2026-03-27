# StylAI — Complete Deployment Guide
## From Zero to Live in Production

---

## What You Are Setting Up

Six services total. ~3 hours first time. ~$10-20/month ongoing.

```
YOUR DOMAIN (Namecheap) → stylai.app
         |
         ▼
RAILWAY (hosts everything)
  ├── Web App  (Next.js)    → stylai.app
  ├── API      (FastAPI)    → api.stylai.app
  ├── PostgreSQL             → internal
  └── Redis                  → internal
         |
CLOUDFLARE R2 (photo storage)
SENTRY        (error alerts)
POSTHOG       (analytics)
```

---

## PHASE 1 — Accounts & Purchases (30 mins)

### 1.1 Buy Your Domain — Namecheap

Cost: ~$12/year | URL: namecheap.com

1. Go to https://www.namecheap.com
2. Search for your domain name. Options:
   - stylai.app  (~$14/yr)
   - getstyled.ai  (~$30/yr)
   - mystylist.app  (~$14/yr)
3. Add to cart → Checkout → Create account
4. Complete purchase
5. Go to: Dashboard → Domain List → Manage
6. Under Nameservers, select Custom DNS
7. Leave this tab open — you will paste Railway NS records here in Phase 2

---

### 1.2 Create GitHub Account (if needed)

URL: github.com/signup | Cost: Free

1. Sign up at github.com/signup
2. Verify your email
3. Go to github.com/new
4. Create a new repository:
   - Name: stylai
   - Visibility: Private
   - DO NOT check "Initialize with README"
5. Copy the HTTPS URL shown: https://github.com/YOURUSERNAME/stylai.git

---

### 1.3 Push Your Code to GitHub

Run these commands in your stylai project folder:

```bash
git remote add origin https://github.com/YOURUSERNAME/stylai.git
git branch -M main
git push -u origin main
```

If prompted for password, use a GitHub Personal Access Token:
- GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
- Generate new token → check "repo" scope → copy and use as password

Verify: github.com/YOURUSERNAME/stylai should show all your files.

---

### 1.4 Create Railway Account

URL: railway.app | Cost: $5/month base + usage (~$10-20 total)

1. Go to https://railway.app
2. Click Login → Login with GitHub → Authorize
3. Go to Settings → Billing → Add payment card
4. You will not be charged until you deploy

---

### 1.5 Create Cloudflare Account

URL: cloudflare.com | Cost: Free for R2 up to 10GB

1. Go to https://cloudflare.com → Sign Up
2. Use your email and create a password
3. You do NOT need to add a website — just the account
4. Skip any website setup prompts

---

### 1.6 Create Sentry Account

URL: sentry.io | Cost: Free up to 5,000 errors/month

1. Go to https://sentry.io/signup
2. Sign up with GitHub
3. Organization name: StylAI
4. Skip onboarding for now — you will set up projects in Phase 3

---

### 1.7 Create PostHog Account

URL: app.posthog.com/signup | Cost: Free up to 1M events/month

1. Go to https://app.posthog.com/signup
2. Sign up with your email
3. Select Cloud (not self-hosted)
4. Organization: StylAI
5. Skip setup wizard — you will get your key in Phase 3

---

## PHASE 2 — Infrastructure Setup (45 mins)

### 2.1 Set Up Cloudflare R2 Storage

This stores the selfie photos users upload.

1. Log into cloudflare.com
2. Click R2 Object Storage in the left sidebar
3. Click Get started → add billing method if prompted
4. Click Create bucket
5. Bucket name: stylai-uploads
6. Location: choose nearest to your users (US East or EU West)
7. Click Create bucket

Now create API credentials:
1. In R2, click Manage R2 API Tokens (top right)
2. Click Create API Token
3. Token name: stylai-api
4. Permissions: Object Read and Write
5. Specify bucket: stylai-uploads
6. Click Create API Token

SAVE THESE — you will not see the secret again:
- Access Key ID       → call this R2_KEY_ID
- Secret Access Key   → call this R2_SECRET
- Endpoint URL        → looks like https://ACCOUNTID.r2.cloudflarestorage.com
                         call this R2_ENDPOINT

---

### 2.2 Set Up Railway Project

1. Go to railway.app → click New Project
2. Select Deploy from GitHub repo
3. Select your stylai repository
4. Railway creates a default service — you will configure it below

Add PostgreSQL:
1. In your project, click + New
2. Select Database → Add PostgreSQL
3. Click the Postgres service → Variables tab
4. Find DATABASE_URL — copy it and save it as PG_URL
5. IMPORTANT: Change the prefix from postgresql:// to postgresql+asyncpg://
   Example: postgresql+asyncpg://stylai:pass@host:5432/railway

Add Redis:
1. Click + New again
2. Select Database → Add Redis
3. Click the Redis service → Variables tab
4. Copy REDIS_URL — save it as REDIS_URL

---

### 2.3 Generate a Secure Secret Key

Run this in your terminal (Mac/Linux):
```bash
openssl rand -hex 32
```

Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | % { [byte](Get-Random -Max 256) }))
```

Copy the output — save it as MY_SECRET_KEY.
Never commit this to GitHub.

---

### 2.4 Deploy the FastAPI Backend on Railway

1. In your Railway project, click + New → GitHub Repo → stylai
2. A new service appears — click it
3. Click Settings tab

Set these:
- Service Name:  stylai-api
- Root Directory:  apps/api
- Build Command:  pip install -r requirements.txt
- Start Command:  alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT

4. Click Variables tab → click Raw Editor
5. Paste ALL of the following, filling in your values:

```
ENVIRONMENT=production
DATABASE_URL=postgresql+asyncpg://YOUR_PG_URL_HERE
REDIS_URL=redis://YOUR_REDIS_URL_HERE
SECRET_KEY=YOUR_64_CHAR_SECRET_HERE
STORAGE_BACKEND=s3
AWS_ACCESS_KEY_ID=YOUR_R2_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_R2_SECRET
AWS_S3_BUCKET=stylai-uploads
AWS_S3_REGION=auto
AWS_S3_ENDPOINT_URL=YOUR_R2_ENDPOINT
ALLOWED_ORIGINS=https://yourdomain.com
LLM_ENABLED=false
MAX_IMAGE_SIZE_MB=10
MEDIAPIPE_MODEL_COMPLEXITY=1
```

6. Click Settings → Networking → Generate Domain
7. Note the URL: it looks like stylai-api.up.railway.app — save it as API_URL
8. Railway will now build and deploy. Watch the deploy logs.
9. When green/deployed, open API_URL/health in browser
   You should see: {"status": "ok", "version": "0.1.0"}

---

### 2.5 Deploy the Next.js Frontend on Railway

1. Click + New → GitHub Repo → stylai (again)
2. Click the new service → Settings

Set these:
- Service Name:  stylai-web
- Root Directory:  apps/web
- Build Command:  npm install && npm run build
- Start Command:  npm start

3. Click Variables tab → Raw Editor, paste:

```
NEXT_PUBLIC_API_URL=https://YOUR_API_URL_HERE
NEXT_PUBLIC_APP_ENV=production
```

Replace YOUR_API_URL_HERE with the URL from step 2.4 (e.g. https://stylai-api.up.railway.app)

4. Settings → Networking → Generate Domain
5. Note the web URL — you can test at this URL before connecting your domain

---

### 2.6 Connect Your Custom Domain

1. In Railway, click on your Web service
2. Settings → Networking → Custom Domain → Add Custom Domain
3. Enter: yourdomain.com (e.g. stylai.app)
4. Railway shows you DNS records — they look like:
   - Type: CNAME
   - Name: @ (or www)
   - Value: something.railway.app
5. Go to Namecheap → Domain List → Manage → Advanced DNS
6. Delete any existing A records or CNAME records for @ and www
7. Add new records:
   - Type: CNAME | Host: @ | Value: (from Railway)
   - Type: CNAME | Host: www | Value: (from Railway)
8. Save
9. Back in Railway, click the domain — Railway will provision SSL automatically
10. DNS propagation: 10 minutes to 48 hours (usually under 30 mins)
11. Check status at: https://dnschecker.org/#A/yourdomain.com

Also update ALLOWED_ORIGINS in the API service Variables:
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

---

### 2.7 Run Database Migrations

After API deploys successfully:

1. In Railway, click on your API service
2. Click the three dots menu (top right) → Connect
3. Or click Deployments → three dots → Open in Shell

In the Railway shell, run:
```bash
alembic upgrade head
```

Expected output ends with:
```
INFO [alembic] Running upgrade -> 001_initial, Initial schema
```

If you see "Target database is not up to date" — that is fine, run it again.
If you see connection errors — double-check your DATABASE_URL variable.

---

## PHASE 3 — Monitoring Setup (30 mins)

### 3.1 Set Up Sentry for API Error Monitoring

1. Log into sentry.io
2. Click Create Project
3. Platform: Python → FastAPI
4. Project name: stylai-api
5. Click Create Project
6. Copy the DSN — looks like: https://abc123@o456.ingest.sentry.io/789

Add to your API service in Railway Variables:
```
SENTRY_DSN=https://abc123@o456.ingest.sentry.io/789
```

Add sentry to your requirements. In your local code:
Edit apps/api/requirements.txt and add at the bottom:
```
sentry-sdk[fastapi]==1.45.0
```

Edit apps/api/app/main.py — add near the very top (after imports):
```python
import os
import sentry_sdk
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN", ""),
    traces_sample_rate=0.1,
    environment=os.getenv("ENVIRONMENT", "development"),
)
```

Commit and push:
```bash
git add -A
git commit -m "feat: add Sentry error monitoring"
git push origin main
```

Railway redeploys automatically.

---

### 3.2 Set Up Sentry for Frontend Error Monitoring

1. In Sentry, click Create Project again
2. Platform: JavaScript → Next.js
3. Project name: stylai-web
4. Copy the DSN

Add to Railway Web service Variables:
```
NEXT_PUBLIC_SENTRY_DSN=https://xyz@o456.ingest.sentry.io/999
```

Install Sentry in local code:
```bash
cd apps/web
npm install @sentry/nextjs
```

Create apps/web/sentry.client.config.ts:
```typescript
import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
});
```

Commit and push.

---

### 3.3 Set Up PostHog Analytics

1. Log into app.posthog.com
2. Go to Project Settings → Project API Key
3. Copy the key — looks like: phc_abc123xyz

Add to Railway Web service Variables:
```
NEXT_PUBLIC_POSTHOG_KEY=phc_abc123xyz
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

Install in local code:
```bash
cd apps/web
npm install posthog-js
```

Add to apps/web/src/components/layout/Providers.tsx at the top:
```typescript
import posthog from 'posthog-js'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
  })
}
```

Commit and push.

---

## PHASE 4 — Verification Checklist

Run through this after everything is deployed:

INFRASTRUCTURE
[ ] github.com/YOURUSERNAME/stylai shows all files
[ ] Railway shows 4 services: postgres, redis, stylai-api, stylai-web
[ ] All 4 services show green / deployed status
[ ] API health check returns 200: https://yourapiurl/health
[ ] Database migration ran successfully

DOMAIN & SSL
[ ] yourdomain.com loads the landing page
[ ] HTTPS padlock shows in browser (SSL working)
[ ] www.yourdomain.com also works

FULL USER FLOW
[ ] Landing page loads correctly
[ ] Register with a new email works
[ ] Login works
[ ] Selfie upload accepts a photo
[ ] Analysis runs and returns results
[ ] Results page shows color palette, hairstyles, outfits
[ ] Share link copies and opens without login
[ ] Profile page shows history
[ ] Sign out works, redirect to landing page

MONITORING
[ ] Sentry dashboard shows your projects
[ ] PostHog shows page views after you visit the site

---

## PHASE 5 — Ongoing Workflow

Every time you make changes:
```bash
# 1. Make your changes locally
# 2. Test locally: docker compose up
# 3. Commit and push:
git add -A
git commit -m "description of change"
git push origin main
# 4. Railway auto-redeploys in ~2-3 minutes
# 5. Watch Railway deploy logs to confirm success
```

---

## Troubleshooting Reference

PROBLEM: API service fails to start
FIX: Railway → API service → Deployments → View Logs
COMMON CAUSE: Missing environment variable. Check all variables are set.

PROBLEM: "Connection refused" to database  
FIX: DATABASE_URL must start with postgresql+asyncpg:// not postgresql://
     Copy the URL from Postgres service, manually change the prefix.

PROBLEM: Photos not uploading
FIX: Check R2 credentials in Railway Variables.
     Bucket name must match exactly. No spaces.
     Check Sentry for the specific error.

PROBLEM: CORS error in browser console
FIX: Add your domain to ALLOWED_ORIGINS in API Variables.
     Format: https://yourdomain.com,https://www.yourdomain.com
     Redeploy after changing.

PROBLEM: Domain not loading
FIX: Check dnschecker.org for your domain.
     DNS can take up to 48 hours.
     Make sure CNAME points to Railway domain.

PROBLEM: alembic upgrade fails
FIX: DATABASE_URL driver prefix must be postgresql+asyncpg://
     Run: alembic current  (to check what state DB is in)

PROBLEM: Site loads but API calls fail (404 on /api routes)
FIX: NEXT_PUBLIC_API_URL in web Variables must point to deployed API URL.
     Make sure it does not have a trailing slash.

---

## Monthly Cost Breakdown

| Service     | Plan       | Cost/month |
|-------------|------------|------------|
| Namecheap   | .app/year  | ~$1        |
| Railway     | Hobby+use  | $10-20     |
| Cloudflare  | R2 free    | $0         |
| Sentry      | Free tier  | $0         |
| PostHog     | Free tier  | $0         |
| TOTAL       |            | ~$11-21    |

When you scale past free tiers:
- R2: $0.015/GB after 10GB
- Sentry: $26/month for 50,000 errors
- PostHog: $0 until 1 million events/month

---

## Support Resources

Railway docs:     https://docs.railway.app
Cloudflare R2:    https://developers.cloudflare.com/r2
Sentry FastAPI:   https://docs.sentry.io/platforms/python/integrations/fastapi
Sentry Next.js:   https://docs.sentry.io/platforms/javascript/guides/nextjs
PostHog Next.js:  https://posthog.com/docs/libraries/next-js
Namecheap DNS:    https://www.namecheap.com/support/knowledgebase/article.aspx/9776
Alembic:          https://alembic.sqlalchemy.org/en/latest/tutorial.html
