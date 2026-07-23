import { Router } from "express";
import { attendanceController } from "../controllers/attendance.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/group/:groupId", attendanceController.getByGroupAndDate);
router.patch("/student/:studentId/status", attendanceController.setStatus);
router.patch("/student/:studentId/late", attendanceController.setLate);
router.patch("/student/:studentId/comment", attendanceController.setComment);

export default router;