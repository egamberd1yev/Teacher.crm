import { EntitySchema } from "typeorm";

export const AttendanceEntity = new EntitySchema({
  name: "Attendance",
  tableName: "attendances",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    date: {
      type: "date",
    },
    status: {
      type: "enum",
      enum: ["present", "absent", "excused"],
      default: "absent",
    },
    reason: {
      type: "varchar",
      nullable: true,
    },
    // O'qituvchi ixtiyoriy ravishda kech qolish daqiqasini kiritadi (masalan 15)
    lateMinutes: {
      type: "int",
      nullable: true,
    },
    // O'qituvchining ixtiyoriy sharhi, ota-onaga botda yuboriladi
    comment: {
      type: "text",
      nullable: true,
    },
    // Ota-onaga davomat xabari yuborilganini belgilash (qayta yubormaslik uchun)
    notifiedAt: {
      type: "timestamp",
      nullable: true,
    },
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "Student",
      joinColumn: { name: "studentId" },
      inverseSide: "attendances",
      onDelete: "CASCADE",
    },
    group: {
      type: "many-to-one",
      target: "Group",
      joinColumn: { name: "groupId" },
      inverseSide: "attendances",
      onDelete: "CASCADE",
    },
  },
  uniques: [
    {
      name: "unique_student_date",
      columns: ["student", "date"],
    },
  ],
});