import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();
app.use(express.json());
app.set("trust proxy", true);

import authRoutes from "./routes/user.js";
import whitelistRoutes from "./routes/whitelist.js";
import serviceTestRoutes from "./routes/serviceTest.js";
import { apiLimiter } from "./middlewares/ratelimit.middleware.js";

app.use("/api/v1", apiLimiter);
// Mount routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/whitelist", whitelistRoutes);
app.use("/api/v1/service", serviceTestRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
export { app };
