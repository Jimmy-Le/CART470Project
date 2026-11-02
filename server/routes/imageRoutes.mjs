import express from "express";
import multer from "multer";
import Image from "../models/Image.mjs";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage()});

// GET /api/images
// Returns image metadata for the picker
router.get("/", async (req, res) => {
  try {
    const images = await Image.find(
      {},
      {
        name: 1,
        fileName: 1,
        contentType: 1,
        createdAt: 1,
      }
    );

    const formattedImages = images.map((image) => ({
      _id: image._id.toString(),
      name: image.name,
      fileName: image.fileName,
      contentType: image.contentType,
      url: `/api/images/${image._id.toString()}`,
    }));

    res.json(formattedImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load images" });
  }
});

// GET /api/images/:id
// Returns the actual image file
router.get("/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.set("Content-Type", image.contentType);
    res.send(image.data);
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

    const image = await Image.create({
      name: req.body.name || file.originalname,
      fileName: file.originalname,
      contentType: file.mimetype,
      data: file.buffer,
    });

    res.status(201).json({
      _id: image._id.toString(),
      name: image.name,
      url: `/api/images/${image._id.toString()}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not upload image" });
  }
});


// UPDATE an existing island
router.put("/:id", async (req, res) => {
  try {
    const { _id, ...islandData } = req.body;

    const updatedIsland = await Island.findByIdAndUpdate(
      req.params.id,
      { $set: islandData },
      { new: true, runValidators: true }
    );

    if (!updatedIsland) {
      return res.status(404).json({ error: "Island or Image not found" });
    }

    res.json(updatedIsland);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Could not update island",
      details: error.message,
    });
  }
});

export default router;