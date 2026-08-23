# ?? Vercel Deployment & Configuration Guide — LINC

This repository is fully configured for deployment on **Vercel** serverless functions.

---

## 1. How Vercel Deployment Works

- **Entry Point**: [`api/index.js`](./api/index.js) imports the Express application ([`server/src/app.js`](./server/src/app.js)) and exports it as a serverless function.
- **Routing Configuration**: [`vercel.json`](./vercel.json) rewrites all incoming HTTP requests (`/(.*)`) to the serverless function handler with automatic CORS headers.
- **Stateless & Scalable**: All authentication (JWT), storage (Supabase PostgreSQL / Storage), and AI queries (Google Gemini) operate via REST/HTTPS, making it 100% serverless-ready.

---

## 2. Deploying to Vercel (Step-by-Step)

### Option A: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new) and log in.
2. Select and import your GitHub repository: `niletechx/LINC` (or your fork).
3. **Project Settings**:
   - **Framework Preset**: `Other` (or auto-detected Node.js).
   - **Root Directory**: `./` (leave as root).
   - **Build Command**: `npm run install:all` (or leave default).
   - **Output Directory**: Leave empty.
4. **Environment Variables**:
   Add the following environment variables in the Vercel Dashboard (under *Project Settings* -> *Environment Variables*):

| Variable Name | Required | Description | Example / Default |
|---|---|---|---|
| `NODE_ENV` | Yes | Node environment | `production` |
| `PORT` | Optional | Port fallback | `5000` |
| `SUPABASE_URL` | Yes | Supabase Project URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Supabase Anon Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Service Role Key | `eyJhbGciOi...` |
| `JWT_SECRET` | Yes | JWT Signing Secret | `your_secure_random_jwt_secret` |
| `GEMINI_API_KEY` | Yes | Google Gemini AI API Key | `AIzaSy...` |
| `CORS_ORIGIN` | Optional | Allowed CORS origins | `*` |

5. Click **Deploy**. Vercel will build and assign you a live domain:
   ```
   https://<your-project-name>.vercel.app
   ```

---

### Option B: Via Vercel CLI
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production
vercel --prod
```

---

## 3. Connecting the Flutter Mobile App to Vercel

Once your Vercel deployment is live (e.g. `https://linc-api.vercel.app`):

### In the Mobile App UI:
1. Open the LINC app on your phone.
2. Tap the **Server IP** button (located on the top-right of the Home / Welcome / Login screens).
3. Type or paste your Vercel URL (e.g., `https://linc-api.vercel.app`).
4. Tap **Save & Connect**. The app immediately tests connectivity and switches to your Vercel backend!

### Compile-time (for Release APK / AAB):
Build the Flutter APK with the Vercel URL baked in:
```bash
flutter build apk --release --dart-define=BASE_URL=https://<your-project>.vercel.app
```

---

## 4. Verification & Health Check

After deployment, test your live Vercel API:

```bash
# 1. Root metadata
curl https://<your-project>.vercel.app/

# 2. Health check
curl https://<your-project>.vercel.app/health

# 3. Provider catalog
curl https://<your-project>.vercel.app/api/providers
```
