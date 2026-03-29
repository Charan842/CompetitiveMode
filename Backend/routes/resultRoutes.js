import { Router } from "express";
import {
  computeResult,
  getResultByTask,
  getResultsByMatch,
} from "../controllers/resultController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.post("/compute/:taskId", computeResult);
router.get("/task/:taskId", getResultByTask);
router.get("/match/:matchId", getResultsByMatch);

export default router;
