import { AppDataSource } from "../data-source.js";

export const teacherRepository = AppDataSource.getRepository("Teacher");
