import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { TeacherEntity } from "./entities/Teacher.js";
import { GroupEntity } from "./entities/Group.js";
import { StudentEntity } from "./entities/Student.js";
import { PaymentEntity } from "./entities/Payment.js";
import { AttendanceEntity } from "./entities/Attendance.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== "production",
  logging: false,
  entities: [TeacherEntity, GroupEntity, StudentEntity, PaymentEntity, AttendanceEntity],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
