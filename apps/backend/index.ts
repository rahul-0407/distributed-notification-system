import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env";
import userRoutes from "./routes/userRoutes";
import tenantRoutes from "./routes/tenant";
import notificationRoutes from "./routes/notification";
import analyticNotificationRoutes from "./routes/analyticNotification";

import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health Check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/analytics/notifications", analyticNotificationRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});