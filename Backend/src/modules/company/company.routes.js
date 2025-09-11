// Backend/routes/company.routes.js
import express from "express";
const CompanyRouter = express.Router();

import auth from "../../middleware/auth.js";
import {
  getPublicBarbershops,
  getMyCompany,
  getCompany,
  updateCompany,
  getCompanies,
  createCompany,
  deleteCompany,
} from "./company.controller.js";

/**
 * Company Routes
 */

// ---- PUBLIC ROUTES ----

// ✅ Get all active barbershops (public access)
CompanyRouter.get("/public/barbershops", getPublicBarbershops);

// ---- PROTECTED ROUTES ----

// ✅ Get my company (admin of the company)
CompanyRouter.get("/me", auth, getMyCompany);

// ✅ Get company by ID (admin of the company or superadmin)
CompanyRouter.get("/:id", auth, getCompany);

// ✅ Update a company (admin of the company or superadmin)
CompanyRouter.put("/:id", auth, updateCompany);

// ---- SUPERADMIN ROUTES ----

// ✅ Get all companies (superadmin only)
CompanyRouter.get("/", auth, getCompanies);

// ✅ Create a new company (superadmin only)
CompanyRouter.post("/", auth, createCompany);

// ✅ Delete a company (superadmin only)
CompanyRouter.delete("/:id", auth, deleteCompany);

export default CompanyRouter;
