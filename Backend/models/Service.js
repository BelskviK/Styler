import mongoose from "mongoose";

export const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  duration: {
    type: Number,
    required: true, // in minutes
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Service", serviceSchema);
