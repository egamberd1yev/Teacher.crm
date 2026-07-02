import { Router } from "express";
import { groupController } from "../controllers/group.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", groupController.create);
router.get("/", groupController.findAll);
router.get("/:id", groupController.findOne);
router.put("/:id", groupController.update);
router.delete("/:id", groupController.remove);

export default router;
