# Market Intelligence SaaS

Market Intelligence SaaS is a role-based stock research platform for Indian equities. It combines live market data, sector momentum, analyst research workflows, client watchlists, and admin moderation into one full-stack application.

## Project Preview

![Market Intelligence preview](frontend/src/assets/image.png)

## What the App Does

- Gives `admin`, `analyst`, and `client` users separate workspaces with protected routes
- Pulls market prices into MySQL and uses that data for dashboard cards, signals, portfolio views, and sector ranking
- Lets analysts create, edit, and submit reports that admins can approve or reject
- Lets clients browse approved reports, watchlists, signals, sectors, and portfolio-style market snapshots
- Stores flexible platform activity in MongoDB for the admin activity feed
- Runs automated live sync jobs so price data, indicators, and signals stay fresh

## Tech Stack

- Frontend: React 19, Vite, React Router, Redux Toolkit, Bootstrap, ApexCharts
- Backend: Node.js, Express, Prisma
- Relational database: MySQL
- Document database: MongoDB
- Market/news integrations: Yahoo Finance chart endpoint, GNews, RSS feeds

## Folder Structure

```text
backend/
  prisma/        Prisma schema
  src/           Express app, controllers, services, jobs
  server.js      Backend entry point
frontend/
  src/           React pages, layouts, API layer, styles
```

## Main Features

### Admin

- Platform analytics dashboard
- User management and role updates
- Report moderation
- MongoDB-backed recent activity feed

### Analyst

- Analyst cockpit with stats, sector leaders, and signal board
- Report drafting with validation
- Indicator and market insight workflow

### Client

- Market dashboard with portfolio-style snapshot
- Sector ranking and opportunities
- Signals, watchlist, reports, billing, and portfolio pages

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create `backend/.env` with:

```env
DATABASE_URL=your_mysql_connection_string
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GNEWS_API_KEY=your_gnews_key
PORT=5000
CLIENT_URL=http://localhost:5173
AUTO_SYNC_ON_START=true
AUTO_SYNC_SCHEDULE_ON_START=false
SYNC_STARTUP_MODE=live
SYNC_INTERVAL_MINUTES=60
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
```

Create `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Prepare the database

```bash
cd backend
npx prisma generate
npx prisma db push
node src/seed.js
```

### 4. Start the app

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Data Sync Commands

The backend can sync live market data into MySQL for `price_data`, indicators, and signals.

```bash
cd backend
npm run sync:live
npm run sync:full
npm run sync:schedule
```

## API Areas

- `/api/auth` for login and registration
- `/api/dashboard` for client and analyst dashboard data
- `/api/admin` for stats, users, moderation, and activity
- `/api/analyst` for analyst workflow data
- `/api/reports` for report CRUD and approval flows
- `/api/news` for company and market news
- `/api/watchlist`, `/api/sectors`, `/api/opportunities`, `/api/market` for market features
- `/api/health` for a simple deployment health check

## Notes Before GitHub Push

- Replace the preview image with a real dashboard screenshot if you want the repository page to show the live UI
- Do not commit real `.env` secrets
- The current Prisma schema still targets MySQL. If you migrate to Neon later, you will need to switch Prisma to PostgreSQL first.

## License

This project is currently unlicensed. Add a license before sharing publicly if you want people to know how they can use it.
