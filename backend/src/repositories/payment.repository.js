import { AppDataSource } from "../data-source.js";

export const paymentRepository = AppDataSource.getRepository("Payment");
