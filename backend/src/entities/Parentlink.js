import { EntitySchema } from "typeorm";

// Bir ota-ona (bitta telegramChatId) bir nechta o'quvchiga bog'lanishi mumkin
// (masalan bir nechta farzandi turli guruhlarda o'qisa)
export const ParentLinkEntity = new EntitySchema({
  name: "ParentLink",
  tableName: "parent_links",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    telegramChatId: {
      type: "varchar",
    },
    // Bot ichida ko'rsatish uchun (agar telegram profilida bo'lsa)
    parentFirstName: {
      type: "varchar",
      nullable: true,
    },
    linkedAt: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "Student",
      joinColumn: { name: "studentId" },
      inverseSide: "parentLinks",
      onDelete: "CASCADE",
    },
  },
  uniques: [
    {
      // Bitta ota-ona bitta o'quvchiga faqat bir marta bog'lanadi
      name: "unique_chat_student",
      columns: ["telegramChatId", "student"],
    },
  ],
});