import { attendanceRepository } from "../repositories/attendance.repository.js";
import { groupRepository } from "../repositories/group.repository.js";
import { studentRepository } from "../repositories/student.repository.js";

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

    return attendanceRepository.save(record);
  },
};