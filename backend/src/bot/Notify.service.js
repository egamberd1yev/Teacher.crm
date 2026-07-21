import { AppDataSource } from "../config/data-source.js";
import { getBot } from "./bot.js";

const ParentLink = () => AppDataSource.getRepository("ParentLink");

async function sendToStudentParents(studentId, text) {
  const links = await ParentLink().find({ where: { student: { id: studentId } } });
  if (links.length === 0) return; // bu o'quvchiga ota-ona hali bog'lanmagan

  const bot = getBot();
  for (const link of links) {
    try {
      await bot.telegram.sendMessage(link.telegramChatId, text);
    } catch (err) {
      // Masalan ota-ona botni bloklagan bo'lishi mumkin - butun jarayonni to'xtatmaslik kerak
      console.error(`Botga xabar yuborilmadi (chatId: ${link.telegramChatId}):`, err.message);
    }
  }
}

const STATUS_TEXT = {
  present: (student, groupName) => `✅ ${student.fullName} bugun "${groupName}" darsiga keldi.`,
  absent: (student, groupName) => `❌ ${student.fullName} bugun "${groupName}" darsiga kelmadi.`,
  excused: (student, groupName, reason) =>
    `🟡 ${student.fullName} bugun "${groupName}" darsiga kelmadi. Sabab: ${reason || "ko'rsatilmagan"}`,
};

// attendance.service.js dagi setStatus funksiyasidan status o'zgargach chaqiriladi
export async function notifyAttendanceStatus({ student, group, status, reason }) {
  const builder = STATUS_TEXT[status];
  if (!builder) return;
  const text = builder(student, group.name, reason);
  await sendToStudentParents(student.id, text);
}

// O'qituvchi kech qolish daqiqasini kiritganda chaqiriladi
export async function notifyLateArrival({ student, group, lateMinutes }) {
  const text = `⏰ ${student.fullName} "${group.name}" darsiga ${lateMinutes} daqiqa kech qoldi.`;
  await sendToStudentParents(student.id, text);
}

// O'qituvchi ixtiyoriy sharh yozganda chaqiriladi
export async function notifyTeacherComment({ student, group, comment }) {
  const text = `💬 "${group.name}" guruhi bo'yicha izoh:\n${comment}`;
  await sendToStudentParents(student.id, text);
}

// Har kunlik cron job orqali chaqiriladi (pastga qarang: jobs/paymentReminder.job.js)
export async function notifyPaymentReminder({ student, group, debtAmount, isDueTomorrow }) {
  const formattedAmount = Number(debtAmount).toLocaleString();
  const text = isDueTomorrow
    ? `📅 Eslatma: ertaga "${group.name}" guruhi uchun to'lov muddati keladi. Summasi: ${formattedAmount} so'm.`
    : `⚠️ "${group.name}" guruhi uchun to'lov muddati o'tgan. Joriy qarz: ${formattedAmount} so'm.`;
  await sendToStudentParents(student.id, text);
}

// To'lov to'liq yoki qisman qabul qilinganda chaqiriladi
export async function notifyPaymentReceived({ student, group, paidAmount, remainingDebt }) {
  let text;
  if (remainingDebt <= 0) {
    text = `✅ "${group.name}" guruhi uchun to'lov qabul qilindi. Rahmat!`;
  } else {
    text = `✅ "${group.name}" guruhi uchun ${Number(paidAmount).toLocaleString()} so'm to'lov qabul qilindi.\n🔴 Qolgan qarz: ${Number(
      remainingDebt
    ).toLocaleString()} so'm.`;
  }
  await sendToStudentParents(student.id, text);
}