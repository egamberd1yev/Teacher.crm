import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database ulanish muvaffaqiyatli");
    app.listen(PORT, () => {
      console.log(`Server ${PORT} portda ishlayapti`);
    });
  })
  .catch((error) => {
    console.error("Database ulanishda xatolik:", error);
  });
