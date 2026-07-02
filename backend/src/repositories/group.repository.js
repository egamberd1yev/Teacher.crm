import { AppDataSource } from "../data-source.js";

export const groupRepository = AppDataSource.getRepository("Group");
