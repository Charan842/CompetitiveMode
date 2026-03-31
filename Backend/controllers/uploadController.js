// POST /api/upload — convert image buffer to base64 data URI and return it
// The data URI is stored directly in MongoDB (no GridFS, no disk, no CDN needed)
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const base64 = req.file.buffer.toString("base64");
    const fileUrl = `data:${req.file.mimetype};base64,${base64}`;

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
