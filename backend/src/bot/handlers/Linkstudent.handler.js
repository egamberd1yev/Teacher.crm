import { AppDataSource } from "../../config/data-source.js";
import { mainMenuKeyboard } from "./start.handler.js";

const Student = () => AppDataSource.getRepository("Student");
const ParentLink = () => AppDataSource.getRepository("ParentLink");

export function registerLinkStudentHandler(bot) {
  // Tugma yoki komanda orqali kod so'rash rejimini yoqish
  bot.hears("➕ Yangi o'quvchi qo'shish", (ctx) => promptForCode(ctx));
  bot.command("yangi_oquvchi_qoshish", (ctx) => promptForCode(ctx));

  // Foydalanuvchi keyingi xabarida kodni yozadi
  bot.on("text", async (ctx, next) => {
    if (!ctx.session.awaitingLinkCode) {
      return next();
    }

    const code = ctx.message.text.trim().toUpperCase();
    ctx.session.awaitingLinkCode = false;

    const student = await Student().findOne({
      where: { linkCode: code },
      relations: { group: true },
    });

    if (!student) {
      await ctx.reply(
        "❌ Bunday kod topilmadi. Kodni to'g'ri kiritganingizga ishonch hosil qiling yoki o'qituvchidan qayta so'rang.",
        mainMenuKeyboard()
      );
      return;
    }

    const chatId = String(ctx.chat.id);
    const alreadyLinked = await ParentLink().findOne({
      where: { telegramChatId: chatId, student: { id: student.id } },
    });

    if (alreadyLinked) {
      await ctx.reply(
        `Siz allaqachon "${student.fullName}" bilan bog'langansiz.`,
        mainMenuKeyboard()
      );
      return;
    }

    const link = ParentLink().create({
      telegramChatId: chatId,
      parentFirstName: ctx.from.first_name || null,
      student: { id: student.id },
    });
    await ParentLink().save(link);

    await ctx.reply(
      `✅ Muvaffaqiyatli bog'landingiz!\n\n👤 O'quvchi: ${student.fullName}\n📚 Guruh: ${student.group.name}\n\nEndi shu farzandingiz bo'yicha davomat, kech qolish va to'lov xabarlarini shu botda olib turasiz.`,
      mainMenuKeyboard()
    );
  });
}

async function promptForCode(ctx) {
  ctx.session.awaitingLinkCode = true;
  await ctx.reply(
    "Farzandingizga o'qituvchi tomonidan berilgan kodni kiriting (masalan: AH3921):"
  );
}