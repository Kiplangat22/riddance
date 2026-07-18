/**
 * index.ts
 * Application entry point.
 * Starts the HTTP server.
 */
import dotenv from "dotenv";
import app from "./app.js";

// import dotenv from "dotenv";
// import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 RIDDANCE API is running at http://localhost:${PORT}`);
});