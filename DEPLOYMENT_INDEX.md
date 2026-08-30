# 📑 Deployment Documentation Index

Your complete guide to deploying PsycheStore to free hosting platforms.

---

## 🚀 Quick Navigation

| Document | Description | When to Read |
|----------|-------------|--------------|
| **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** | 5-minute deployment guide | ⭐ **Start here** - Deploy ASAP |
| **[PLATFORM_COMPARISON.md](./PLATFORM_COMPARISON.md)** | Platform pros/cons & recommendations | Choosing a platform |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Complete step-by-step guide | Detailed instructions |
| **[DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)** | Common issues & fixes | Having problems |
| **[README.md](./README.md)** | Project overview | General info |

---

## 📂 Configuration Files

### Platform Configs (Ready to Use)

| File | Platform | Status |
|------|----------|--------|
| `vercel.json` | Vercel | ✅ Ready |
| `railway.toml` | Railway | ✅ Ready |
| `netlify.toml` | Netlify | ✅ Ready |
| `render.yaml` | Render | ✅ Ready |

### Environment Files

| File | Purpose |
|------|---------|
| `.env.example` | Local development template |
| `.env.production.example` | Production deployment template |
| `.env` | Your local secrets (not in git) |

---

## 🛠️ Helper Scripts

### NPM Scripts (package.json)

```bash
npm run deploy:check       # Validate deployment readiness
npm run deploy:vercel      # Deploy to Vercel via CLI
npm run deploy:railway     # Deploy to Railway via CLI
npm run deploy:netlify     # Deploy to Netlify via CLI
```

### Bash Scripts (scripts/)

```bash
bash scripts/deploy.sh               # Interactive deployment menu
node scripts/check-deployment.js     # Comprehensive validation
```

---

## 🎯 Deployment Workflow

### First Time Deployment

```
1. Choose Platform
   └─ Read: PLATFORM_COMPARISON.md

2. Quick Deploy
   └─ Read: DEPLOYMENT_QUICKSTART.md

3. Set Environment Variables
   └─ Use: .env.production.example

4. Deploy!
   └─ Run: npm run deploy:[platform]

5. Having Issues?
   └─ Read: DEPLOYMENT_TROUBLESHOOTING.md
```

---

## 📚 Detailed Guides

### By Platform

<details>
<summary><b>Vercel (Recommended)</b></summary>

**Why Choose Vercel:**
- Best Next.js performance
- Zero configuration
- Unlimited free projects
- Global edge network

**Quick Deploy:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import GitHub repository
3. Add environment variables
4. Deploy!

**Detailed Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md#option-1-vercel--recommended)

**Config File:** `vercel.json`

</details>

<details>
<summary><b>Railway</b></summary>

**Why Choose Railway:**
- Built-in PostgreSQL
- Simple full-stack deployment
- $5/month free credit
- No cold starts

**Quick Deploy:**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy!

**Detailed Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md#option-2-railway)

**Config File:** `railway.toml`

</details>

<details>
<summary><b>Netlify</b></summary>

**Why Choose Netlify:**
- 100GB free bandwidth
- Built-in form handling
- Split testing
- Good for static sites

