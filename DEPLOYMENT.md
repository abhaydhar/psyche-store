# Deployment Guide for PsycheStore

This guide covers deploying your Next.js application to various free hosting platforms.

## 🚀 Quick Start

### Prerequisites
- A GitHub account with this repository
- Environment variables from `.env.example`
- Supabase project set up

---

## Option 1: Vercel (⭐ Recommended)

**Why Vercel?**
- Created by Next.js team - best compatibility
- Automatic deployments on git push
- Free tier: Unlimited personal projects
- Edge functions, analytics, and preview deployments included

### Deployment Steps

1. **Install Vercel CLI** (optional, for command-line deployment)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

3. **Or Deploy via Web Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings
   - Click "Deploy"

4. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GOOGLE_SHEETS_WEBHOOK_URL`
     - `ADMIN_SESSION_SECRET`
     - `NEXT_PUBLIC_APP_URL` (use your Vercel URL)

5. **Redeploy** after adding environment variables

### Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain and follow DNS instructions

---

## Option 2: Railway

**Why Railway?**
- Simple setup with automatic HTTPS
- Free tier: $5 credit per month
- Great for full-stack apps with databases

### Deployment Steps

1. **Sign up** at [railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Railway will detect `railway.toml`
   - Click on your service → Variables tab
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GOOGLE_SHEETS_WEBHOOK_URL`
     - `ADMIN_SESSION_SECRET`
     - `NEXT_PUBLIC_APP_URL` (Railway will provide this)

4. **Deploy**
   - Railway automatically deploys on push to main branch
   - Get your public URL from the Deployments tab

### CLI Deployment (Alternative)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## Option 3: Netlify

**Why Netlify?**
- Easy setup with drag-and-drop
- Free tier: 100GB bandwidth
- Great form handling and serverless functions

### Deployment Steps

1. **Sign up** at [netlify.com](https://netlify.com)

2. **Install Netlify CLI** (optional)
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy via CLI**
   ```bash
   netlify deploy --prod
   ```

4. **Or Deploy via Web Dashboard**
   - Click "Add new site"
   - Import from Git → Select repository
   - Netlify detects Next.js settings from `netlify.toml`
   - Click "Deploy"

5. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all required variables from `.env.example`
   - Update `NEXT_PUBLIC_APP_URL` with your Netlify URL

6. **Important:** Install the Next.js plugin
   ```bash
   npm install -D @netlify/plugin-nextjs
   ```
   (Already configured in `netlify.toml`)

---

## Option 4: Render

**Why Render?**
- Free tier with no credit card required
- Automatic SSL certificates
- Good for databases and background workers

### Deployment Steps

1. **Sign up** at [render.com](https://render.com)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render detects `render.yaml`

3. **Configure**
   - Name: `psychestore`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`

4. **Set Environment Variables**
   - In the Environment tab, add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GOOGLE_SHEETS_WEBHOOK_URL`
     - `ADMIN_SESSION_SECRET` (Render can generate this)
     - `NEXT_PUBLIC_APP_URL` (your Render URL)

5. **Deploy**
   - Click "Create Web Service"
   - Render automatically deploys

⚠️ **Note:** Free tier services spin down after 15 minutes of inactivity and take ~30 seconds to wake up.

---

## 🔐 Environment Variables Checklist

Make sure to set these on your chosen platform:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only)
- ✅ `GOOGLE_SHEETS_WEBHOOK_URL` - Webhook for order notifications
- ✅ `ADMIN_SESSION_SECRET` - Random secure string
- ✅ `NEXT_PUBLIC_APP_URL` - Your deployed app URL

---

## 📊 Platform Comparison

| Feature | Vercel | Railway | Netlify | Render |
|---------|--------|---------|---------|--------|
| **Free Tier** | Unlimited projects | $5/month credit | 100GB bandwidth | 750hrs/month |
| **Build Time** | ⚡ Fast | ⚡ Fast | ⚡ Fast | 🐢 Moderate |
| **Cold Start** | ❌ None | ❌ None | ❌ None | ⚠️ ~30s |
| **Next.js Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Auto Deploy** | ✅ | ✅ | ✅ | ✅ |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free | ✅ Free |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto |

---

## 🎯 Recommendation

**For Next.js apps**: Use **Vercel** - it's built by the Next.js team and offers the best performance and developer experience.

**For full-stack**: Consider **Railway** if you need databases or background workers.

**For static-heavy**: Use **Netlify** if your app is mostly static with some API routes.

**For budget**: Use **Render** if you want zero credit card requirement.

---

## 🐛 Troubleshooting

### Build Fails
- Check Node version (should be 20+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Environment Variables Not Working
- Ensure `NEXT_PUBLIC_*` prefix for client-side variables
- Redeploy after adding/changing variables
- Check for typos in variable names

### App Not Loading
- Check build logs for errors
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check Supabase credentials

### 500 Error
- Check server logs
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check API routes are working locally first

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Netlify Docs](https://docs.netlify.com)
- [Render Docs](https://render.com/docs)

---

## 🔄 Continuous Deployment

All platforms support automatic deployments:
1. Push to your main/master branch
2. Platform detects changes
3. Automatically builds and deploys
4. Get notified on success/failure

Set up branch previews for PR testing on Vercel/Netlify!
