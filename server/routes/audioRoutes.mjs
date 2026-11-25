import express from "express";
import multer from "multer";
import { uploadAudioToDrive, listAudioFromDrive, getAssetStreamFromDrive, } from "../driveService.mjs";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/audio
router.get("/", async (req, res) => {
  try {
    const audioFiles = await listAudioFromDrive();
    res.json(audioFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load audio files" });
  }
});

// GET /api/audio/:id
router.get("/:id", async (req, res) => {
  try {
    const { stream, mimeType } = await getAssetStreamFromDrive(req.params.id);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load audio" });
  }
});

// POST /api/audio
router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const driveFile = await uploadAudioToDrive(req.file);

    res.status(201).json({
      _id: driveFile.id,
      driveFileId: driveFile.id,
      name: driveFile.name,
      mimeType: driveFile.mimeType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not upload audio" });
  }
});

export default router;