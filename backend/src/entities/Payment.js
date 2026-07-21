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
    // unpaid  - hali umuman to'lanmagan
    // partial - qisman to'langan, qarz qoldi
    // paid    - to'liq to'langan
    status: {
      type: "enum",
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    // Shu oy uchun jami to'lanishi kerak bo'lgan summa (guruh narxidan olinadi)
    amount: {
      type: "decimal",
      precision: 12,
      scale: 2,
      nullable: true,
    },
    // Hozirgacha to'langan summa
    paidAmount: {
      type: "decimal",
      precision: 12,
      scale: 2,
      default: 0,
    },
    paidAt: {
      type: "timestamp",
      nullable: true,
    },
    // Eslatma botlari oxirgi marta qachon yuborilgani (har kuni bittadan ortiq yubormaslik uchun)
    lastReminderSentAt: {
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