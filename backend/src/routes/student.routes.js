import { Router } from "express";
import { studentController } from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/group/:groupId", studentController.create);
router.get("/group/:groupId", studentController.findAllByGroup);
router.put("/:id", studentController.update);
router.delete("/:id", studentController.remove);

export default router;
