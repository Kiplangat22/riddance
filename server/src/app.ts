import express, { type Express } from "express";
import cors from "cors";
import { securityHeaders } from "./config/security.js";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import routes from "./routes/index.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app: Express = express();

app.use(securityHeaders);
app.use(requestLogger);
app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()) }));
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));

app.use("/api/v1", routes);

// Order matters: notFound catches unmatched routes,
// errorHandler catches everything that calls next(err)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