**Quick Deploy:**
1. Go to [netlify.com](https://netlify.com)
2. Add new site → Import from Git
3. Add environment variables
4. Deploy!

**Detailed Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md#option-3-netlify)

**Config File:** `netlify.toml`

</details>

<details>
<summary><b>Render</b></summary>

**Why Choose Render:**
- Completely free (no credit card)
- 750 hours/month
- Auto SSL
- Docker support

**Quick Deploy:**
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Add environment variables
5. Deploy!

**Detailed Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md#option-4-render)

**Config File:** `render.yaml`

⚠️ **Note:** Free tier has ~30s cold starts after 15min inactivity

</details>

---

## 🔑 Environment Variables Reference

### Required Variables

All platforms need these:

```bash
NEXT_PUBLIC_SUPABASE_URL          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Public anon key
SUPABASE_SERVICE_ROLE_KEY         # Service role key (secret!)
GOOGLE_SHEETS_WEBHOOK_URL         # Order notification webhook
ADMIN_SESSION_SECRET              # Random 32+ char string
NEXT_PUBLIC_APP_URL               # Your deployed URL
```

### Where to Find Values

- **Supabase Keys:** https://app.supabase.com → Project Settings → API
- **Google Sheets Webhook:** Google Apps Script deployment URL
- **Admin Secret:** Generate with `openssl rand -base64 32`
- **App URL:** Provided after first deployment

### Setting Variables

Each platform:
- **Vercel:** Project Settings → Environment Variables
- **Railway:** Service → Variables tab
- **Netlify:** Site Settings → Environment Variables
- **Render:** Environment tab

**⚠️ Important:** Always redeploy after adding/changing variables!

---

## ✅ Pre-Deployment Checklist

Run before deploying:

```bash
npm run deploy:check
```

This validates:
- [ ] All required scripts exist in package.json
- [ ] Environment variables are set locally
- [ ] Dependencies are installed
- [ ] Build succeeds locally
- [ ] Security files (.gitignore) are configured
- [ ] Deployment configs exist

---

## 🚨 Common Issues & Quick Fixes

| Issue | Quick Fix | Detailed Help |
|-------|-----------|---------------|
| Build fails | Clear cache, try `npm ci` | [Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md#-build-failures) |
| 500 error | Check environment variables | [Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md#error-internal-server-error-500) |
| CORS error | Update `NEXT_PUBLIC_APP_URL` | [Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md#error-cors--api-not-working) |
| Supabase error | Verify API keys | [Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md#error-supabase-connection-failed) |
| Slow loading | Check platform region | [Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md#-performance-issues) |

Full troubleshooting guide: [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)

---

## 📊 Platform Comparison Quick Reference

| Feature | Vercel | Railway | Netlify | Render |
|---------|--------|---------|---------|--------|
| **Best For** | Next.js | Full-stack | Static | Free tier |
| **Free Bandwidth** | 100GB | ~5GB | 100GB | 100GB |
| **Cold Starts** | None | None | None | ~30s |
| **Setup Time** | 2 min | 5 min | 5 min | 8 min |
| **Difficulty** | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

**Recommendation:** Vercel for 95% of use cases

Full comparison: [PLATFORM_COMPARISON.md](./PLATFORM_COMPARISON.md)

---

## 🎓 Learning Path

### Beginner (Just Deploy It!)
1. ✅ Read [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
2. ✅ Run `npm run deploy:check`
3. ✅ Deploy to Vercel (easiest)
4. ✅ Done!

### Intermediate (Understand Options)
1. ✅ Read [PLATFORM_COMPARISON.md](./PLATFORM_COMPARISON.md)
2. ✅ Choose best platform for your needs
3. ✅ Read platform-specific section in [DEPLOYMENT.md](./DEPLOYMENT.md)
4. ✅ Deploy!

### Advanced (Master Deployment)
1. ✅ Read all documentation
2. ✅ Set up CI/CD pipelines
3. ✅ Configure custom domains
4. ✅ Set up monitoring & analytics
5. ✅ Optimize for performance

---

## 🔗 External Resources

### Official Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Netlify Documentation](https://docs.netlify.com)
- [Render Documentation](https://render.com/docs)

### Community Resources
- [Next.js Discord](https://nextjs.org/discord)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Railway Discord](https://discord.gg/railway)

---

## 📝 Document Updates

| Date | Change | Document |
|------|--------|----------|
| 2024-08-30 | Initial deployment setup | All files created |

---

## 💡 Pro Tips

1. **Start with Vercel** - It's the fastest and most reliable
2. **Test locally first** - Always run `npm run build && npm start`
3. **Use environment files** - Copy from `.env.production.example`
4. **Monitor first deploy** - Watch logs for any issues
5. **Update app URL** - Set `NEXT_PUBLIC_APP_URL` after deployment

---

## 🆘 Need Help?

1. **Check troubleshooting guide:** [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)
2. **Run validator:** `npm run deploy:check`
3. **Check platform status pages**
4. **Review platform logs**
5. **Ask in platform community/support**

---

## ✨ You're Ready!

Everything is configured and ready to deploy. Choose your path:

- 🏃‍♂️ **Fast Track:** [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
- 🤔 **Compare First:** [PLATFORM_COMPARISON.md](./PLATFORM_COMPARISON.md)
- 📖 **Detailed Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

**Recommended:** Start with Vercel - it's 2 minutes to deployment! 🚀
