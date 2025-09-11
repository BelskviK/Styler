import companyService from "./company.service.js";

// @desc    Get all companies (superadmin only)
// @route   GET /api/companies
// @access  Private (superadmin)
export async function getCompanies(req, res) {
  try {
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    const companies = await companyService.getAllCompanies();
    res.status(200).json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private (admin of the company or superadmin)
export async function getCompany(req, res) {
  try {
    const company = await companyService.getCompanyById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if user is superadmin or admin of this company
    if (
      req.user.role !== "superadmin" &&
      req.user.company.toString() !== company._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    res.status(200).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Get my company (for admin)
// @route   GET /api/companies/me
// @access  Private (admin)
export async function getMyCompany(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    const company = await companyService.getMyCompany(req.user.company);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Create a new company (superadmin only)
// @route   POST /api/companies
// @access  Private (superadmin)
export async function createCompany(req, res) {
  try {
    const { name, description } = req.body;

    const company = await companyService.createCompany({
      name,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      company,
    });
  } catch (err) {
    console.error(err);
    if (err.message === "Company already exists") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Update a company
// @route   PUT /api/companies/:id
// @access  Private (superadmin or admin of the company)
export async function updateCompany(req, res) {
  try {
    const { name, description } = req.body;

    const company = await companyService.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if user is superadmin or admin of this company
    if (
      req.user.role !== "superadmin" &&
      req.user.company.toString() !== company._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this company" });
    }

    const updatedCompany = await companyService.updateCompany(req.params.id, {
      name,
      description,
    });

    res.status(200).json({
      success: true,
      company: updatedCompany,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Delete a company
// @route   DELETE /api/companies/:id
// @access  Private (superadmin only)
export async function deleteCompany(req, res) {
  try {
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete companies" });
    }

    await companyService.deleteCompany(req.params.id);

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (err) {
    console.error(err);
    if (err.message === "Company not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes("associated users")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Get all active barbershops (public access)
// @route   GET /api/companies/public/barbershops
// @access  Public
export async function getPublicBarbershops(req, res) {
  try {
    const barbershops = await companyService.getPublicBarbershops();
    res.status(200).json(barbershops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
