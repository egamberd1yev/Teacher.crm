import { Router } from "express";
import { groupController } from "../controllers/group.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", groupController.create);
router.get("/", groupController.findAll);
router.get("/archived/list", groupController.findArchived);
router.get("/:id", groupController.findOne);
router.put("/:id", groupController.update);
router.delete("/:id", groupController.remove);
router.patch("/:id/freeze", groupController.freeze);
router.patch("/:id/unfreeze", groupController.unfreeze);
router.patch("/:id/archive", groupController.archive);

export default router;