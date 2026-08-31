# 🛠️ Database Setup Guide (MongoDB with Optional Redis)

This guide walks you through setting up **MongoDB** for **Markdown Studio**.

> 💡 **Good News**: **`MONGODB_URI` is the only required database configuration!**
> If you do not configure Redis (`REDIS_URL`), the application runs in **MongoDB Standalone Mode** with zero external dependencies, native TTL auto-purging, and full copy-on-edit context sharing.

---

## ⚡ Architecture Modes

Markdown Studio automatically selects the best operational mode based on your environment variables:

1. **MongoDB Standalone Mode (Recommended & Default)**:
   - **Requires**: Only `MONGODB_URI`.
   - **How it works**: Documents, tokens, and share URLs are saved directly to MongoDB.
   - **Auto-Cleanup**: MongoDB's native **TTL Index** on `expiresAt` automatically purges expired records in the background.
   - **Rate Limiting**: Uses a lightweight in-memory sliding window cache.

2. **MongoDB + Redis Hybrid Mode (Optional Performance Acceleration)**:
   - **Requires**: Both `MONGODB_URI` and `REDIS_URL`.
   - **How it works**: Redis acts as an L1 sub-millisecond read cache and distributed rate limiter, while MongoDB acts as the durable L2 store.

3. **In-Memory Fallback Mode**:
   - **Requires**: No database configured (used for instant local testing).
   - **How it works**: Uses a transient in-memory map with simulated TTLs.

---

## 🔑 Environment Variables Configuration

Create or update your `.env.local` file:

```bash
# Site URL (Used for generating absolute OpenGraph & Share URLs)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 🍃 MongoDB Connection String (REQUIRED)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/markdown_studio?retryWrites=true&w=majority

# ⚡ Redis Connection URL (OPTIONAL - only if you want L1 cache acceleration)
# REDIS_URL=rediss://default:xxxxxx@flexible-xxx.upstash.io:6379
```

---

## 🍃 1. MongoDB Setup (Step-by-Step)

### Option A: MongoDB Atlas (Cloud - Free Forever Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Create a Deployment** and select the **M0 Free** shared cluster.
3. In **Security Quickstart**:
   - Create a database user with a **Username** and **Password** (save the password!).
   - In **IP Access List**, select **Allow Access from Anywhere** (`0.0.0.0/0`) for Vercel/cloud deployments, or add your current IP for local testing.
4. Click **Connect** $\rightarrow$ **Drivers** (Node.js).
5. Copy the connection string and paste it into `.env.local` as `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://myUser:mySecretPassword@cluster0.abcde.mongodb.net/markdown_studio?retryWrites=true&w=majority
   ```

> **Note on TTL Auto-Purge**: The Mongoose model in `lib/models/SharedContext.ts` automatically creates the MongoDB TTL index (`{ expiresAt: 1 }, { expireAfterSeconds: 0 }`) upon first connection. Expired documents are deleted automatically by MongoDB.

---

### Option B: Local MongoDB with Docker

If you prefer running MongoDB locally on your machine:

```bash
# Run MongoDB in Docker
docker run -d --name mongo-local -p 27017:27017 mongo:latest

# Configure in .env.local
MONGODB_URI=mongodb://localhost:27017/markdown_studio
```

---

## 🚀 2. Testing and Verification

1. Start the Next.js development server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000).

3. Create or write a markdown document and click **"Share"** in the top navigation bar.

4. Select an expiration duration (e.g. **5 min**, **1 hour**, or **Custom**) and click **"Generate Share Link"**.

5. Open the generated URL (`/s/<token>`) in an incognito window:
   - The shared context will load from MongoDB.
   - The remaining TTL countdown badge is displayed in the top banner.
   - Editing creates a local copy (fork) without modifying the original in MongoDB.
   - Re-sharing creates a new independent link with ancestor lineage (`parentToken`).

---

## ☁️ 3. Deploying to Vercel

When deploying to [Vercel](https://vercel.com):

1. Import your GitHub repository to Vercel.
2. Go to **Settings** $\rightarrow$ **Environment Variables**.
3. Add:
   - `NEXT_PUBLIC_SITE_URL`: `https://your-domain.vercel.app`
   - `MONGODB_URI`: `mongodb+srv://...`
4. Click **Deploy**.
