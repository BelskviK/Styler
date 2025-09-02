// controllers/user.controller.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Company = require("../models/Company");

// @desc    Get all users (superadmin only)
// @route   GET /api/users
// @access  Private (superadmin)

// @desc    Get all stylists for the current user's company
// @route   GET /api/users/stylists
// @access  Private (admin/superadmin/styler)
// Backend/controllers/user.controller.js
exports.getStylists = async (req, res, next) => {
  try {
    let companyId = req.user.company;

    console.log("=== BACKEND GET STYLISTS ===");
    console.log("User role:", req.user.role);
    console.log("User company:", req.user.company);
    console.log("Query params:", req.query);

    // If superadmin and companyId query parameter is provided, use that
    if (req.user.role === "superadmin" && req.query.companyId) {
      companyId = req.query.companyId;
      console.log("Using query parameter companyId:", companyId);
    }

    if (!companyId) {
      console.log("No company ID found");
      return res
        .status(403)
        .json({ message: "Not authorized to view stylists" });
    }

    console.log("Final company ID:", companyId);

    const stylists = await User.find({
      company: companyId,
      role: "styler",
    })
      .select("-password")
      .lean();

    console.log("Found stylists:", stylists.length);

    // Format response
    const formattedStylists = stylists.map((stylist) => ({
      _id: stylist._id, // Add this
      id: stylist._id, // Keep this for compatibility
      name: stylist.name,
      expertise: stylist.expertise || "General Styling",
      schedule: stylist.schedule || "Available",
      reviews: stylist.reviews || "No reviews yet",
    }));

    res.status(200).json(formattedStylists);
  } catch (err) {
    console.error("Error in getStylists:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current company users (admin only)
// @route   GET /api/users/company
// @access  Private (admin)
exports.getCompanyUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    const users = await User.find({ company: req.user.company }).select(
      "-password"
    );
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add employee to company (admin only)
// @route   POST /api/users/employee
// @access  Private (admin)
exports.addEmployee = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to perform this action" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create employee
    user = new User({
      name,
      email,
      password,
      role: role || "styler",
      company: req.user.company,
    });

    await user.save();

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin or self)
exports.updateUser = async (req, res, next) => {
  const { name, email, role } = req.body;

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user is admin of the same company or superadmin
    if (
      req.user.role !== "superadmin" &&
      (req.user.role !== "admin" ||
        user.company.toString() !== req.user.company.toString()) &&
      user._id.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user" });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    // Only admin/superadmin can change role
    if (req.user.role === "admin" || req.user.role === "superadmin") {
      user.role = role || user.role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin or superadmin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user is admin of the same company or superadmin
    if (
      req.user.role !== "superadmin" &&
      (req.user.role !== "admin" ||
        user.company.toString() !== req.user.company.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this user" });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Backend/controllers/user.controller.js
exports.getStylistWithServices = async (req, res) => {
  try {
    console.log("📞 getStylistWithServices called with ID:", req.params.id);

    const stylist = await User.findById(req.params.id)
      .populate("services", "name description duration price")
      .select("-password");

    console.log("👤 Found stylist:", stylist);

    if (!stylist) {
      return res.status(404).json({ message: "Stylist not found" });
    }

    // Check permissions
    if (req.user.role !== "superadmin" && req.user.role !== "admin") {
      if (stylist.company.toString() !== req.user.company.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    res.status(200).json(stylist);
  } catch (err) {
    console.error("getStylistWithServices error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc    Get stylists for a specific company (superadmin only)
// @route   GET /api/users/company/:companyId/stylists
// @access  Private (superadmin)
exports.getCompanyStylists = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    console.log("📞 getCompanyStylists called with companyId:", companyId);

    // Only superadmin can access other companies' stylists
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Validate company ID
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      console.error("Invalid company ID format:", companyId);
      return res.status(400).json({ message: "Invalid company ID format" });
    }

    const stylists = await User.find({
      company: companyId,
      role: "styler",
    })
      .select("-password")
      .lean();

    console.log("✅ Found stylists:", stylists.length);

    // Format response to match the existing structure
    const formattedStylists = stylists.map((stylist) => ({
      id: stylist._id,
      _id: stylist._id,
      name: stylist.name,
      expertise: stylist.expertise || "General Styling",
      schedule: stylist.schedule || "Available",
      reviews: stylist.reviews || "No reviews yet",
    }));

    res.status(200).json(formattedStylists);
  } catch (err) {
    console.error("getCompanyStylists error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
