import { attendanceRepository } from "../repositories/attendance.repository.js";
import { groupRepository } from "../repositories/group.repository.js";
import { studentRepository } from "../repositories/student.repository.js";

export const attendanceService = {
  // Kalendarda sana bosilganda - shu guruh + sana uchun barcha o'quvchilarning holati
  async getByGroupAndDate(teacherId, groupId, date) {
    const group = await groupRepository.findOne({
      where: { id: groupId, teacher: { id: teacherId } },
      relations: { students: true },
    });
    if (!group) throw new Error("Guruh topilmadi");

    const results = [];
    for (const student of group.students) {
      let record = await attendanceRepository.findOne({
        where: { student: { id: student.id }, group: { id: groupId }, date },
      });
      if (!record) {
        // Hali belgilanmagan - standart holat "absent" sifatida ko'rsatiladi, lekin bazaga yozilmaydi
        results.push({ studentId: student.id, fullName: student.fullName, status: null });
      } else {
        results.push({ studentId: student.id, fullName: student.fullName, status: record.status });
      }
    }
    return results;
  },

  // Keldi/kelmadi holatini almashtirish (yo'q bo'lsa yaratadi)
  async toggleStatus(teacherId, studentId, groupId, date) {
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
        status: "present",
      });
    } else {
      record.status = record.status === "present" ? "absent" : "present";
    }

    return attendanceRepository.save(record);
  },
};
