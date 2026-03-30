import { Router } from "express";
import { uploadFile, serveFile } from "../controllers/uploadController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/", auth, upload.single("file"), uploadFile);
router.get("/:filename", serveFile); // public — serves images from GridFS

export default router;
