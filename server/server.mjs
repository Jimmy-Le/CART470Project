import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import taskRoutes from "./routes/taskRoutes.mjs";
import imageRoutes from "./routes/imageRoutes.mjs";
import islandsRoutes from "./routes/islandsRoutes.mjs";
import audioRoutes from "./routes/audioRoutes.mjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/tasks", taskRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/islands", islandsRoutes)
app.use("/api/audio", audioRoutes)



mongoose.connect(process.env.MONGODB_URI).then(() => {
		console.log("Connected to MongoDB");
    	app.listen(PORT, () => {console.log(`Backend running at http://localhost:${PORT}`);});
  	}).catch((error) => {
    	console.error("MongoDB connection failed:", error);
	});



function requireAdmin(req, res, next) {
	if (!req.user?.isAdmin) {
		return res.status(403).json({ error: "Forbidden" });
	}

	next();
}
