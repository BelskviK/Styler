// Backend/routes/service.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const serviceController = require("../controllers/service.controller");

/**
 * @route   GET /api/services
 * @desc    Get all services for a company
 *          - Superadmin: can filter by companyId query param
 *          - Admin/Styler/Customer: only services from their company
 * @access  Private
 */
router.get("/", auth, serviceController.getServices);

/**
 * @route   POST /api/services
 * @desc    Create a new service (admin only)
 * @access  Private
 */
router.post("/", auth, serviceController.createService);

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service (admin only)
 * @access  Private
 */
router.put("/:id", auth, serviceController.updateService);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service (admin only)
 * @access  Private
 */
router.delete("/:id", auth, serviceController.deleteService);

/**
 * @route   PUT /api/services/assign/:stylistId
 * @desc    Assign services to a stylist (admin only)
 * @access  Private
 */
router.put(
  "/assign/:stylistId",
  auth,
  serviceController.assignServicesToStylist
);

module.exports = router;
