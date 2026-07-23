import { In } from "typeorm";
import { groupRepository } from "../repositories/group.repository.js";

export const groupService = {
  async create(teacherId, { name, lessonTime, monthlyPrice, scheduleDays, paymentDay }) {
    const group = groupRepository.create({
      name,
      lessonTime,
      monthlyPrice,
      scheduleDays,
      paymentDay: paymentDay || 5,
      teacher: { id: teacherId },
    });
    return groupRepository.save(group);
  },

  // Dashboard/Guruhlar sahifasida faqat active va frozen ko'rsatiladi, archived - arxivda
  async findAllByTeacher(teacherId) {
    return groupRepository.find({
      where: { teacher: { id: teacherId }, status: In(["active", "frozen"]) },
      relations: { students: { payments: true } },
      order: { createdAt: "DESC" },
    });
  },

  async findArchived(teacherId) {
    return groupRepository.find({
      where: { teacher: { id: teacherId }, status: "archived" },
      relations: { students: true },
      order: { archivedAt: "DESC" },
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

  // ⋮ menyu - 1) Muzlatish: vaqtincha to'xtatiladi, arxivga tushmaydi, davomat/to'lov eslatmasi to'xtaydi
  async freeze(teacherId, groupId, reason) {
    const group = await this.findOne(teacherId, groupId);
    group.status = "frozen";
    group.frozenReason = reason || null;
    group.frozenAt = new Date();
    return groupRepository.save(group);
  },

  // Muzlatilgan guruhni qayta faol holatga qaytarish
  async unfreeze(teacherId, groupId) {
    const group = await this.findOne(teacherId, groupId);
    if (group.status !== "frozen") {
      throw new Error("Bu guruh muzlatilmagan");
    }
    group.status = "active";
    group.frozenReason = null;
    group.frozenAt = null;
    return groupRepository.save(group);
  },

  // ⋮ menyu - 2) Guruhni tugatish: butunlay yopiladi, arxivga tushadi, qaytarilmaydi
  async archive(teacherId, groupId) {
    const group = await this.findOne(teacherId, groupId);
    group.status = "archived";
    group.archivedAt = new Date();
    return groupRepository.save(group);
  },
};