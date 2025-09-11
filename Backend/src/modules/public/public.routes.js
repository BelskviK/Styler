import express from "express";
const PublicRouter = express.Router();

import {
  getCompanyStylists,
  getStylistServices,
  createPublicAppointment,
} from "./public.controller.js";

// @route   GET /api/public/company/:companyId/stylists
// @desc    Get available stylists for a company (public)
// @access  Public
PublicRouter.get("/company/:companyId/stylists", getCompanyStylists);

// @route   GET /api/public/stylist/:stylistId/services
// @desc    Get available services for a stylist (public)
// @access  Public
PublicRouter.get("/stylist/:stylistId/services", getStylistServices);

// @route   POST /api/public/appointments
// @desc    Create appointment for non-authenticated users
// @access  Public
PublicRouter.post("/appointments", createPublicAppointment);

export default PublicRouter;
