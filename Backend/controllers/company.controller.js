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
