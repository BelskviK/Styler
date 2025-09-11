// controllers/user.controller.js
import mongoose from "mongoose";
import User from "../models/User.js";

class UserController {
  // @desc    Get current user profile
  // @route   GET /api/users/me
  // @access  Private
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          address: user.address || "",
          profileImage: user.profileImage || "",
          role: user.role,
          company: user.company,
        },
      });
    } catch (err) {
      console.error("getCurrentUser error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Update user
  // @route   PUT /api/users/:id
  // @access  Private (admin or self)
  async updateUser(req, res) {
    // Destructure all fields including profileImage
    const { name, email, phone, address, profileImage, role } = req.body;

    try {
      // Validate that the ID is provided and is a valid ObjectId
      if (!req.params.id || req.params.id === "undefined") {
        return res.status(400).json({ message: "User ID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }

      let user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if current user is admin of the same company or superadmin or the user themselves
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

      // Update fields - allow empty strings to be saved
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (profileImage !== undefined) user.profileImage = profileImage;

      // Only admin/superadmin can change role
      if (
        (req.user.role === "admin" || req.user.role === "superadmin") &&
        role !== undefined
      ) {
        user.role = role;
      }

      await user.save();

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          profileImage: user.profileImage,
          role: user.role,
          company: user.company,
        },
      });
    } catch (err) {
      console.error("Update user error:", err);

      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Get all stylists for the current user's company
  // @route   GET /api/users/stylists
  // @access  Private (admin/superadmin/styler)
  async getStylists(req, res) {
    try {
      let companyId = req.user.company;

      // If superadmin and companyId query parameter is provided, use that
      if (req.user.role === "superadmin" && req.query.companyId) {
        companyId = req.query.companyId;
        // console.log("Using query parameter companyId:", companyId);
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

      // Format response
      const formattedStylists = stylists.map((stylist) => ({
        _id: stylist._id, // Add this
        id: stylist._id, // Keep this for compatibility
        name: stylist.name,
        expertise: stylist.expertise || "General Styling",
        profileImage: stylist.profileImage || "",
        schedule: stylist.schedule || "Available",
        reviews: stylist.reviews || "No reviews yet",
      }));

      res.status(200).json(formattedStylists);
    } catch (err) {
      console.error("Error in getStylists:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Get current company users (admin only)
  // @route   GET /api/users/company
  // @access  Private (admin)
  async getCompanyUsers(req, res) {
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
  }

  // @desc    Add employee to company (admin only)
  // @route   POST /api/users/employee
  // @access  Private (admin)
  async addEmployee(req, res) {
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
  }

  // @desc    Delete user
  // @route   DELETE /api/users/:id
  // @access  Private (admin or superadmin)
  async deleteUser(req, res) {
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
  }
  // Backend/controllers/user.controller.js
  async getStylistWithServices(req, res) {
    try {
      const stylist = await User.findById(req.params.id)
        .populate("services", "name description duration price")
        .select("-password");

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
  }
  // @desc    Get stylists for a specific company (superadmin only)
  // @route   GET /api/users/company/:companyId/stylists
  // @access  Private (superadmin)

  async getCompanyStylists(req, res) {
    try {
      const { companyId } = req.params;

      // Allow superadmin OR admin of the same company
      if (req.user.role !== "superadmin") {
        // Check if user is admin of the requested company
        if (
          req.user.role !== "admin" ||
          req.user.company.toString() !== companyId
        ) {
          return res.status(403).json({ message: "Not authorized" });
        }
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

      // Format response
      const formattedStylists = stylists.map((stylist) => ({
        id: stylist._id,
        _id: stylist._id,
        name: stylist.name,
        expertise: stylist.expertise || "General Styling",
        schedule: stylist.schedule || "Available",
        reviews: stylist.reviews || "No reviews yet",
        profileImage: stylist.profileImage || "",
      }));

      res.status(200).json(formattedStylists);
    } catch (err) {
      console.error("getCompanyStylists error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
}
export default new UserController();
