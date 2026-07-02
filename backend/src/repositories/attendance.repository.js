import { AppDataSource } from "../data-source.js";

export const attendanceRepository = AppDataSource.getRepository("Attendance");
