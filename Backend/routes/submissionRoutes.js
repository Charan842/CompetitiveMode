import { Router } from "express";
import {
  createSubmission,
  getSubmissionsByTask,
  getMySubmissions,
  getTrackingByTask,
  lockSubmissions,
} from "../controllers/submissionController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.post("/", createSubmission);
router.get("/task/:taskId", getSubmissionsByTask);
router.get("/my/:taskId", getMySubmissions);
router.get("/tracking/:taskId", getTrackingByTask);
router.patch("/lock/:taskId", lockSubmissions);

export default router;
