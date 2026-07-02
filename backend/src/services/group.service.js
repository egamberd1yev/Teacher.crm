import { groupRepository } from "../repositories/group.repository.js";

export const groupService = {
  async create(teacherId, { name, lessonTime, monthlyPrice, scheduleDays }) {
    const group = groupRepository.create({
      name,
      lessonTime,
      monthlyPrice,
      scheduleDays,
      teacher: { id: teacherId },
    });
    return groupRepository.save(group);
  },

  async findAllByTeacher(teacherId) {
    return groupRepository.find({
      where: { teacher: { id: teacherId } },
      relations: { students: { payments: true } },
      order: { createdAt: "DESC" },
    });
  },

  async findOne(teacherId, groupId) {
    const group = await groupRepository.findOne({
      where: { id: groupId, teacher: { id: teacherId } },
      relations: { students: true },
    });
    if (!group) throw new Error("Guruh topilmadi");
    return group;
  },

  async update(teacherId, groupId, data) {
    await this.findOne(teacherId, groupId); // egalik tekshiruvi
    await groupRepository.update(groupId, data);
    return groupRepository.findOneBy({ id: groupId });
  },

  async remove(teacherId, groupId) {
    await this.findOne(teacherId, groupId); // egalik tekshiruvi
    return groupRepository.delete(groupId);
  },
};
