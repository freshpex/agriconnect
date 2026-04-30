import http from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { connectDatabase } from "./database/connection";
import { ensureAdminUser } from "./utils/adminBootstrap";

async function main() {
  await connectDatabase();
  await ensureAdminUser();

  const server = http.createServer(app);

  server.listen(config.port, () => {
    console.log(
      `🚀 AgriConnect API running on port ${config.port} [${config.nodeEnv}]`
    );
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully…`);
    server.close(async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
