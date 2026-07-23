import { Markup } from "telegraf";
import { parentLinkRepository } from "../../repositories/parentLink.repository.js";
import { attendanceRepository } from "../../repositories/attendance.repository.js";
import { paymentRepository } from "../../repositories/payment.repository.js";
import { studentRepository } from "../../repositories/student.repository.js";

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
  const links = await parentLinkRepository.find({
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
  const student = await studentRepository.findOne({
    where: { id: studentId },
    relations: { group: true },
  });
  if (!student) {
    await ctx.reply("O'quvchi topilmadi.");
    return;
  }

  const recentAttendance = await attendanceRepository.find({
    where: { student: { id: studentId } },
    order: { date: "DESC" },
    take: 5,
  });

  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-07"
  const payment = await paymentRepository.findOne({
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

  const price = Number(student.group.monthlyPrice);
  const paidSoFar = Number(payment?.amount || 0);
  const debt = price - paidSoFar;

  text += "\n💳 Shu oy to'lovi:\n";
  if (!payment || payment.status === "unpaid") {
    text += `🔴 To'lanmagan. Summasi: ${price.toLocaleString()} so'm`;
  } else if (payment.status === "partial") {
    text += `🟡 Qisman to'langan (${paidSoFar.toLocaleString()} so'm). Qolgan qarz: ${debt.toLocaleString()} so'm`;
  } else {
    text += `✅ To'liq to'langan (${paidSoFar.toLocaleString()} so'm)`;
  }

  await ctx.reply(text);
}

function translateStatus(status) {
  return { present: "Keldi", absent: "Kelmadi", excused: "Sababli kelmadi" }[status] || status;
}