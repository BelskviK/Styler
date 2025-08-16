const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const serviceController = require("../controllers/service.controller");

// @route   GET /api/services
// @desc    Get all services for a company
// @access  Private (admin, styler, customer of the company)
router.get("/", auth, serviceController.getServices);

// @route   POST /api/services
// @desc    Create a service (admin only)
// @access  Private (admin)
router.post("/", auth, serviceController.createService);

// @route   PUT /api/services/:id
// @desc    Update a service (admin only)
// @access  Private (admin)
router.put("/:id", auth, serviceController.updateService);

// @route   DELETE /api/services/:id
// @desc    Delete a service (admin only)
// @access  Private (admin)
router.delete("/:id", auth, serviceController.deleteService);

// @route   PUT /api/services/assign/:stylistId
// @desc    Assign services to stylist (admin only)
// @access  Private (admin)
router.put(
  "/assign/:stylistId",
  auth,
  serviceController.assignServicesToStylist
);

module.exports = router;
