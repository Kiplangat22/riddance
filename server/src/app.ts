import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

import routes from "./routes/index.js";

app.use("/api/v1", routes);

export default app;