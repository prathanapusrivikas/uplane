# Deploying Backend to Render

This guide walks you through deploying the backend service to Render step-by-step.

## Prerequisites

Before deploying, make sure you have:
- ✅ A Render account (sign up at https://render.com)
- ✅ Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- ✅ All your API keys ready:
  - remove.bg API key
  - Cloudinary credentials (cloud name, API key, API secret)

## Step-by-Step Deployment

### Step 1: Create a Render Account

1. Go to https://render.com
2. Click **Get Started for Free**
3. Sign up with GitHub, GitLab, or email
4. Verify your email if required

### Step 2: Create a New Web Service

1. In the Render dashboard, click **New +** → **Web Service**
2. Connect your Git repository:
   - If this is your first time, click **Connect account** and authorize Render
   - Select your repository from the list
   - Click **Connect**

### Step 3: Configure the Service

Fill in the service configuration:

#### Basic Settings

- **Name**: Choose a name (e.g., `uplane-api` or `image-transformation-service`)
- **Region**: Select the closest region to your users
- **Branch**: Select the branch to deploy (usually `main` or `master`)
- **Root Directory**: **Important!** Set this to `server`
  - This tells Render where your backend code is located

#### Build & Deploy Settings

- **Runtime**: Select **Node**
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Start Command**: 
  ```
  npm start
  ```

#### Environment Variables

Click **Add Environment Variable** and add each of these:

| Variable Name | Description | Example/Notes |
|---------------|-------------|---------------|
| `PORT` | Server port (optional) | Render sets this automatically, but you can leave it or set to `10000` |
| `CORS_ORIGIN` | Frontend URL | Your frontend URL (e.g., `https://your-site.netlify.app` or `http://localhost:5173` for testing) |
| `REMOVE_BG_API_KEY` | remove.bg API key | Get from https://www.remove.bg/api |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From your Cloudinary dashboard |
| `CLOUDINARY_FOLDER` | Cloudinary folder (optional) | Defaults to `uplane` if not set |
| `DB_PATH` | Database file path (optional) | Defaults to `./data.json` if not set |

**Important Notes:**
- For `CORS_ORIGIN`, use your frontend URL. If deploying to Netlify, it will be something like `https://your-site.netlify.app`
- You can update `CORS_ORIGIN` later if needed
- For local testing, you can temporarily set it to `http://localhost:5173`

#### Advanced Settings (Optional)

- **Auto-Deploy**: Leave enabled to auto-deploy on git push
- **Health Check Path**: Set to `/api/health` (optional, but recommended)
- **Plan**: Choose **Free** for testing, or upgrade for production

### Step 4: Deploy

1. Review all your settings
2. Click **Create Web Service**
3. Render will start building and deploying your service
4. You'll see the build logs in real-time
5. Wait for the deployment to complete (usually 2-5 minutes)

### Step 5: Get Your Service URL

Once deployment is complete:

1. Your service URL will be displayed at the top (e.g., `https://uplane-api.onrender.com`)
2. **Copy this URL** - you'll need it for:
   - Setting `VITE_API_BASE_URL` in your frontend
   - Setting `CORS_ORIGIN` in your backend (if you haven't already)
   - The `RENDER_SERVICE_ID` for the deploy script

### Step 6: Get Your Service ID

To get the `RENDER_SERVICE_ID` for the deploy script:

1. Look at the URL in your browser: `https://dashboard.render.com/web/your-service-id-here`
   - The Service ID is the part after `/web/`
2. Or go to **Settings** → **Info** → Find **Service ID**

### Step 7: Test Your Deployment

1. Visit your service URL + `/api/health`:
   ```
   https://your-service.onrender.com/api/health
   ```
   You should see: `{"ok":true}`

2. If the health check works, your backend is deployed successfully! 🎉

## Updating Environment Variables

To update environment variables after deployment:

1. Go to your service in Render dashboard
2. Click **Environment** in the left sidebar
3. Click **Add Environment Variable** or edit existing ones
4. Click **Save Changes**
5. Render will automatically redeploy with the new variables

## Updating CORS_ORIGIN

After deploying your frontend, update `CORS_ORIGIN`:

1. Go to your Render service → **Environment**
2. Update `CORS_ORIGIN` to your frontend URL (e.g., `https://your-site.netlify.app`)
3. Save changes (this will trigger a redeploy)

## Troubleshooting

### Build Fails

**Error: "Build command failed"**
- Check that **Root Directory** is set to `server`
- Verify your `package.json` has the correct build script
- Check build logs for specific errors

**Error: "TypeScript compilation failed"**
- Make sure all TypeScript files are valid
- Check `tsconfig.json` is correct
- Review build logs for specific TypeScript errors

### Service Won't Start

**Error: "Missing required environment variable"**
- Go to **Environment** tab
- Verify all required variables are set:
  - `REMOVE_BG_API_KEY`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

**Error: "Cannot find module"**
- Check that build completed successfully
- Verify `dist/index.js` exists after build
- Make sure all dependencies are in `dependencies` (not `devDependencies`)

### Service Crashes After Starting

**Check the logs:**
1. Go to **Logs** tab in Render dashboard
2. Look for error messages
3. Common issues:
   - Invalid API keys
   - Network connectivity issues
   - Port conflicts (shouldn't happen, Render handles this)

### Health Check Fails

**Test manually:**
```bash
curl https://your-service.onrender.com/api/health
```

If this fails:
- Check that the service is running (green status)
- Verify the route is correct (`/api/health`)
- Check logs for errors

### CORS Errors from Frontend

**Symptoms:** Frontend can't connect to backend, CORS errors in browser console

**Solution:**
1. Make sure `CORS_ORIGIN` matches your frontend URL exactly
2. Include the protocol (`https://`)
3. No trailing slash
4. After updating, wait for redeploy to complete

## Render Free Tier Limitations

The free tier has some limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds (cold start)
- 750 hours/month of runtime (usually enough for development)

**For production:** Consider upgrading to a paid plan for:
- Always-on services (no spin-down)
- Faster response times
- More resources

## Next Steps

After deploying to Render:

1. ✅ Note your service URL
2. ✅ Get your Service ID for the deploy script
3. ✅ Update frontend's `VITE_API_BASE_URL` to point to your Render URL
4. ✅ Deploy frontend (Netlify/Vercel)
5. ✅ Update `CORS_ORIGIN` in Render to match your frontend URL
6. ✅ Test the full flow end-to-end

## Quick Reference

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check** | `/api/health` |
| **Required Env Vars** | `REMOVE_BG_API_KEY`, `CLOUDINARY_*` (3 vars), `CORS_ORIGIN` |

## Getting Help

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Check service logs in Render dashboard for detailed error messages
