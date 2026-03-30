import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.post("/send", sendMessage);
router.get("/:matchId", getMessages);

export default router;
