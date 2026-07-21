import cron from "node-cron";
import { AppDataSource } from "../config/data-source.js";
import { notifyPaymentReminder } from "../bot/notify.service.js";

const Group = () => AppDataSource.getRepository("Group");
const Payment = () => AppDataSource.getRepository("Payment");

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function currentMonthKey(date) {
  return date.toISOString().slice(0, 7); // "2026-07"
}

function isSameDay(a, b) {
  return a && new Date(a).toDateString() === b.toDateString();
}

async function runReminderCheck() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayDay = today.getDate();
  const tomorrowDay = tomorrow.getDate();
  const todayWeekday = WEEKDAY_NAMES[today.getDay()];
  const monthKey = currentMonthKey(today);

  const activeGroups = await Group().find({
    where: { status: "active" },
    relations: { students: true },
  });

  for (const group of activeGroups) {
    // 1) Ertaga to'lov kuni bo'ladigan guruhlar uchun "1 kun oldin" eslatmasi
    const isDueTomorrow = tomorrowDay === group.paymentDay;

    // 2) To'lov kunidan 3+ kun o'tgan va bugun dars kuni bo'lsa - qarzdorlik eslatmasi
    const daysSincePaymentDay = todayDay - group.paymentDay;
    const isOverdueReminderDay = daysSincePaymentDay >= 3 && group.scheduleDays.includes(todayWeekday);

    if (!isDueTomorrow && !isOverdueReminderDay) continue;

    for (const student of group.students) {
      let payment = await Payment().findOne({
        where: { student: { id: student.id }, month: monthKey },
      });

      if (!payment) {
        // Bu oy uchun hali to'lov yozuvi yaratilmagan - narxni guruhdan olamiz
        payment = Payment().create({
          student: { id: student.id },
          month: monthKey,
          amount: group.monthlyPrice,
          paidAmount: 0,
          status: "unpaid",
        });
        payment = await Payment().save(payment);
      }

      if (payment.status === "paid") continue; // to'liq to'langan - eslatma kerak emas

      // Kunda bir martadan ortiq yubormaslik
      if (isSameDay(payment.lastReminderSentAt, today)) continue;

      const debtAmount = Number(payment.amount) - Number(payment.paidAmount);
      if (debtAmount <= 0) continue;

      await notifyPaymentReminder({
        student,
        group,
        debtAmount,
        isDueTomorrow,
      });

      payment.lastReminderSentAt = today;
      await Payment().save(payment);
    }
  }
}

export function startPaymentReminderJob() {
  const cronExpr = process.env.PAYMENT_REMINDER_CRON || "0 9 * * *"; // har kuni 09:00
  cron.schedule(cronExpr, () => {
    runReminderCheck().catch((err) => console.error("To'lov eslatma job xatosi:", err));
  });
  console.log(`To'lov eslatma job ishga tushdi (cron: ${cronExpr})`);
}

// Test yoki qo'lda ishga tushirish uchun
export { runReminderCheck };