import { Schema, model, Types } from "mongoose";

const PageSchema = new Schema(
  {
    bookId: { type: Types.ObjectId, ref: "Book", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    order: { type: Number, required: true, min: 0 },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
  },
  { timestamps: true }
);

PageSchema.index({ bookId: 1, order: 1 });

export default model("Page", PageSchema);