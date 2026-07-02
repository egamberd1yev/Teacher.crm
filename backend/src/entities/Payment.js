import { EntitySchema } from "typeorm";

export const PaymentEntity = new EntitySchema({
  name: "Payment",
  tableName: "payments",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    // Qaysi oy uchun, masalan "2026-06"
    month: {
      type: "varchar",
    },
    status: {
      type: "enum",
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    amount: {
      type: "decimal",
      precision: 12,
      scale: 2,
      nullable: true,
    },
    paidAt: {
      type: "timestamp",
      nullable: true,
    },
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "Student",
      joinColumn: { name: "studentId" },
      inverseSide: "payments",
      onDelete: "CASCADE",
    },
  },
  uniques: [
    {
      name: "unique_student_month",
      columns: ["student", "month"],
    },
  ],
});
