// Backend/models/Company.js
import mongoose from "mongoose";

export const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["barbershop", "market"],
      default: "barbershop",
    },
    reviews: {
      rating: {
        type: Number,
        default: 0,
      },
      companyRating: {
        type: Number,
        default: 0,
      },
      serviceRating: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    image: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    location: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Company", companySchema);
