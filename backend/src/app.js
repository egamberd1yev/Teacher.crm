import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import groupRoutes from "./routes/group.routes.js";
import studentRoutes from "./routes/student.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";

const app = express();


const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (origin.endsWith(".vercel.app")) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      callback(new Error(`CORS: ${origin} ruxsat etilmagan`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Repetitor CRM API ishlayapti", status: "ok" });
});

export default app;