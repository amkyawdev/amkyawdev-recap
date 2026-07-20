# ☁️ Cloudflare Pages Deployment Guide

## Prerequisites

1. Cloudflare account (free at cloudflare.com)
2. Wrangler CLI installed

## Quick Deploy

### Option 1: GitHub Integration (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Workers & Pages** → **Create application** → **Pages**
3. Click **Connect to Git**
4. Select your GitHub repository: `amkyawdev/amkyawdev-recap`
5. Configure build settings:
   - **Project name:** `amkyawdev-recap`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Click **Deploy**

### Option 2: CLI Deployment

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

## ⚠️ Important Note

This app has a **backend server** (Express.js) for:
- Video file uploads
- FFmpeg processing
- AI API integrations

For **full functionality**, you need to deploy the backend separately:

### Backend Deployment Options

1. **Cloudflare Workers** (Advanced)
   - Rewrite server to use Cloudflare Workers
   - Limited FFmpeg support

2. **Railway.app** (Recommended)
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

3. **Render.com**
   - Create Web Service
   - Set build command: `npm install`
   - Set start command: `node server/index.js`

4. **Vercel** with Serverless Functions

## Environment Variables

For production, set these in Cloudflare Pages:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API |
| `OPENAI_API_KEY` | OpenAI API |
| `ELEVENLABS_API_KEY` | ElevenLabs API |

## Static Frontend Only

If you just want the frontend (without backend):

```bash
# Build
npm run build

# The dist/ folder contains static files
# Upload to any static hosting
```

## Custom Domain

1. In Cloudflare Dashboard → Pages → Your Project
2. Click **Custom domains**
3. Add your domain (e.g., `recap.amkyawdev.com`)
4. Configure DNS

## Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
wrangler pages project delete amkyawdev-recap
npm run deploy
```

### CORS Issues
If using a separate backend, update API URLs in `src/utils/api.js`

## Links

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
