"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./config/prisma"));
const autoPunchOut_job_1 = require("./jobs/autoPunchOut.job");
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        await prisma_1.default.$connect();
        console.log("✅ Database connected");
        (0, autoPunchOut_job_1.startAutoPunchOutJob)();
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}
startServer();
