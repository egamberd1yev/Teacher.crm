import { attendanceRepository } from "../repositories/attendance.repository.js";
import { groupRepository } from "../repositories/group.repository.js";
import { studentRepository } from "../repositories/student.repository.js";
import { notifyAttendanceStatus, notifyLateArrival, notifyTeacherComment } from "../bot/notify.service.js";

export const attendanceService = {
  async getByGroupAndDate(teacherId, groupId, date) {
    const group = await groupRepository.findOne({
      where: { id: groupId, teacher: { id: teacherId } },
      relations: { students: true },
    });
    if (!group) throw new Error("Guruh topilmadi");

    const results = [];
    for (const student of group.students) {
      const record = await attendanceRepository.findOne({
        where: { student: { id: student.id }, group: { id: groupId }, date },
      });
      results.push({
        studentId: student.id,
        fullName: student.fullName,
        status: record ? record.status : null,
        reason: record ? record.reason : null,
        lateMinutes: record ? record.lateMinutes : null,
        comment: record ? record.comment : null,
      });
    }
    return results;
  },

  // Aniq holatni belgilash: "present" | "absent" | "excused" (+ ixtiyoriy sabab)
  async setStatus(teacherId, studentId, groupId, date, status, reason) {
    const student = await studentRepository.findOne({
      where: { id: studentId },
      relations: { group: { teacher: true } },
    });
    if (!student || student.group.teacher.id !== teacherId) {
      throw new Error("O'quvchi topilmadi");
    }

    let record = await attendanceRepository.findOne({
      where: { student: { id: studentId }, group: { id: groupId }, date },
    });

    if (!record) {
      record = attendanceRepository.create({
        student: { id: studentId },
        group: { id: groupId },
        date,
        status,
        reason: status === "excused" ? (reason || null) : null,
      });
    } else {
      record.status = status;
      record.reason = status === "excused" ? (reason || null) : null;
    }

    const saved = await attendanceRepository.save(record);

    // Ota-onaga bot orqali xabar (agar bog'langan bo'lsa)
    await notifyAttendanceStatus({
      student,
      group: student.group,
      status,
      reason: saved.reason,
    });

    return saved;
  },

  // Guruh sahifasida to'lov holati yonidagi "Kech qoldi" tugmasi uchun.
  // Ixtiyoriy - o'qituvchi xohlasa daqiqasini kiritadi.
  async setLateMinutes(teacherId, studentId, groupId, date, lateMinutes) {
    const student = await studentRepository.findOne({
      where: { id: studentId },
      relations: { group: { teacher: true } },
    });
    if (!student || student.group.teacher.id !== teacherId) {
      throw new Error("O'quvchi topilmadi");
    }

    let record = await attendanceRepository.findOne({
      where: { student: { id: studentId }, group: { id: groupId }, date },
    });

    if (!record) {
      // Kech qolgan bo'lsa demak keldi - shu sababdan status ham "present" qilib qo'yiladi
      record = attendanceRepository.create({
        student: { id: studentId },
        group: { id: groupId },
        date,
        status: "present",
      });
    }

    record.lateMinutes = lateMinutes;
    const saved = await attendanceRepository.save(record);

    await notifyLateArrival({
      student,
      group: student.group,
      lateMinutes,
    });

    return saved;
  },

  // O'qituvchining ixtiyoriy sharhi (davomat modalidan keyin yoki alohida)
  async setComment(teacherId, studentId, groupId, date, comment) {
    const student = await studentRepository.findOne({
      where: { id: studentId },
      relations: { group: { teacher: true } },
    });
    if (!student || student.group.teacher.id !== teacherId) {
      throw new Error("O'quvchi topilmadi");
    }

    let record = await attendanceRepository.findOne({
      where: { student: { id: studentId }, group: { id: groupId }, date },
    });
    if (!record) throw new Error("Avval davomat belgilanishi kerak");

    record.comment = comment;
    const saved = await attendanceRepository.save(record);

    if (comment) {
      await notifyTeacherComment({
        student,
        group: student.group,
        comment,
      });
    }

    return saved;
  },
};