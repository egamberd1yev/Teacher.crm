import { paymentRepository } from "../repositories/payment.repository.js";
import { studentRepository } from "../repositories/student.repository.js";
import { groupRepository } from "../repositories/group.repository.js";

export const paymentService = {
  // O'quvchi ismi ustiga bosilganda - shu oy uchun tolov holatini olish yoki yaratish
  async getOrCreate(studentId, month) {
    let payment = await paymentRepository.findOne({
      where: { student: { id: studentId }, month },
    });
    if (!payment) {
      payment = paymentRepository.create({
        student: { id: studentId },
        month,
        status: "unpaid",
      });
      await paymentRepository.save(payment);
    }
    return payment;
  },

  // To'ladi / to'lamadi holatini almashtirish
  async toggleStatus(teacherId, studentId, month) {
    const student = await studentRepository.findOne({
      where: { id: studentId },
      relations: { group: { teacher: true } },
    });
    if (!student || student.group.teacher.id !== teacherId) {
      throw new Error("O'quvchi topilmadi");
    }

    const payment = await this.getOrCreate(studentId, month);
    const newStatus = payment.status === "paid" ? "unpaid" : "paid";

    await paymentRepository.update(payment.id, {
      status: newStatus,
      amount: newStatus === "paid" ? student.group.monthlyPrice : null,
      paidAt: newStatus === "paid" ? new Date() : null,
    });

    return paymentRepository.findOneBy({ id: payment.id });
  },

  // Guruh bo'yicha oylik statistika: kutilayotgan summa, yig'ilgan summa, qarzdorlar
  async getGroupSummary(teacherId, groupId, month) {
    const group = await groupRepository.findOne({
      where: { id: groupId, teacher: { id: teacherId } },
      relations: { students: true },
    });
    if (!group) throw new Error("Guruh topilmadi");

    const expectedTotal = Number(group.monthlyPrice) * group.students.length;

    let collectedTotal = 0;
    const debtors = [];

    for (const student of group.students) {
      const payment = await paymentRepository.findOne({
        where: { student: { id: student.id }, month },
      });
      if (payment && payment.status === "paid") {
        collectedTotal += Number(payment.amount || group.monthlyPrice);
      } else {
        debtors.push({ id: student.id, fullName: student.fullName });
      }
    }

    return {
      groupId: group.id,
      groupName: group.name,
      month,
      expectedTotal,
      collectedTotal,
      debtorsCount: debtors.length,
      debtors,
    };
  },

  // Summani qo'lda kiritish (qisman yoki to'liq to'lov)
  async setAmount(teacherId, studentId, month, amount) {
    const student = await studentRepository.findOne({
      where: { id: studentId },
      relations: { group: { teacher: true } },
    });
    if (!student || student.group.teacher.id !== teacherId) {
      throw new Error("O'quvchi topilmadi");
    }

    const payment = await this.getOrCreate(studentId, month);
    const numAmount = Number(amount) || 0;
    const status = numAmount >= Number(student.group.monthlyPrice) ? "paid" : "unpaid";

    await paymentRepository.update(payment.id, {
      amount: numAmount,
      status,
      paidAt: status === "paid" ? new Date() : null,
    });

    return paymentRepository.findOneBy({ id: payment.id });
  },

  // "To'lovlar" sahifasi uchun - barcha o'quvchilar shu oy bo'yicha
  async getAllForMonth(teacherId, month) {
    const groups = await groupRepository.find({
      where: { teacher: { id: teacherId } },
      relations: { students: true },
    });

    const result = [];
    for (const group of groups) {
      for (const student of group.students) {
        const payment = await paymentRepository.findOne({
          where: { student: { id: student.id }, month },
        });
        const amount = Number(payment?.amount || 0);
        const price  = Number(group.monthlyPrice);

        let state;
        if (amount <= 0) state = "unpaid";
        else if (amount < price) state = "partial";
        else state = "paid";

        result.push({
          studentId: student.id,
          fullName: student.fullName,
          phone: student.phone,
          groupId: group.id,
          groupName: group.name,
          monthlyPrice: price,
          amount,
          state,
        });
      }
    }
    return result;
  },
};