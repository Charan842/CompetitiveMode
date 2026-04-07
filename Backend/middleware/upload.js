import multer from "multer";

// Always use memory storage — disk is not available on serverless runtimes.
// The controller is responsible for persisting req.file.buffer.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB — base64 adds ~33%, stays under 10mb JSON limit
});

export default upload;
