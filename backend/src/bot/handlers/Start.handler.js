import { Markup } from "telegraf";
import { parentLinkRepository } from "../../repositories/parentLink.repository.js";

export function mainMenuKeyboard() {
  return Markup.keyboard([
    ["➕ Yangi o'quvchi qo'shish"],
    ["👨‍👩‍👧 O'quvchilarim"],
  ]).resize();
}

export function registerStartHandler(bot) {
  bot.start(async (ctx) => {
    const chatId = String(ctx.chat.id);
    const existingLinks = await parentLinkRepository.find({
      where: { telegramChatId: chatId },
      relations: { student: true },
    });

    if (existingLinks.length > 0) {
      const names = existingLinks.map((l) => l.student.fullName).join(", ");
      await ctx.reply(
        `Assalomu alaykum! Botga xush kelibsiz.\n\nSizga bog'langan o'quvchilar: ${names}\n\nYangi farzand qo'shish yoki mavjudlarini ko'rish uchun quyidagi tugmalardan foydalaning.`,
        mainMenuKeyboard()
      );
    } else {
      await ctx.reply(
        "Assalomu alaykum! Bu bot orqali farzandingizning darsga kelib-kelmaganligi, kech qolishi, o'qituvchi izohi va to'lov holati haqida xabar olib turasiz.\n\nBoshlash uchun farzandingizga berilgan kodni kiritish kerak. \"➕ Yangi o'quvchi qo'shish\" tugmasini bosing.",
        mainMenuKeyboard()
      );
    }
  });

  bot.command("menu", (ctx) => ctx.reply("Asosiy menyu:", mainMenuKeyboard()));
}