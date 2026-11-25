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
    linkedIsland: {
      type: String,
      default: "",
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
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
    driveFileId: {
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
    enabled: {
      type: Boolean,
      default: true,
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
    svgImageID: {
      type: String,
      default: "",
    },
    decorationImageID: {
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
    x:{
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    width:{
      type: Number,
      default: 200,
    },
    height:{
      type: Number,
      default: 200,
    },
    camera:{
      x: {type: Number, default: 300},
      y: {type: Number, default: 300}
    },
    label:{
      x: {type: Number, default: 300},
      y: {type: Number, default: 300},
      width: {type: Number, default: 300}
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