import { Telegraf, session } from "telegraf";
import { registerStartHandler } from "./handlers/start.handler.js";
import { registerLinkStudentHandler } from "./handlers/linkStudent.handler.js";
import { registerMyStudentsHandler } from "./handlers/myStudents.handler.js";

let botInstance = null;

export function createBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN .env faylida topilmadi");
  }

  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  // Oddiy in-memory session. Bitta serverda ishlayotgan bo'lsa yetarli.
  // Agar bir nechta instance (PM2 cluster, load balancer) ishlatilsa,
  // buni redis-based session bilan almashtirish kerak.
  bot.use(session({ defaultSession: () => ({}) }));

  registerStartHandler(bot);
  registerLinkStudentHandler(bot);
  registerMyStudentsHandler(bot);

  bot.catch((err, ctx) => {
    console.error(`Bot xatosi (${ctx.updateType}):`, err);
  });

  botInstance = bot;
  return bot;
}

export function getBot() {
  if (!botInstance) {
    throw new Error("Bot hali ishga tushirilmagan. Avval createBot() chaqiring.");
  }
  return botInstance;
}

export async function launchBot() {
  const bot = createBot();

  // Ishlab chiqarishda webhook, lokal rivojlantirishda long polling tavsiya etiladi
  if (process.env.NODE_ENV === "production" && process.env.TELEGRAM_WEBHOOK_URL) {
    await bot.telegram.setWebhook(process.env.TELEGRAM_WEBHOOK_URL);
    console.log("Telegram bot webhook rejimida ishga tushdi");
  } else {
    bot.launch();
    console.log("Telegram bot polling rejimida ishga tushdi");
  }

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
}