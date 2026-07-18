import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

// Order matters: notFound catches unmatched routes,
// errorHandler catches everything that calls next(err)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;