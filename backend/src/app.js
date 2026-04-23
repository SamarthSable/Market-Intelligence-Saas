import express from "express";
import cors from "cors";

import dashboardRoutes from "./routes/dashboard.routes.js";
import watchlistRoutes from "./routes/watchlist.routes.js";
import newsRoutes from "./routes/news.routes.js";
import sectorRoutes from "./routes/sector.routes.js";
import opportunityRoutes from "./routes/opportunity.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import analystRoutes from "./routes/analyst.routes.js";
import marketRoutes from "./routes/market.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";

const app = express();

function readAllowedOrigins() {
  const configuredOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
  ]
    .filter(Boolean)
    .flatMap((value) =>
      String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );

  return configuredOrigins.length ? configuredOrigins : true;
}

app.set("trust proxy", 1);
app.use(
  cors({
    origin: readAllowedOrigins(),
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(apiRateLimiter);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "market-intelligence-api",
  });
});

// Routes are grouped by product area so each role hits a predictable API surface.
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/sectors", sectorRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analyst", analystRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
