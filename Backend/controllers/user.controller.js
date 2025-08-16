const User = require("../models/User");
const Company = require("../models/Company");

// @desc    Get all users (superadmin only)
// @route   GET /api/users
// @access  Private (superadmin)
exports.getUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    const users = await User.find()
      .select("-password")
      .populate("company", "name");
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
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
