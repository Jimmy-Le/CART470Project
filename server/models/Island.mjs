import mongoose from "mongoose";
import Audio from "./Audio.mjs";

const connectionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      default: "",
      trim: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    linkedIsland: {
      type: String,
      default: "",
      trim: true,
    },

  },
  {_id: true}
)

const audioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    gridFsId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);



const localizedIslandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    connections: [connectionSchema],
  },
  { _id: false }
);

const islandSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      default: "",
    },
    islandImageID: {
      type: String,
      default: "",
    },
    imageID: {
      type: String,
      default: "",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    audio:{
      type: audioSchema,
      default: () => ({}),
    },
    EN: {
      type: localizedIslandSchema,
      default: () => ({}),
    },
    FR: {
      type: localizedIslandSchema,
      default: () => ({}),
    },
    IN: {
      type: localizedIslandSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Island", islandSchema);