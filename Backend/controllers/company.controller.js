// Backend\controllers\company.controller.js
const Company = require("../models/Company");
const User = require("../models/User");

// @desc    Get all companies (superadmin only)
// @route   GET /api/companies
// @access  Private (superadmin)
exports.getCompanies = async (req, res, next) => {
  try {
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    const companies = await Company.find().populate("createdBy", "name email");
    res.status(200).json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private (admin of the company or superadmin)
exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if user is superadmin or admin of this company
    if (
      req.user.role !== "superadmin" &&
      req.user.company.toString() !== company._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    res.status(200).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get my company (for admin)
// @route   GET /api/companies/me
// @access  Private (admin)
exports.getMyCompany = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    const company = await Company.findById(req.user.company).populate(
      "createdBy",
      "name email"
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new company (superadmin only)
// @route   POST /api/companies
// @access  Private (superadmin)
exports.createCompany = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" });
    }

    const company = new Company({
      name,
      description,
      createdBy: req.user._id,
    });

    await company.save();

    res.status(201).json({
      success: true,
      company,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a company
// @route   PUT /api/companies/:id
// @access  Private (superadmin or admin of the company)
exports.updateCompany = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if user is superadmin or admin of this company
    if (
      req.user.role !== "superadmin" &&
      req.user.company.toString() !== company._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this company" });
    }

    company.name = name || company.name;
    company.description = description || company.description;

    await company.save();

    res.status(200).json({
      success: true,
      company,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a company
// @route   DELETE /api/companies/:id
// @access  Private (superadmin only)
exports.deleteCompany = async (req, res, next) => {
  try {
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete companies" });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if there are users associated with this company
    const usersWithCompany = await User.countDocuments({
      company: company._id,
    });
    if (usersWithCompany > 0) {
      return res.status(400).json({
        message:
          "Cannot delete company with associated users. Please reassign or delete users first.",
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all active barbershops (public access)
// @route   GET /api/companies/public/barbershops
// @access  Public
exports.getPublicBarbershops = async (req, res, next) => {
  try {
    const barbershops = await Company.find({
      type: "barbershop",
      isActive: true,
    }).select("name reviews image banner location description");

    res.status(200).json(barbershops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
