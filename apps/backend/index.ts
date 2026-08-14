import express from "express";
import { env } from "./config/env";
import userRoutes from "./routes/userRoutes";
import tenantRoutes from "./routes/tenant";
import notificationRoutes from "./routes/notification";
import analyticNotificationRoutes from "./routes/analyticNotification";

const app = express();

app.use(express.json());

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


app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});