import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    driveFileId:{
      type:String,
      required: true,
      unique: true
    },
    mimeType: {
      type: String,
      required: true
    },
    createdAt:{
      type: Date, 
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Image", imageSchema);