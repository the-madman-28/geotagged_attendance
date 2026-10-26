import app from "./app";
import prisma from "./config/prisma";
import { startAutoPunchOutJob } from "./jobs/autoPunchOut.job";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("✅ Database connected");

    startAutoPunchOutJob();

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Database connection failed:",
      error
    );

    process.exit(1);
  }
}

startServer();