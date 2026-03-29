import { Router } from "express";
import {
  createMatch,
  getMyMatches,
  getMatch,
  toggleTurn,
  searchUsers,
  getMatchStats,
  setConstraint,
  getActivityHeatmap,
  disposeMatch,
} from "../controllers/matchController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth); // all match routes require authentication

router.post("/", createMatch);
router.get("/", getMyMatches);
router.get("/search-users", searchUsers);
router.get("/:id", getMatch);
router.get("/:id/stats", getMatchStats);
router.get("/:id/activity", getActivityHeatmap);
router.patch("/:id/toggle-turn", toggleTurn);
router.patch("/:id/constraint", setConstraint);
router.delete("/:id", disposeMatch);

export default router;
