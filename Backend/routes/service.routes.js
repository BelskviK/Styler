// Backend/routes/service.routes.js
import express from "express";
const ServiceRouter = express.Router();
import auth from "../middleware/auth.js";

import serviceController from "../controllers/service.controller.js";

/**
 * @route   GET /api/services
 * @desc    Get all services for a company
 *          - Superadmin: can filter by companyId query param
 *          - Admin/Styler/Customer: only services from their company
 * @access  Private
 */
ServiceRouter.get("/", auth, serviceController.getServices);

/**
 * @route   POST /api/services
 * @desc    Create a new service (admin only)
 * @access  Private
 */
ServiceRouter.post("/", auth, serviceController.createService);

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service (admin only)
 * @access  Private
 */
ServiceRouter.put("/:id", auth, serviceController.updateService);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service (admin only)
 * @access  Private
 */
ServiceRouter.delete("/:id", auth, serviceController.deleteService);

/**
 * @route   PUT /api/services/assign/:stylistId
 * @desc    Assign services to a stylist (admin only)
 * @access  Private
 */
ServiceRouter.put(
  "/assign/:stylistId",
  auth,
  serviceController.assignServicesToStylist
);
export default ServiceRouter;
