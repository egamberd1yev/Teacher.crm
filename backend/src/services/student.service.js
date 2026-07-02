import { studentRepository } from "../repositories/student.repository.js";
import { groupRepository } from "../repositories/group.repository.js";

async function assertGroupOwnership(teacherId, groupId) {
  const group = await groupRepository.findOne({
    where: { id: groupId, teacher: { id: teacherId } },
  });
  if (!group) throw new Error("Guruh topilmadi yoki sizga tegishli emas");
  return group;
}

export const studentService = {
  async create(teacherId, groupId, { fullName, phone }) {
    await assertGroupOwnership(teacherId, groupId);
    const student = studentRepository.create({
      fullName,
      phone,
      group: { id: groupId },
    });
    return studentRepository.save(student);
  },

  async findAllByGroup(teacherId, groupId) {
    await assertGroupOwnership(teacherId, groupId);
    return studentRepository.find({
      where: { group: { id: groupId } },
      relations: { payments: true },
      order: { fullName: "ASC" },
    });
  },

  async update(teacherId, studentId, data) {
    const student = await studentRepository.findOne({
      where: { id: studentId },
      relations: { group: { teacher: true } },
    });
    if (!student || student.group.teacher.id !== teacherId) {
      throw new Error("O'quvchi topilmadi");
    }
    await studentRepository.update(studentId, data);
    return studentRepository.findOneBy({ id: studentId });
  },

  async remove(teacherId, studentId) {
    const student = await studentRepository.findOne({
      where: { id: studentId },
      relations: { group: { teacher: true } },
    });
    if (!student || student.group.teacher.id !== teacherId) {
      throw new Error("O'quvchi topilmadi");
    }
    return studentRepository.delete(studentId);
  },
};
