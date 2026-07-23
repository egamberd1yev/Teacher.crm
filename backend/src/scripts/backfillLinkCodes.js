// Bir martalik skript: linkCode maydoni bo'sh bo'lgan barcha eski o'quvchilarga
// noyob kod generatsiya qilib to'ldiradi.
//
// Ishga tushirish: node src/scripts/backfillLinkCodes.js
//
// Buni server ishga tushishidan OLDIN, yoki server to'xtatilgan holatda
// bir marta ishga tushiring (keyin qayta ishga tushirish shart emas).

import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "../data-source.js";
import { generateUniqueLinkCode } from "../utils/generateLinkCode.js";

dotenv.config();

async function run() {
  await AppDataSource.initialize();
  const studentRepository = AppDataSource.getRepository("Student");

  const students = await studentRepository.find({
    where: { linkCode: null },
  });

  console.log(`${students.length} ta o'quvchida linkCode topilmadi. To'ldirilmoqda...`);

  for (const student of students) {
    student.linkCode = await generateUniqueLinkCode(student.fullName, studentRepository);
    await studentRepository.save(student);
    console.log(`✅ ${student.fullName} -> ${student.linkCode}`);
  }

  console.log("Tayyor!");
  await AppDataSource.destroy();
  process.exit(0);
}

run().catch((err) => {
  console.error("Skript xatosi:", err);
  process.exit(1);
});