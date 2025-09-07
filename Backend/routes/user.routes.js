// Backend/routes/user.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const checkCompany = require("../middleware/checkCompany");

const userController = require("../controllers/user.controller");

// @route   GET /api/users
// @desc    Get all users (superadmin only)
// @access  Private (superadmin)
router.get("/", auth, checkCompany, userController.getStylists);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, userController.getCurrentUser);

// @route   GET /api/users/company
// @desc    Get current company users (admin only)
// @access  Private (admin)
router.get("/company", auth, userController.getCompanyUsers);
// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (admin or self)
router.put("/:id", auth, userController.updateUser);

// @route   GET /api/users/company/:companyId/stylists
// @desc    Get stylists for a specific company (superadmin only)
// @access  Private (superadmin)
router.get(
  "/company/:companyId/stylists",
  auth,
  userController.getCompanyStylists
);

// @route   POST /api/users/employee
// @desc    Add employee to company (admin only)
// @access  Private (admin)
router.post("/employee", auth, userController.addEmployee);

// @route   GET /api/users/stylist/:id
// @desc    Get a stylist with services populated
// @access  Private (admin or superadmin)
router.get("/stylist/:id", auth, userController.getStylistWithServices);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (admin or superadmin)
router.delete("/:id", auth, userController.deleteUser);

module.exports = router;
