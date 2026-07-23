import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { TeacherEntity } from "./entities/Teacher.js";
import { GroupEntity } from "./entities/Group.js";
import { StudentEntity } from "./entities/Student.js";
import { PaymentEntity } from "./entities/Payment.js";
import { AttendanceEntity } from "./entities/Attendance.js";
import { ParentLinkEntity } from "./entities/ParentLink.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,

  logging: false,

  entities: [
    TeacherEntity,
    GroupEntity,
    StudentEntity,
    PaymentEntity,
    AttendanceEntity,
    ParentLinkEntity,
  ],

  // Railway PostgreSQL SSL talab qiladi
  ssl: process.env.DATABASE_URL?.includes("railway")
    ? { rejectUnauthorized: false }
    : process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});