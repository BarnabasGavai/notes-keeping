import mongoose, { Types } from "mongoose";
const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    subject: {
      type: String,
    },
    content: {
      type: String,
    },
    labelId: {
      type: Schema.Types.ObjectId,
      ref: "Label",
    },
    backgroundColor: {
      type: String,
      default: "#487EB0",
    },
    fontColor: {
      type: String,
      default: "#FFFFFF",
    },
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);
