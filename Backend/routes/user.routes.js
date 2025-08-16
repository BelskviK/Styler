const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/user.controller");

// @route   GET /api/users
// @desc    Get all users (superadmin only)
// @access  Private (superadmin)
router.get("/", auth, userController.getUsers);

// @route   GET /api/users/company
// @desc    Get current company users (admin only)
// @access  Private (admin)
router.get("/company", auth, userController.getCompanyUsers);

// @route   POST /api/users/employee
// @desc    Add employee to company (admin only)
// @access  Private (admin)
router.post("/employee", auth, userController.addEmployee);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (admin or self)
router.put("/:id", auth, userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (admin or superadmin)
router.delete("/:id", auth, userController.deleteUser);

module.exports = router;
