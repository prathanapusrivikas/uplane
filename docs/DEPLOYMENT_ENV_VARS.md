# Deployment Environment Variables Guide

This guide explains where to get all the environment variables needed for the `scripts/deploy.sh` script.

## Required Environment Variables

### 1. `VITE_API_BASE_URL`
**What it is:** The public URL of your deployed backend API.

**Where to get it:**
- After deploying your backend to Render (see steps below), Render will provide a public URL
- Format: `https://your-service-name.onrender.com` or `https://your-custom-domain.com`
- **Example:** `https://uplane-api.onrender.com`

**How to set it:**
- This should be the same URL you use in your frontend's environment variables
- Make sure it includes the protocol (`https://`) and no trailing slash

---

### 2. `NETLIFY_AUTH_TOKEN`
**What it is:** Your Netlify personal access token for API authentication.

**Where to get it:**
1. Go to https://app.netlify.com
2. Click on your profile picture (top right) → **User settings**
3. Go to **Applications** → **New access token**
4. Give it a name (e.g., "Deployment Token")
5. Click **Generate token**
6. **Copy the token immediately** (you won't be able to see it again)

**Security note:** Keep this token secret! Never commit it to git.

---

### 3. `NETLIFY_SITE_ID`
**What it is:** The unique identifier for your Netlify site.

**Where to get it:**
1. Go to https://app.netlify.com
2. Select your site (or create a new one)
3. Go to **Site settings** → **General** → **Site details**
4. Find **Site ID** (it's a long string like `12345678-1234-1234-1234-123456789abc`)
5. Copy the Site ID

**Alternative method:**
- If you haven't created a site yet, you can create one first:
  1. Click **Add new site** → **Import an existing project**
  2. Connect your Git repository
  3. Set **Base directory** to `web`
  4. Set **Build command** to `npm install && npm run build`
  5. Set **Publish directory** to `dist`
  6. Add environment variable `VITE_API_BASE_URL` with your backend URL
  7. After the first deploy, you'll see the Site ID in the settings

---

### 4. `RENDER_API_KEY`
**What it is:** Your Render API key for triggering deployments.

**Where to get it:**
1. Go to https://dashboard.render.com
2. Click on your profile (top right) → **Account Settings**
3. Scroll down to **API Keys** section
4. Click **Create API Key**
5. Give it a name (e.g., "Deployment Key")
6. Click **Create**
7. **Copy the API key immediately** (you won't be able to see it again)

**Security note:** Keep this key secret! Never commit it to git.

---

### 5. `RENDER_SERVICE_ID`
**What it is:** The unique identifier for your Render web service (backend).

**Where to get it:**
1. Go to https://dashboard.render.com
2. Click on your backend service (or create one first - see steps below)
3. The Service ID is in the URL: `https://dashboard.render.com/web/your-service-id-here`
   - It's the part after `/web/`
4. Or go to **Settings** → **Info** → Look for **Service ID**

**If you haven't created the service yet:**
1. Click **New** → **Web Service**
2. Connect your Git repository
3. Set **Root Directory** to `server`
4. Set **Build Command** to `npm install && npm run build`
5. Set **Start Command** to `npm start`
6. Add all environment variables from `server/.env.example`:
   - `PORT` (usually 10000 for Render, or leave default)
   - `CORS_ORIGIN` (your frontend URL)
   - `REMOVE_BG_API_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_FOLDER` (optional, defaults to "uplane")
   - `DB_PATH` (optional, defaults to "./data.json")
7. After creating, note the Service ID from the URL or settings

---

## Setting Up Environment Variables for the Deploy Script

### Option 1: Export in your shell (temporary)
```bash
export VITE_API_BASE_URL="https://your-backend.onrender.com"
export NETLIFY_AUTH_TOKEN="your-netlify-token"
export NETLIFY_SITE_ID="your-site-id"
export RENDER_API_KEY="your-render-api-key"
export RENDER_SERVICE_ID="your-service-id"

# Then run the deploy script
./scripts/deploy.sh
```

### Option 2: Create a `.env.deploy` file (recommended)
Create a file called `.env.deploy` in the project root:

```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-site-id
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-service-id
```

Then source it before running the deploy script:
```bash
source .env.deploy
./scripts/deploy.sh
```

**Important:** Add `.env.deploy` to your `.gitignore` to avoid committing secrets!

### Option 3: Use a secrets manager (for CI/CD)
If you're using GitHub Actions, GitLab CI, or similar:
- Store these as repository secrets
- Reference them in your CI/CD workflow

---

## Deployment Checklist

Before running the deploy script, make sure:

- [ ] Backend is deployed to Render and accessible
- [ ] Frontend site is created on Netlify (or you have the Site ID)
- [ ] You have all 5 environment variables ready
- [ ] `VITE_API_BASE_URL` points to your deployed backend
- [ ] Backend's `CORS_ORIGIN` environment variable matches your frontend URL
- [ ] All API keys (remove.bg, Cloudinary) are set in Render's environment variables

---

## Quick Reference

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `VITE_API_BASE_URL` | Render service URL | `https://api.onrender.com` |
| `NETLIFY_AUTH_TOKEN` | Netlify → User Settings → Applications | `nfp_...` |
| `NETLIFY_SITE_ID` | Netlify → Site Settings → Site details | `12345678-...` |
| `RENDER_API_KEY` | Render → Account Settings → API Keys | `rnd_...` |
| `RENDER_SERVICE_ID` | Render service URL or Settings | `srv_...` |

---

## Troubleshooting

### "Missing required env var" error
- Make sure all 5 variables are exported in your shell
- Check for typos in variable names
- Verify you're sourcing your `.env.deploy` file if using one

### Netlify deploy fails
- Verify `NETLIFY_AUTH_TOKEN` is valid and not expired
- Check that `NETLIFY_SITE_ID` matches your actual site
- Ensure you have permission to deploy to that site

### Render deploy trigger fails
- Verify `RENDER_API_KEY` is valid
- Check that `RENDER_SERVICE_ID` is correct
- Ensure the API key has permission to trigger deploys
