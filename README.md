# HAJZK Frontend

A modern booking platform built with React, TypeScript, and Vite.

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
cd frontend
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hajzk-frontend.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo `hajzk-frontend`
4. Vercel auto-detects Vite - just click Deploy!

### Step 3: Set Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |
| `VITE_SUPABASE_URL` | `https://majskvkyvflifttonwgr.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key_here` |

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Route pages
│   ├── integrations/   # Supabase client
│   ├── hooks/          # Custom hooks
│   └── lib/            # Utilities
├── public/             # Static assets
└── index.html          # Entry HTML
```

## 🔗 Backend Connection

This frontend connects to a separate backend API for:
- Google Calendar OAuth
- Booking management
- WhatsApp notifications

Make sure to set `VITE_API_BASE_URL` to your backend URL.
