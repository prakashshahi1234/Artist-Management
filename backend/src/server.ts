import { app } from "./app";
import { config } from "dotenv";
import { MailService } from "./services/mail.services";
import db from "./db/config/db";

// Load env variables
config();

const port = process.env.PORT || 8000;

const server = app.listen(port, async () => {
  console.log("✅ Server started on", `http://localhost:${port}`);

  try {
    // Mail service test
    await MailService.testConnection();
    console.log("Mail server started on", `http://localhost:1080`);
    // Database initialization
    await db.createDatabase("artist-manager");
    await db.useDatabase("artist-manager");
    await db.initializeTables();

  } catch (error) {
    console.error("❌ Startup failure:", error instanceof Error ? error.message : error);

    server.close(() => {
      console.log("🛑 Server shut down due to startup error.");
      process.exit(1);
    });
  }
});

export { server };
