import express from "express";
import multer from "multer";
import Image from "../models/Image.mjs";
import { uploadAssetToDrive, getAssetStreamFromDrive, listImagesFromDrive } from '../driveService.mjs';



const router = express.Router();
const upload = multer({ storage: multer.memoryStorage()});

// GET /api/images
// Returns image metadata for the picker
router.get("/", async (req, res) => {
  try {
    // const images = await Image.find().sort({createdAt: -1});

    const images = await listImagesFromDrive();
 
    res.json(images);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load images" });
  }
});

// GET /api/images/:id
// Returns the actual image file
router.get("/:id", async (req, res) => {
  try {
    const {stream, mimeType} = await getAssetStreamFromDrive(req.params.id);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    stream.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load image" });
  }
});

// Upload image
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const driveFile = await uploadAssetToDrive(req.file);

  
    const image = await Image.create({
      name: driveFile.name,
      driveFileId: driveFile.id,
      mimeType: driveFile.mimeType,
    });

    res.status(201).json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not upload image" });
  }
});


export default router;