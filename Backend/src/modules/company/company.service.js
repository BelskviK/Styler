import Company from "./company.model.js";
import User from "../user/user.model.js";

class CompanyService {
  // Get all companies (superadmin only)
  async getAllCompanies() {
    return await Company.find().populate("createdBy", "name email");
  }

  // Get company by ID
  async getCompanyById(id) {
    return await Company.findById(id);
  }

  // Get my company (for admin)
  async getMyCompany(companyId) {
    return await Company.findById(companyId).populate(
      "createdBy",
      "name email"
    );
  }

  // Create a new company (superadmin only)
  async createCompany(companyData) {
    const { name, description, createdBy } = companyData;

    // Check if company already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      throw new Error("Company already exists");
    }

    const company = new Company({
      name,
      description,
      createdBy,
    });

    return await company.save();
  }

  // Update a company
  async updateCompany(id, updateData) {
    const { name, description } = updateData;

    const company = await Company.findById(id);
    if (!company) {
      throw new Error("Company not found");
    }

    company.name = name || company.name;
    company.description = description || company.description;

    return await company.save();
  }

  // Delete a company
  async deleteCompany(id) {
    const company = await Company.findById(id);
    if (!company) {
      throw new Error("Company not found");
    }

    // Check if there are users associated with this company
    const usersWithCompany = await User.countDocuments({
      company: company._id,
    });
    if (usersWithCompany > 0) {
      throw new Error(
        "Cannot delete company with associated users. Please reassign or delete users first."
      );
    }

    return await Company.findByIdAndDelete(id);
  }

  // Get all active barbershops (public access)
  async getPublicBarbershops() {
    return await Company.find({
      type: "barbershop",
      isActive: true,
    }).select("name reviews image banner location description");
  }
}

export default new CompanyService();
