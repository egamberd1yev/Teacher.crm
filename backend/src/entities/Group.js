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
    // Oyning qaysi kuni to'lov muddati, masalan 5 (har oy 5-sanasi)
    paymentDay: {
      type: "int",
      default: 5,
    },
    // active   - guruh faol, hammasi ishlaydi
    // frozen   - vaqtincha to'xtatilgan, davomat/to'lov eslatmasi to'xtaydi, lekin ro'yxatda ko'rinadi
    // archived - butunlay tugatilgan, ro'yxatdan yashiriladi, arxivga tushadi
    status: {
      type: "enum",
      enum: ["active", "frozen", "archived"],
      default: "active",
    },
    // Muzlatilganda sabab (ixtiyoriy)
    frozenReason: {
      type: "varchar",
      nullable: true,
    },
    frozenAt: {
      type: "timestamp",
      nullable: true,
    },
    archivedAt: {
      type: "timestamp",
      nullable: true,
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