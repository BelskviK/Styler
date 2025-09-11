// Backend\routes\company.routes.js
import express from "express";
const CompanyRouter = express.Router();
import auth from "../middleware/auth.js";

import companyController from "../controllers/company.controller.js";

// @route   GET /api/companies
// @desc    Get all companies (superadmin only)
// @access  Private (superadmin)
CompanyRouter.get("/", auth, companyController.getCompanies);

// @route   POST /api/companies
// @desc    Create a new company (superadmin only)
// @access  Private (superadmin)
CompanyRouter.post("/", companyController.createCompany);

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Private (admin of the company or superadmin)
CompanyRouter.get("/:id", auth, companyController.getCompany);

// @route   GET /api/companies/me
// @desc    Get my company (for admin)
// @access  Private (admin)
CompanyRouter.get("/me", auth, companyController.getMyCompany);

// @route   PUT /api/companies/:id
// @desc    Update a company
// @access  Private (superadmin or admin of the company)
CompanyRouter.put("/:id", auth, companyController.updateCompany);

// @route   DELETE /api/companies/:id
// @desc    Delete a company
// @access  Private (superadmin only)
CompanyRouter.delete("/:id", auth, companyController.deleteCompany);

// @route   GET /api/companies/public/barbershops
// @desc    Get all active barbershops (public access)
// @access  Public
CompanyRouter.get(
  "/public/barbershops",
  companyController.getPublicBarbershops
);

export default CompanyRouter;
