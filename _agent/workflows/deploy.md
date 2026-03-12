---
description: Steps to prepare and build Kivi for deployment
---

# Deploy Preparation Workflow

Follow these steps to ensure the application is ready for production.

## 🌐 Frontend (Vercel)
1. **Push Changes**: `git push origin main`
2. **Environment**: Set variables in Vercel Dashboard.
3. **Build & Deploy**: Handled automatically by Vercel on push.
   - Command: `npx prisma generate && next build`

## ⚙️ Worker (VPS: EC2/DO)
1. **Server Access**: `ssh user@server-ip`
2. **Setup Dependencies**: Ensure FFmpeg and Bun are installed.
3. **Deploy Script**:
// turbo
```bash
git pull origin main
bun install
# Apply database migrations
npx prisma migrate deploy
# Restart worker process
pm2 restart kivi-transcoder || pm2 start "bun run workers/transcode-worker.ts" --name kivi-transcoder
```

4. **Monitoring**: `pm2 logs kivi-transcoder`
