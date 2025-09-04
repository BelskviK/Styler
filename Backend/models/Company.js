// Backend/models/Company.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
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
    count: {
      type: Number,
      default: 0,
    },
  },
  image: {
    type: String,
    default: "",
  },
  location: String,
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Company", companySchema);
