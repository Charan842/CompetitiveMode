import { GridFSBucket } from "mongodb";
import { Readable } from "stream";
import mongoose from "mongoose";
import path from "path";

const BUCKET = "uploads";

const getBucket = () =>
  new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });

// POST /api/upload
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname || "");
    const filename = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    await new Promise((resolve, reject) => {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
      });
      Readable.from(req.file.buffer)
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    res.status(201).json({
      message: "File uploaded successfully",
      fileUrl: `/api/upload/${filename}`,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/upload/:filename — stream image from GridFS (public, no auth)
export const serveFile = async (req, res, next) => {
  try {
    const bucket = getBucket();
    const files = await bucket
      .find({ filename: req.params.filename })
      .toArray();

    if (!files.length) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set("Content-Type", files[0].contentType || "application/octet-stream");
    res.set("Cache-Control", "public, max-age=31536000, immutable");

    bucket.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (error) {
    next(error);
  }
};
