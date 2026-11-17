import express from "express";
import Island from "../models/Island.mjs";

const router = express.Router();

// GET all islands
router.get("/", async (req, res) => {
	try {
		const islands = await Island.find().sort({ createdAt: -1 });
		res.json(islands);
	} catch (error) {
		res.status(500).json({ error: "Could not load islands" });	
	}
});

// GET one island by game ID
router.get("/:_id", async (req, res) => {
	try {
		const island = await Island.findOne({ _id: req.params._id });

		if (!island) {
			return res.status(404).json({ error: "Island not found" });
		}

		res.json(island);
	} catch (error) {
		res.status(500).json({ error: "Could not load island" });
	}
});

// CREATE an island
router.post("/", async (req, res) => {
	try {
		const { identifier, islandImageID, imageID, audio, enabled, EN, FR, IN } = req.body;

		const island = await Island.create({
			identifier: identifier,
			islandImageID:  islandImageID ?? "",
			imageID: imageID ?? "",
			enabled: Boolean(enabled),
			audio,
			EN,
			FR,
			IN,
		});

		res.status(201).json(island);
	} catch (error) {
		res.status(500).json({ error: "Could not create island", details:error.message });
	}
});

// UPDATE an island
router.put("/:id", async (req, res) => {

	try {
		console.log("PUT island ID:", req.params.id);
		console.log("PUT body:", req.body);

		const { _id, ...islandData } = req.body;

		const updatedIsland = await Island.findByIdAndUpdate(
		req.params.id,
		{ $set: islandData },
		{ new: true, runValidators: true }
		);

		console.log("Updated island:", updatedIsland);

		if (!updatedIsland) {
		return res.status(404).json({
			error: "Island not found",
			requestedId: req.params.id,
		});
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

// DELETE an island
router.delete("/:id", async (req, res) => {
	try {
		const deletedIsland = await Island.findByIdAndDelete(req.params.id,);

		if (!deletedIsland) {
			return res.status(404).json({ error: "Island not found" });
		}

		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ error: "Could not delete island" });
	}
});

export default router;