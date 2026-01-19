# Image Transformation Service

Full-stack app that uploads an image, removes the background via remove.bg, flips it horizontally, hosts it on Cloudinary, and returns a shareable URL. Users can also delete both the original and processed images.

## Architecture
- **Frontend:** React + Vite (TypeScript)
- **Backend:** Express + TypeScript
- **Image processing:** remove.bg API + Sharp (horizontal flip)
- **Hosting:** Cloudinary for original and processed images
- **Storage:** JSON file for image metadata

## Local development
### Prerequisites
- Node.js 18+
- remove.bg API key
- Cloudinary account (cloud name, API key, secret)

### Backend setup
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Update `server/.env` with your API keys:
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

### Frontend setup
```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Update `web/.env` if your backend runs elsewhere:
```
VITE_API_BASE_URL=http://localhost:4000
```

Open `http://localhost:5173` in the browser.

## API endpoints
- `POST /api/images` (multipart form-data with `image`)
- `GET /api/images/:id`
- `DELETE /api/images/:id`
- `GET /api/health`

## Deployment

### Backend (Render)
See **[docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md)** for a complete step-by-step guide.

**Quick setup:**
1. Create a new **Web Service** from this repo.
2. Set the **Root Directory** to `server`.
3. Build command: `npm install && npm run build`.
4. Start command: `npm start`.
5. Add environment variables from `server/.env.example`.
6. Note the public URL (e.g., `https://your-service.onrender.com`).

### Frontend (Netlify or Vercel)
1. Create a new site from this repo.
2. Set the **Root Directory** to `web`.
3. Build command: `npm install && npm run build`.
4. Publish directory: `dist`.
5. Set `VITE_API_BASE_URL` to the backend URL.

### Automated Deployment
Use the deploy script for automated deployments:
- See **[docs/DEPLOYMENT_ENV_VARS.md](docs/DEPLOYMENT_ENV_VARS.md)** for required environment variables.
- Run `./scripts/deploy.sh` after setting up your `.env.deploy` file.

After deploy, open the frontend URL and verify the upload flow.
