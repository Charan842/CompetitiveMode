import path from "path";
import fs from "fs/promises";
import { isNetlifyRuntime } from "../utils/runtime.js";

// POST /api/upload
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname || "");
    const filename = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    let fileUrl;

    if (isNetlifyRuntime()) {
      const { getStore } = await import("@netlify/blobs");
      const uploads = getStore("uploads");

      await uploads.set(filename, new Blob([req.file.buffer], { type: req.file.mimetype }), {
        metadata: {
          contentType: req.file.mimetype,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });

      fileUrl = `/uploads/${filename}`;
    } else {
      // Local dev — write buffer to disk
      await fs.mkdir("uploads", { recursive: true });
      await fs.writeFile(path.join("uploads", filename), req.file.buffer);
      fileUrl = `/uploads/${filename}`;
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
