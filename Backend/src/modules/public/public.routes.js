// Backend/src/modules/public/public.routes.js
import express from "express";
const PublicRouter = express.Router();

import {
  getCompanyStylists,
  getStylistServices,
  createPublicAppointment,
} from "./public.controller.js";

/**
 * Public Routes
 * (Accessible without authentication)
 */

// ✅ Get available stylists for a company
PublicRouter.get("/company/:companyId/stylists", getCompanyStylists);

// ✅ Get available services for a specific stylist
PublicRouter.get("/stylist/:stylistId/services", getStylistServices);

// ✅ Create an appointment (non-authenticated users)
PublicRouter.post("/appointments", createPublicAppointment);

export default PublicRouter;
