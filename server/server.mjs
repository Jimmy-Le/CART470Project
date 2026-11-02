import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import taskRoutes from "./routes/taskRoutes.mjs";
import imageRoutes from "./routes/imageRoutes.mjs"
import islandsRoutes from "./routes/islandsRoutes.mjs"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/tasks", taskRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/islands", islandsRoutes)



mongoose.connect(process.env.MONGODB_URI).then(() => {
		console.log("Connected to MongoDB");
    	app.listen(PORT, () => {console.log(`Backend running at http://localhost:${PORT}`);});
  	}).catch((error) => {
    	console.error("MongoDB connection failed:", error);
	});

// Submit New Island
app.post("/api/islands", requireAdmin, async (req, res) => {
	const { identifier, imageID, enabled, EN, FR, IN } = req.body;

	if (!imageID) {
		return res.status(400).json({ error: "Image is required" });
	}

	const result = await islandsCollection.insertOne({
		identifier,
		imageID,
		enabled: Boolean(enabled),
		EN,
		FR,
		IN,
		createdAt: new Date(),
	});

	res.status(201).json({
		insertedId: result.insertedId,
	});
});

// Get images
app.get("/api/images", async (req, res) => {
	try {
		const images = await Image.find();
		res.json(images);
	} catch (error) {
		console.error("GET /api/images failed:", error);
		res.status(500).json({ error: "Could not load images" });
	}
});

function requireAdmin(req, res, next) {
	if (!req.user?.isAdmin) {
		return res.status(403).json({ error: "Forbidden" });
	}

	next();
}
