# 🔧 Deployment Troubleshooting Guide

Common issues and how to fix them when deploying your Next.js app.

---

## 🚨 Build Failures

### Error: "npm install failed"

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Update package-lock.json**
   ```bash
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Update package-lock.json"
   git push
   ```

2. **Try legacy peer deps** (add to platform build command)
   ```bash
   npm install --legacy-peer-deps && npm run build
   ```

3. **Check Node version**
   - Ensure platform is using Node 20+
   - Set in platform environment: `NODE_VERSION=20`

---

### Error: "Module not found"

**Symptoms:**
```
Error: Cannot find module 'xyz'
Module not found: Can't resolve '@/components/...'
```

**Solutions:**

1. **Check if dependency is in package.json**
   ```bash
   npm install missing-package
   git add package.json package-lock.json
   git commit -m "Add missing dependency"
   git push
   ```

2. **Verify import paths**
   - Check `tsconfig.json` paths are correct
   - Ensure file extensions are included where needed
   - Use correct case (Windows is case-insensitive, Linux isn't!)

3. **Clear build cache**
   - Vercel: Redeploy with "Clear Cache and Deploy"
   - Railway: Delete service and redeploy
   - Netlify: Site Settings → Build & Deploy → Clear cache

---

### Error: "Build exceeded time limit"

**Symptoms:**
```
Error: Build exceeded maximum time limit
```

**Solutions:**

1. **Optimize build** (add to next.config.ts)
   ```typescript
   const nextConfig = {
     experimental: {
       optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
     },
   };
   ```

2. **Reduce build size**
   - Remove unused dependencies
   - Use dynamic imports for large components
   - Optimize images before committing

3. **Upgrade platform plan** (if free tier limits exceeded)

---

## 🌐 Runtime Errors

### Error: "Internal Server Error (500)"

**Symptoms:**
- App builds successfully but shows 500 error
- Server logs show errors

**Solutions:**

1. **Check environment variables**
   ```bash
   npm run deploy:check
   ```
   Ensure ALL variables from `.env.example` are set on platform

2. **Check server logs**
   - Vercel: Function Logs in dashboard
   - Railway: Deployments → View Logs
   - Netlify: Site Overview → Function logs
   - Render: Logs tab

3. **Common environment variable issues:**
   - Missing `SUPABASE_SERVICE_ROLE_KEY`
   - Wrong `NEXT_PUBLIC_APP_URL` format (no trailing slash!)
   - Invalid `ADMIN_SESSION_SECRET`

4. **Test API routes locally first**
   ```bash
   npm run build
   npm run start
   # Test at http://localhost:3000
   ```

---

### Error: "CORS / API Not Working"

**Symptoms:**
```
Access to fetch blocked by CORS policy
Failed to fetch
```

**Solutions:**

1. **Update NEXT_PUBLIC_APP_URL**
   - Must match your deployed URL EXACTLY
   - No trailing slash
   - Include https://

2. **Check API route configuration**
   ```typescript
   // In your API route
   export const config = {
     api: {
       bodyParser: true,
     },
   };
   ```

3. **Verify Supabase settings**
   - Go to Supabase → Authentication → URL Configuration
   - Add your deployed URL to "Site URL"
   - Add URL to "Redirect URLs"

---

### Error: "Supabase Connection Failed"

**Symptoms:**
```
supabase.auth.getSession() failed
Failed to fetch data from Supabase
```

**Solutions:**

1. **Verify credentials**
   - Check `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon key (not service role!)
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (server-side only)

2. **Check Supabase project status**
   - Go to Supabase dashboard
   - Ensure project is not paused
   - Check API status page

3. **Test connection locally**
   ```bash
   # In your browser console on deployed site
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

---

## ⚡ Performance Issues

### Problem: "Site loads slowly"

**Solutions:**

1. **Enable caching**
   ```typescript
   // next.config.ts
   const nextConfig = {
     compress: true,
     poweredByHeader: false,
   };
   ```

2. **Optimize images**
   - Use Next.js Image component
   - Convert to WebP format
   - Use appropriate sizes

3. **Check platform region**
   - Deploy to region closest to users
   - Use Vercel for global edge network

4. **Enable ISR (Incremental Static Regeneration)**
   ```typescript
   // In page component
   export const revalidate = 60; // Revalidate every 60 seconds
   ```

---

### Problem: "Cold starts (Render specific)"

**Symptoms:**
- First request after inactivity takes 30+ seconds

**Solutions:**

1. **Keep service warm** (manual)
   - Use a free uptime monitor like UptimeRobot
   - Ping your site every 5 minutes

2. **Or upgrade to paid plan**
   - Paid Render services don't spin down

3. **Or switch platform**
   - Consider Vercel (no cold starts)
   - Consider Railway (stays warm on free tier)

---

## 🔐 Authentication Issues

### Error: "Admin login not working"

**Solutions:**

1. **Verify ADMIN_SESSION_SECRET**
   - Must be at least 32 characters
   - Same secret used in local dev and production
   - Generate new one: `openssl rand -base64 32`

2. **Clear browser cookies**
   ```javascript
   // In browser console
   document.cookie.split(";").forEach(c => {
     document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
   });
   ```

3. **Check session middleware**
   - Ensure `src/middleware.ts` is deployed
   - Verify middleware config in `next.config.ts`

---

## 📦 Deployment-Specific Issues

### Vercel

**Issue: Deployment succeeds but changes not visible**

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check you're viewing production URL (not preview)
3. Clear Vercel cache and redeploy

**Issue: Environment variables not working**

**Solutions:**
1. Redeploy after adding variables
2. Check variable names (no typos!)
3. Ensure `NEXT_PUBLIC_*` prefix for client-side vars

---

### Railway

**Issue: "Out of credits"**

**Solutions:**
1. Check usage: Dashboard → Usage
2. Optimize: Reduce build frequency, optimize resources
3. Add credit card for $5/month
4. Or migrate to Vercel (more generous free tier)

**Issue: "Deployment failed: Build failed"**

**Solutions:**
1. Check Railway logs for specific error
2. Verify `railway.toml` is in root directory
3. Ensure Git push went through

---

### Netlify

**Issue: "Next.js pages not loading"**

**Solutions:**
1. Install Next.js plugin:
   ```bash
   npm install -D @netlify/plugin-nextjs
   ```
2. Ensure `netlify.toml` is in root
3. Check build command: `npm run build`
4. Check publish directory: `.next`

---

### Render

**Issue: "Build failed: Disk space exceeded"**

**Solutions:**
1. Clear node_modules before build
2. Use `.dockerignore` to exclude unnecessary files
3. Optimize dependencies (remove unused packages)

**Issue: "Service won't wake up"**

**Solutions:**
1. Check if free tier hours exceeded (750/month)
2. Verify service is not in "Suspended" state
3. Check Render status page for outages

---

## 🧪 Debugging Tools

### Test Build Locally

```bash
# Simulate production build
npm run build
npm run start

# Check environment variables
node -e "console.log(process.env)"

# Test specific page
curl http://localhost:3000
curl http://localhost:3000/api/health
```

---

### Check Deployment Readiness

```bash
# Run comprehensive checks
npm run deploy:check

# Validate environment variables
cat .env | grep -v '^#' | grep -v '^$'

# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/
```

---

### Platform-Specific Logs

**Vercel:**
```bash
vercel logs [deployment-url]
vercel env ls
```

**Railway:**
```bash
railway logs
railway variables
```

**Netlify:**
```bash
netlify deploy --prod
netlify open --site
```

**Render:**
- Check dashboard → Service → Logs tab

---

## 📞 Getting Help

### Before Asking for Help

Run through this checklist:

- [ ] Ran `npm run deploy:check`
- [ ] All environment variables set correctly
- [ ] Build works locally (`npm run build && npm start`)
- [ ] Checked platform logs for specific errors
- [ ] Verified all files are pushed to Git
- [ ] Tried clearing cache and redeploying
- [ ] Read error message carefully

### Where to Get Help

1. **Platform-Specific:**
   - Vercel: https://vercel.com/support
   - Railway: https://help.railway.app/
   - Netlify: https://answers.netlify.com/
   - Render: https://render.com/docs

2. **Next.js:**
   - Discord: https://nextjs.org/discord
   - GitHub: https://github.com/vercel/next.js/discussions

3. **Supabase:**
   - Discord: https://discord.supabase.com/
   - Docs: https://supabase.com/docs

---

## ✅ Final Checklist

Before contacting support, ensure:

```bash
✅ Environment variables are set
✅ Build succeeds locally
✅ All files are committed and pushed
✅ Platform-specific config file exists
✅ Checked logs for specific errors
✅ Tried redeploying after changes
✅ Waited 5 minutes after deployment
✅ Cleared browser cache
```

---

## 🎯 Common Fixes Summary

| Problem | Quick Fix |
|---------|-----------|
| Build fails | `rm -rf node_modules package-lock.json && npm install` |
| 500 error | Check environment variables |
| CORS error | Update `NEXT_PUBLIC_APP_URL` |
| Supabase error | Verify API keys and URL |
| Slow site | Check platform region, optimize images |
| Cold starts | Switch from Render to Vercel |
| Auth issues | Regenerate `ADMIN_SESSION_SECRET` |

---

Still stuck? Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed platform guides.
