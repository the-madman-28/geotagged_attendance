"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAutoPunchOutJob = startAutoPunchOutJob;
const node_cron_1 = __importDefault(require("node-cron"));
const autoPunchOut_service_1 = require("../services/autoPunchOut.service");
function startAutoPunchOutJob() {
    node_cron_1.default.schedule("* * * * *", async () => {
        try {
            const processedCount = await (0, autoPunchOut_service_1.processAutomaticPunchOut)();
            if (processedCount > 0) {
                console.log(`⏰ Automatic punch-out processed: ${processedCount}`);
            }
        }
        catch (error) {
            console.error("❌ Automatic punch-out job failed:", error);
        }
    });
    console.log("⏰ Automatic punch-out job started (runs every minute)");
}
