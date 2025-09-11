// Backend/routes/service.routes.js
import express from "express";
const ServiceRouter = express.Router();

import auth from "../../middleware/auth.js";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  assignServicesToStylist,
} from "./service.controller.js";

/**
 * Service Routes
 */

// ---- READ ----

// ✅ Get all services for a company
// - Superadmin: can filter by ?companyId
// - Admin/Styler/Customer: only services from their company
ServiceRouter.get("/", auth, getServices);

// ---- CREATE ----

// ✅ Create a new service (admin only)
ServiceRouter.post("/", auth, createService);

// ---- UPDATE ----

// ✅ Update a service (admin only)
ServiceRouter.put("/:id", auth, updateService);

// ---- DELETE ----

// ✅ Delete a service (admin only)
ServiceRouter.delete("/:id", auth, deleteService);

// ---- SPECIAL ACTION ----

// ✅ Assign services to a stylist (admin only)
ServiceRouter.put("/assign/:stylistId", auth, assignServicesToStylist);

export default ServiceRouter;
