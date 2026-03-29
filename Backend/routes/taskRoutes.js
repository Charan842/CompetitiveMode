import { Router } from "express";
import {
  createTask,
  getTasksByMatch,
  getTask,
  getTodayTask,
  getTemplates,
} from "../controllers/taskController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.post("/", createTask);
router.get("/templates", getTemplates);
router.get("/match/:matchId", getTasksByMatch);
router.get("/today/:matchId", getTodayTask);
router.get("/:id", getTask);

export default router;
