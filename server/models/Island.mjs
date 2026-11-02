import mongoose from "mongoose";

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
  },
  {_id: true}
)



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