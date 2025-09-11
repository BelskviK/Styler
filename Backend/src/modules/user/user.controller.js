import userService from "./user.service.js";

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export async function getCurrentUser(req, res) {
  try {
    const result = await userService.getCurrentUser(req.user.id);

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      user: result.user,
    });
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin or self)
export async function updateUser(req, res) {
  try {
    const result = await userService.updateUser(
      req.params.id,
      req.body,
      req.user
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      user: result.user,
    });
  } catch (err) {
    console.error("Update user error:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Get all stylists for the current user's company
// @route   GET /api/users/stylists
// @access  Private (admin/superadmin/styler)
export async function getStylists(req, res) {
  try {
    const result = await userService.getStylists(
      req.user.company,
      req.user.role,
      req.query.companyId
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json(result.stylists);
  } catch (err) {
    console.error("Error in getStylists:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Get current company users (admin only)
// @route   GET /api/users/company
// @access  Private (admin)
export async function getCompanyUsers(req, res) {
  try {
    const result = await userService.getCompanyUsers(
      req.user.company,
      req.user.role
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json(result.users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Add employee to company (admin only)
// @route   POST /api/users/employee
// @access  Private (admin)
export async function addEmployee(req, res) {
  try {
    const result = await userService.addEmployee(
      req.body,
      req.user.company,
      req.user.role
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(201).json({
      success: true,
      user: result.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin or superadmin)
export async function deleteUser(req, res) {
  try {
    const result = await userService.deleteUser(req.params.id, req.user);

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Get stylist with services
// @route   GET /api/users/stylist/:id
// @access  Private
export async function getStylistWithServices(req, res) {
  try {
    const result = await userService.getStylistWithServices(
      req.params.id,
      req.user
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json(result.stylist);
  } catch (err) {
    console.error("getStylistWithServices error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Get stylists for a specific company (superadmin only)
// @route   GET /api/users/company/:companyId/stylists
// @access  Private (superadmin)
export async function getCompanyStylists(req, res) {
  try {
    const result = await userService.getCompanyStylists(
      req.params.companyId,
      req.user
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json(result.stylists);
  } catch (err) {
    console.error("getCompanyStylists error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
