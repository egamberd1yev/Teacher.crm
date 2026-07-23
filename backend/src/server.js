import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source.js";
import app from "./app.js";
import { launchBot } from "./bot/bot.js";
import { startPaymentReminderJob } from "./jobs/paymentReminder.job.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(async () => {
    console.log("Database ulanish muvaffaqiyatli");

    await launchBot();
    startPaymentReminderJob();

    app.listen(PORT, () => {
      console.log(`Server ${PORT} portda ishlayapti`);
    });
  })
  .catch((error) => {
    console.error("Database ulanishda xatolik:", error);
  });