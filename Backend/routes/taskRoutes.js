import { Router } from "express";
import {
  createTask,
  getTasksByMatch,
  getTask,
  getTodayTask,
  getTemplates,
  getAllSubmissions,
  deleteTask,
} from "../controllers/taskController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.post("/", createTask);
router.get("/templates", getTemplates);
router.get("/match/:matchId", getTasksByMatch);
router.get("/today/:matchId", getTodayTask);
router.get("/:taskId/all-submissions", getAllSubmissions);
router.get("/:id", getTask);
router.delete("/:id", deleteTask);

export default router;
