import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Session", sessionSchema);