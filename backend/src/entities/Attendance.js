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
    // Dars sanasi, masalan "2026-06-24"
    date: {
      type: "date",
    },
    status: {
      type: "enum",
      enum: ["present", "absent"],
      default: "absent",
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
