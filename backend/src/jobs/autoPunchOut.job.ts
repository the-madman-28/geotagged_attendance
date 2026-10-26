import cron from "node-cron";
import { processAutomaticPunchOut } from "../services/autoPunchOut.service";

export function startAutoPunchOutJob() {
  cron.schedule("* * * * *", async () => {
    try {
      const processedCount = await processAutomaticPunchOut();

      if (processedCount > 0) {
        console.log(
          `⏰ Automatic punch-out processed: ${processedCount}`
        );
      }
    } catch (error) {
      console.error(
        "❌ Automatic punch-out job failed:",
        error
      );
    }
  });

  console.log(
    "⏰ Automatic punch-out job started (runs every minute)"
  );
}