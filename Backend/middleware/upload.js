import multer from "multer";

// Always use memory storage — disk is not available on serverless runtimes.
// The controller is responsible for persisting req.file.buffer.
const storage = multer.memoryStorage();

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
