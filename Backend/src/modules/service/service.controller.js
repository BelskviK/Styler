import ServiceService from "./service.service.js";

// @desc    Get all services for a company
// @route   GET /api/services
// @access  Private (admin, styler, customer of the company)
export async function getServices(req, res) {
  try {
    const result = await ServiceService.getCompanyServices(
      req.user,
      req.query.companyId
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json(result.services);
  } catch (err) {
    console.error("getServices error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (superadmin only)
export async function createService(req, res) {
  try {
    const result = await serviceService.createService(req.body, req.user);

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(201).json(result.service);
  } catch (err) {
    console.error("createService error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (superadmin only)
export async function updateService(req, res) {
  try {
    const result = await serviceService.updateService(
      req.params.id,
      req.body,
      req.user
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json(result.service);
  } catch (err) {
    console.error("updateService error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (superadmin only)
export async function deleteService(req, res) {
  try {
    const result = await serviceService.deleteService(req.params.id, req.user);

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (err) {
    console.error("deleteService error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}

// @desc    Assign services to stylist
// @route   PUT /api/services/assign/:stylistId
// @access  Private (admin/superadmin only)
export async function assignServicesToStylist(req, res) {
  try {
    const result = await serviceService.assignServicesToStylist(
      req.params.stylistId,
      req.body.serviceIds,
      req.user
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      stylist: result.stylist,
      message: "Services assigned successfully",
    });
  } catch (err) {
    console.error("assignServicesToStylist error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}
