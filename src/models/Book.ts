import { Schema, model, Types } from "mongoose";

const BookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    ownerId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    collaborators: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    editors: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    editRequests: [
      {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        requestedAt: { type: Date, default: Date.now },
        resolvedAt: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("Book", BookSchema);
