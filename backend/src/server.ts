import app from "./app";
import config from "./config";
import { connectDatabase } from "./database/connection";

async function main() {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(
      `🚀 AgriConnect API running on port ${config.port} [${config.nodeEnv}]`
    );
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
