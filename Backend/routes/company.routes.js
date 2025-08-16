const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const companyController = require("../controllers/company.controller");

// @route   GET /api/companies
// @desc    Get all companies (superadmin only)
// @access  Private (superadmin)
router.get("/", auth, companyController.getCompanies);

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Private (admin of the company or superadmin)
router.get("/:id", auth, companyController.getCompany);

// @route   GET /api/companies/me
// @desc    Get my company (for admin)
// @access  Private (admin)
router.get("/me", auth, companyController.getMyCompany);

module.exports = router;
