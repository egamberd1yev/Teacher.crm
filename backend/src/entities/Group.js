import { EntitySchema } from "typeorm";

export const GroupEntity = new EntitySchema({
  name: "Group",
  tableName: "groups",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    name: {
      type: "varchar",
    },
    // Dars vaqti, masalan "15:00"
    lessonTime: {
      type: "varchar",
    },
    // Oylik narx (so'mda)
    monthlyPrice: {
      type: "decimal",
      precision: 12,
      scale: 2,
    },
    // Dars kunlari: ["Monday", "Wednesday", "Friday"]
    scheduleDays: {
      type: "simple-array", // TypeORM buni vergul bilan ajratilgan string sifatida saqlaydi
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    teacher: {
      type: "many-to-one",
      target: "Teacher",
      joinColumn: { name: "teacherId" },
      inverseSide: "groups",
      onDelete: "CASCADE",
    },
    students: {
      type: "one-to-many",
      target: "Student",
      inverseSide: "group",
    },
    attendances: {
      type: "one-to-many",
      target: "Attendance",
      inverseSide: "group",
    },
  },
});
