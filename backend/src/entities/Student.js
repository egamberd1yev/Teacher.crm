import { EntitySchema } from "typeorm";

export const StudentEntity = new EntitySchema({
  name: "Student",
  tableName: "students",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    fullName: {
      type: "varchar",
    },
    phone: {
      type: "varchar",
      nullable: true,
    },
    // Ota-ona botda shu kod orqali farzandini bog'laydi. Masalan "AH3921"
    // nullable: true - chunki eski o'quvchilarda bu ustun hali bo'sh bo'ladi,
    // backfill skripti orqali to'ldiriladi (pastga qarang)
    linkCode: {
      type: "varchar",
      unique: true,
      nullable: true,
    },
    joinedAt: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    group: {
      type: "many-to-one",
      target: "Group",
      joinColumn: { name: "groupId" },
      inverseSide: "students",
      onDelete: "CASCADE",
    },
    payments: {
      type: "one-to-many",
      target: "Payment",
      inverseSide: "student",
    },
    attendances: {
      type: "one-to-many",
      target: "Attendance",
      inverseSide: "student",
    },
    parentLinks: {
      type: "one-to-many",
      target: "ParentLink",
      inverseSide: "student",
    },
  },
});