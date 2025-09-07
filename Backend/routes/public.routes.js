const express = require("express");
const router = express.Router();
const User = require("../models/User");

// @route   GET /api/public/company/:companyId/stylists
// @desc    Get available stylists for a company (public)
// @access  Public
router.get("/company/:companyId/stylists", async (req, res) => {
  try {
    const { companyId } = req.params;

    const stylists = await User.find({
      company: companyId,
      role: "styler",
    })
      .select("name profileImage expertise schedule description rating")
      .populate("services", "name description duration price image");

    res.status(200).json(stylists);
  } catch (err) {
    console.error("Error fetching public stylists:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/public/stylist/:stylistId/services
// @desc    Get available services for a stylist (public)
// @access  Public
router.get("/stylist/:stylistId/services", async (req, res) => {
  try {
    const { stylistId } = req.params;

    const stylist = await User.findById(stylistId).populate(
      "services",
      "name description duration price image"
    );

    if (!stylist) {
      return res.status(404).json({ message: "Stylist not found" });
    }

    res.status(200).json(stylist.services || []);
  } catch (err) {
    console.error("Error fetching public services:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
