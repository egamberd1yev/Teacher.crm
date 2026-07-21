import { Markup } from "telegraf";
import { AppDataSource } from "../../config/data-source.js";

const ParentLink = () => AppDataSource.getRepository("ParentLink");
const Attendance = () => AppDataSource.getRepository("Attendance");
const Payment = () => AppDataSource.getRepository("Payment");

export function registerMyStudentsHandler(bot) {
  bot.hears("👨‍👩‍👧 O'quvchilarim", (ctx) => showStudentsList(ctx));
  bot.command("oquvchilarim", (ctx) => showStudentsList(ctx));

  bot.action(/^view_student:(.+)$/, async (ctx) => {
    const studentId = ctx.match[1];
    await showStudentDetails(ctx, studentId);
    await ctx.answerCbQuery();
  });
}

async function showStudentsList(ctx) {
  const chatId = String(ctx.chat.id);
  const links = await ParentLink().find({
    where: { telegramChatId: chatId },
    relations: { student: { group: true } },
  });

  if (links.length === 0) {
    await ctx.reply(
      "Sizga hali hech qanday o'quvchi bog'lanmagan. \"➕ Yangi o'quvchi qo'shish\" tugmasidan foydalaning."
    );
    return;
  }

  const buttons = links.map((l) => [
    Markup.button.callback(
      `${l.student.fullName} — ${l.student.group.name}`,
      `view_student:${l.student.id}`
    ),
  ]);

  await ctx.reply("Ma'lumotini ko'rmoqchi bo'lgan farzandingizni tanlang:", Markup.inlineKeyboard(buttons));
}

async function showStudentDetails(ctx, studentId) {
  const recentAttendance = await Attendance().find({
    where: { student: { id: studentId } },
    order: { date: "DESC" },
    take: 5,
  });

  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-07"
  const payment = await Payment().findOne({
    where: { student: { id: studentId }, month: currentMonth },
  });

  let text = "📋 Oxirgi 5 dars davomati:\n";
  if (recentAttendance.length === 0) {
    text += "— hali davomat belgilanmagan —\n";
  } else {
    const statusEmoji = { present: "✅", absent: "❌", excused: "🟡" };
    for (const a of recentAttendance) {
      let line = `${statusEmoji[a.status] || ""} ${a.date} — ${translateStatus(a.status)}`;
      if (a.lateMinutes) line += ` (${a.lateMinutes} daq kech)`;
      if (a.reason) line += ` — sabab: ${a.reason}`;
      text += line + "\n";
    }
  }

  text += "\n💳 Shu oy to'lovi:\n";
  if (!payment) {
    text += "— ma'lumot yo'q —";
  } else if (payment.status === "paid") {
    text += `✅ To'liq to'langan (${Number(payment.paidAmount).toLocaleString()} so'm)`;
  } else if (payment.status === "partial") {
    const debt = Number(payment.amount) - Number(payment.paidAmount);
    text += `🟡 Qisman to'langan. Qolgan qarz: ${debt.toLocaleString()} so'm`;
  } else {
    text += `🔴 To'lanmagan. Summasi: ${Number(payment.amount || 0).toLocaleString()} so'm`;
  }

  await ctx.reply(text);
}

function translateStatus(status) {
  return { present: "Keldi", absent: "Kelmadi", excused: "Sababli kelmadi" }[status] || status;
}