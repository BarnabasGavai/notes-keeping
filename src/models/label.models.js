import mongoose from "mongoose";
const { Schema } = mongoose;

const labelSchema = new Schema(
  {
    labelValue: { type: String },
    userId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

export const Label = mongoose.model("Label", labelSchema);
