# Setup, API Keys, and Troubleshooting

## Local setup
### 1) Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Fill in `server/.env` with:
```
PORT=4000
CORS_ORIGIN=http://localhost:5173
REMOVE_BG_API_KEY=your_remove_bg_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_FOLDER=uplane
DB_PATH=./data.json
```

### 2) Frontend
```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Update `web/.env` if the backend is not on port 4000:
```
VITE_API_BASE_URL=http://localhost:4000
```

**⚠️ Important: Wake up the backend first (if using deployed backend)**

If you're using the deployed backend on Render (not running locally), you must wake it up before starting the frontend:

1. **Open the backend health endpoint in your browser:**
   ```
   https://uplane.onrender.com/api/health
   ```

2. **Wait for the response:**
   - You should see: `{"ok":true}`
   - The first request may take **30-60 seconds** (cold start)
   - This is normal for Render's free tier, which spins down after inactivity

3. **Once you see the response, start the frontend:**
   ```bash
   npm run dev
   ```

**Why?** Render's free tier services automatically spin down after 15 minutes of inactivity. The first request after spin-down triggers a "cold start" which can take 30-60 seconds. By waking up the backend first, you ensure it's ready when the frontend makes API calls.

**Note:** If you're running the backend locally (`npm run dev` in the `server` directory), you can skip this step.

Open `http://localhost:5173`.

## How to get API keys
### remove.bg
1. Create an account at https://www.remove.bg/api
2. Create a new API key from the dashboard.
3. Set the key in `REMOVE_BG_API_KEY`.

### Cloudinary
1. Create an account at https://cloudinary.com/
2. From the dashboard, copy:
   - Cloud name
   - API key
   - API secret
3. Set them in `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

## Deployment checklist
- Backend deployed with all required environment variables.
- Frontend `VITE_API_BASE_URL` points to the backend URL.
- Confirm `CORS_ORIGIN` matches the frontend URL.

## Troubleshooting
### Upload fails with "Background removal failed"
- Verify `REMOVE_BG_API_KEY` is valid and has remaining credits.
- Check remove.bg account billing or free tier limits.

### Upload succeeds but no image appears
- Check backend logs for Cloudinary upload errors.
- Verify Cloudinary API keys and cloud name.

### Delete fails
- Ensure the image ID exists in `server/data.json`.
- Verify the Cloudinary public IDs are valid.

### CORS errors in the browser
- Make sure `CORS_ORIGIN` matches the frontend URL (including scheme and port).
- Restart the backend after changing environment variables.

### Backend appears slow or times out on first request
- If using Render's free tier, the service spins down after inactivity.
- **Solution:** Wake up the backend by visiting https://uplane.onrender.com/api/health before using the frontend.
- The first request after spin-down takes 30-60 seconds (cold start).
- Subsequent requests will be fast until the service spins down again (after 15 minutes of inactivity).

### `npm install` fails due to permissions
- Use a project-local cache to bypass permission issues:
  ```bash
  npm install --cache ./../.npm-cache
  ```

### `npm install` fails due to native modules
- This project avoids native modules by default.
- If you add native dependencies later, ensure your Node version and build tools match.

## API quick reference
- `POST /api/images` (multipart form-data with `image`)
- `GET /api/images/:id`
- `DELETE /api/images/:id`
- `GET /api/health`
