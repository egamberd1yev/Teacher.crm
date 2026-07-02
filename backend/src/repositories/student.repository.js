import { AppDataSource } from "../data-source.js";

export const studentRepository = AppDataSource.getRepository("Student");
