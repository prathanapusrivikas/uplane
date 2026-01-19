# Quick Start Guide

Get the project up and running quickly.

## Prerequisites

- Node.js 18+ (20.19+ or 22.12+ recommended for frontend)
- API keys: remove.bg and Cloudinary (see [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md) for how to get them)

## Quick Start Steps

### Option 1: Using Deployed Backend (Recommended for Testing)

If you want to test the frontend with the deployed backend:

1. **Wake up the backend service first** ⚠️ **IMPORTANT**
   - Open https://uplane.onrender.com/api/health in your browser
   - Wait for it to respond with `{"ok":true}` 
   - This may take 30-60 seconds on the first request (cold start)
   - **Why?** Render's free tier spins down after inactivity. You need to wake it up first.

2. **Set up frontend:**
   ```bash
   cd web
   cp .env.example .env
   # Edit .env and set:
   # VITE_API_BASE_URL=https://uplane.onrender.com
   npm install
   npm run dev
   ```

3. **Open the app:**
   - Frontend: http://localhost:5173
   - Backend is already running at https://uplane.onrender.com

### Option 2: Local Development (Full Stack)

Run both frontend and backend locally:

1. **Backend setup:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your API keys (see SETUP_TROUBLESHOOTING.md)
   npm install
   npm run dev
   ```
   Backend runs on http://localhost:4000

2. **Frontend setup (in a new terminal):**
   ```bash
   cd web
   cp .env.example .env
   # Edit .env and set:
   # VITE_API_BASE_URL=http://localhost:4000
   npm install
   npm run dev
   ```

3. **Open the app:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

## Why Wake Up the Backend?

Render's free tier services automatically spin down after **15 minutes of inactivity** to save resources. When you make the first request after spin-down:

- ⏱️ **Cold start delay:** 30-60 seconds
- ✅ **Subsequent requests:** Fast (until next spin-down)

**Solution:** Always visit the health endpoint first to wake up the service before using the frontend.

## Testing the Backend

You can test if the backend is awake by visiting:
- Health check: https://uplane.onrender.com/api/health
- Should return: `{"ok":true}`

If it's spinning up, you'll see a loading delay. Once it responds, the backend is ready!

## Troubleshooting

### Frontend can't connect to backend
- ✅ Make sure you woke up the backend first (visit the health endpoint)
- ✅ Check that `VITE_API_BASE_URL` in `web/.env` is correct
- ✅ Verify the backend is responding at the health endpoint

### Backend takes too long to respond
- This is normal for the first request after spin-down (30-60 seconds)
- Wait for the health endpoint to respond before using the frontend
- Subsequent requests will be fast

### CORS errors
- Make sure `CORS_ORIGIN` in Render environment variables matches your frontend URL
- For local development: `http://localhost:5173`
- For deployed frontend: Your Netlify/Vercel URL

See [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md) for more troubleshooting tips.
