import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import groupRoutes from "./routes/group.routes.js";
import studentRoutes from "./routes/student.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";

const app = express();

// CORS sozlamasi
// CORS_ORIGIN env variable'da vergul bilan ajratilgan URL'lar yoziladi
// Masalan: https://repetitor-crm.vercel.app,https://repetitor-crm-git-main.vercel.app
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman yoki server-to-server so'rovlar uchun (origin yo'q)
      if (!origin) return callback(null, true);

      // Vercel preview URL'larini ham ruxsat berish (*.vercel.app)
      if (origin.endsWith(".vercel.app")) return callback(null, true);

      // Ro'yxatdagi URL'larni tekshirish
      if (allowedOrigins.includes(origin)) return callback(null, true);

      callback(new Error(`CORS: ${origin} ruxsat etilmagan`));
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/attendance", attendanceRoutes);

// Health check — Railway shu route'ni tekshiradi
app.get("/", (req, res) => {
  res.json({ message: "Repetitor CRM API ishlayapti", status: "ok" });
});

export default app;