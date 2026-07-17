import { Router } from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.patch("/student/:studentId/toggle", paymentController.toggleStatus);
router.get("/group/:groupId/summary", paymentController.getGroupSummary);
router.patch("/student/:studentId/amount", paymentController.setAmount);
router.get("/group/:groupId/summary", paymentController.getGroupSummary);

export default router;
