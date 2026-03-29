import path from "path";
import { isNetlifyRuntime } from "../utils/runtime.js";

// POST /api/upload
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let fileUrl;

    if (isNetlifyRuntime()) {
      const { getStore } = await import("@netlify/blobs");
      const uploads = getStore("uploads");
      const ext = path.extname(req.file.originalname || "");
      const blobKey = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      await uploads.set(blobKey, new Blob([req.file.buffer], { type: req.file.mimetype }), {
        metadata: {
          contentType: req.file.mimetype,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });

      fileUrl = `/uploads/${blobKey}`;
    } else {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    res.status(201).json({
      message: "File uploaded successfully",
      fileUrl,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
};
