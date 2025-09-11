import mongoose from "mongoose";

import Service from "./service.model.js";
import User from "../user/user.model.js";

class ServiceService {
  // @desc    Get services based on user role and company
  // @param   {Object} user - The authenticated user
  // @param   {string} queryCompanyId - Optional company ID from query
  // @returns {Object} Result object with services or error
  async getCompanyServices(user, queryCompanyId) {
    try {
      let query = {};

      if (user.role === "superadmin") {
        // Superadmin sees only their own company unless querying another
        if (queryCompanyId) {
          query.company = queryCompanyId;
        } else {
          query.company = user.company;
        }
      } else if (user.role === "admin") {
        // Admins only their own company
        query.company = user.company;
      } else if (user.role === "styler") {
        // Styler can only see services assigned to them inside their company
        query = {
          _id: { $in: user.services },
          company: user.company,
        };
      } else if (user.role === "customer") {
        if (!user.company) {
          return {
            success: false,
            status: 400,
            message: "Customer must belong to a company to view services",
          };
        }
        query.company = user.company;
      }

      const services = await Service.find(query).populate("company", "name");
      return { success: true, services };
    } catch (err) {
      console.error("getCompanyServices error:", err);
      throw err;
    }
  }

  // @desc    Create a new service
  // @param   {Object} serviceData - Service data (name, description, duration, price, imageUrl)
  // @param   {Object} user - The authenticated user
  // @returns {Object} Result object with created service or error
  async createService(serviceData, user) {
    try {
      const { name, description, duration, price, imageUrl } = serviceData;

      if (user.role !== "superadmin") {
        return {
          success: false,
          status: 403,
          message: "Not authorized to perform this action",
        };
      }

      const service = new Service({
        name,
        description,
        duration,
        price,
        imageUrl: imageUrl || "",
        company: user.company,
      });

      await service.save();

      return { success: true, service };
    } catch (err) {
      console.error("createService error:", err);
      throw err;
    }
  }

  // @desc    Update an existing service
  // @param   {string} serviceId - ID of the service to update
  // @param   {Object} updateData - Updated service data
  // @param   {Object} user - The authenticated user
  // @returns {Object} Result object with updated service or error
  async updateService(serviceId, updateData, user) {
    try {
      const { name, description, duration, price, imageUrl } = updateData;

      if (user.role !== "superadmin") {
        return {
          success: false,
          status: 403,
          message: "Not authorized to perform this action",
        };
      }

      let service = await Service.findById(serviceId);

      if (!service) {
        return {
          success: false,
          status: 404,
          message: "Service not found",
        };
      }

      // Check if service belongs to the user's company
      if (service.company.toString() !== user.company.toString()) {
        return {
          success: false,
          status: 403,
          message: "Not authorized to update this service",
        };
      }

      service.name = name || service.name;
      service.description = description || service.description;
      service.duration = duration || service.duration;
      service.price = price || service.price;
      service.imageUrl = imageUrl || service.imageUrl;

      await service.save();

      return { success: true, service };
    } catch (err) {
      console.error("updateService error:", err);
      throw err;
    }
  }

  // @desc    Delete a service
  // @param   {string} serviceId - ID of the service to delete
  // @param   {Object} user - The authenticated user
  // @returns {Object} Result object indicating success or error
  async deleteService(serviceId, user) {
    try {
      if (user.role !== "superadmin") {
        return {
          success: false,
          status: 403,
          message: "Not authorized to perform this action",
        };
      }

      const service = await Service.findById(serviceId);

      if (!service) {
        return {
          success: false,
          status: 404,
          message: "Service not found",
        };
      }

      // Check if service belongs to the user's company
      if (service.company.toString() !== user.company.toString()) {
        return {
          success: false,
          status: 403,
          message: "Not authorized to delete this service",
        };
      }

      await Service.deleteOne({ _id: serviceId });

      return { success: true };
    } catch (err) {
      console.error("deleteService error:", err);
      throw err;
    }
  }

  // @desc    Assign services to a stylist
  // @param   {string} stylistId - ID of the stylist
  // @param   {Array} serviceIds - Array of service IDs to assign
  // @param   {Object} user - The authenticated user
  // @returns {Object} Result object with updated stylist or error
  async assignServicesToStylist(stylistId, serviceIds, user) {
    try {
      // Validate inputs
      if (!stylistId || !mongoose.Types.ObjectId.isValid(stylistId)) {
        return {
          success: false,
          status: 400,
          message: "Invalid stylist ID",
        };
      }

      if (!Array.isArray(serviceIds)) {
        return {
          success: false,
          status: 400,
          message: "serviceIds must be an array",
        };
      }

      // Check permissions - allow both superadmin and admin
      if (user.role !== "superadmin" && user.role !== "admin") {
        return {
          success: false,
          status: 403,
          message: "Not authorized",
        };
      }

      // Find and validate stylist
      const stylist = await User.findById(stylistId);
      if (!stylist) {
        return {
          success: false,
          status: 404,
          message: "Stylist not found",
        };
      }

      // Check if stylist belongs to the same company
      if (stylist.company.toString() !== user.company.toString()) {
        return {
          success: false,
          status: 403,
          message: "Not authorized for this stylist",
        };
      }

      if (stylist.role !== "styler") {
        return {
          success: false,
          status: 400,
          message: "User is not a stylist",
        };
      }

      // Validate services - only services from the same company
      const services = await Service.find({
        _id: { $in: serviceIds },
        company: user.company,
      });

      if (services.length !== serviceIds.length) {
        const invalidServices = serviceIds.filter(
          (id) => !services.some((s) => s._id.toString() === id)
        );
        return {
          success: false,
          status: 400,
          message: "Some services are invalid or don't belong to your company",
          invalidServices,
        };
      }

      // Update and save
      stylist.services = serviceIds;
      await stylist.save();

      // Return populated response
      const result = await User.findById(stylist._id)
        .populate("services", "name description duration price")
        .select("-password");

      return {
        success: true,
        stylist: result,
      };
    } catch (err) {
      console.error("assignServicesToStylist error:", err);
      throw err;
    }
  }
}

export default new ServiceService();
