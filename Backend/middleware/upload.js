import multer from "multer";
import path from "path";
import { isNetlifyRuntime } from "../utils/runtime.js";

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const storage = isNetlifyRuntime() ? multer.memoryStorage() : diskStorage;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
