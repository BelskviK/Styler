const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const companyController = require("../controllers/company.controller");

// @route   GET /api/companies
// @desc    Get all companies (superadmin only)
// @access  Private (superadmin)
router.get("/", auth, companyController.getCompanies);

// @route   POST /api/companies
// @desc    Create a new company (superadmin only)
// @access  Private (superadmin)
router.post("/", companyController.createCompany);

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Private (admin of the company or superadmin)
router.get("/:id", auth, companyController.getCompany);

// @route   GET /api/companies/me
// @desc    Get my company (for admin)
// @access  Private (admin)
router.get("/me", auth, companyController.getMyCompany);

// @route   PUT /api/companies/:id
// @desc    Update a company
// @access  Private (superadmin or admin of the company)
router.put("/:id", auth, companyController.updateCompany);

// @route   DELETE /api/companies/:id
// @desc    Delete a company
// @access  Private (superadmin only)
router.delete("/:id", auth, companyController.deleteCompany);

// @route   GET /api/companies/public/barbershops
// @desc    Get all active barbershops (public access)
// @access  Public
router.get("/public/barbershops", companyController.getPublicBarbershops);

module.exports = router;
