import mongoose from "mongoose";
import Service from "../models/Service.js";
import User from "../models/User.js";

class ServiceController {
  // @desc    Get all services for a company
  // @route   GET /api/services
  // @access  Private (admin, styler, customer of the company)
  async getServices(req, res) {
    try {
      let query = {};

      if (req.user.role === "superadmin") {
        // Superadmin sees only their own company unless querying another
        if (req.query.companyId) {
          query.company = req.query.companyId;
        } else {
          query.company = req.user.company;
        }
      } else if (req.user.role === "admin") {
        // Admins only their own company
        query.company = req.user.company;
      } else if (req.user.role === "styler") {
        // Styler can only see services assigned to them inside their company
        query = {
          _id: { $in: req.user.services },
          company: req.user.company,
        };
      } else if (req.user.role === "customer") {
        if (!req.user.company) {
          return res.status(400).json({
            message: "Customer must belong to a company to view services",
          });
        }
        query.company = req.user.company;
      }

      const services = await Service.find(query).populate("company", "name");
      res.status(200).json(services);
    } catch (err) {
      console.error("getServices error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
  // In createService function
  async createService(req, res) {
    const { name, description, duration, price, imageUrl } = req.body;
    try {
      console.log(`superadmin :_____${req.user.role}`);
      if (req.user.role !== "superadmin") {
        return res
          .status(403)
          .json({ message: "Not authorized to perform this action" });
      }

      const service = new Service({
        name,
        description,
        duration,
        price,
        imageUrl: imageUrl || "",
        company: req.user.company,
      });

      await service.save();

      res.status(201).json(service);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // In updateService function
  async updateService(req, res) {
    const { name, description, duration, price, imageUrl } = req.body;

    try {
      if (req.user.role !== "superadmin") {
        return res
          .status(403)
          .json({ message: "Not authorized to perform this action" });
      }

      let service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Check if service belongs to the admin's company
      if (service.company.toString() !== req.user.company.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this service" });
      }

      service.name = name || service.name;
      service.description = description || service.description;
      service.duration = duration || service.duration;
      service.price = price || service.price;
      service.imageUrl = imageUrl || service.imageUrl;

      await service.save();

      res.status(200).json(service);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Delete a service (admin only)
  // @route   DELETE /api/services/:id
  // @access  Private (admin)
  async deleteService(req, res) {
    try {
      if (req.user.role !== "superadmin") {
        return res
          .status(403)
          .json({ message: "Not authorized to perform this action" });
      }

      const service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Check if service belongs to the admin's company
      if (service.company.toString() !== req.user.company.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this service" });
      }

      // Use deleteOne() instead of remove()
      await Service.deleteOne({ _id: req.params.id });

      res.status(200).json({
        success: true,
        message: "Service deleted successfully",
      });
    } catch (err) {
      console.error("Delete error:", err); // More detailed logging
      res.status(500).json({
        message: "Server error",
        error: err.message, // Include error message in response
      });
    }
  }
  // @desc    Assign services to stylist (admin only)
  // @route   PUT /api/services/assign/:stylistId
  // @access  Private (admin)
  async assignServicesToStylist(req, res) {
    const { serviceIds } = req.body;
    const { stylistId } = req.params;

    try {
      // Validate inputs
      if (!stylistId || !mongoose.Types.ObjectId.isValid(stylistId)) {
        return res.status(400).json({ message: "Invalid stylist ID" });
      }

      if (!Array.isArray(serviceIds)) {
        return res.status(400).json({ message: "serviceIds must be an array" });
      }

      // Check permissions - allow both superadmin and admin
      if (req.user.role !== "superadmin" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Find and validate stylist
      const stylist = await User.findById(stylistId);
      if (!stylist) {
        return res.status(404).json({ message: "Stylist not found" });
      }

      // Check if stylist belongs to the same company
      if (stylist.company.toString() !== req.user.company.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized for this stylist" });
      }

      if (stylist.role !== "styler") {
        return res.status(400).json({ message: "User is not a stylist" });
      }

      // Validate services - only services from the same company
      const services = await Service.find({
        _id: { $in: serviceIds },
        company: req.user.company,
      });

      if (services.length !== serviceIds.length) {
        const invalidServices = serviceIds.filter(
          (id) => !services.some((s) => s._id.toString() === id)
        );
        return res.status(400).json({
          message: "Some services are invalid or don't belong to your company",
          invalidServices,
        });
      }

      // Update and save
      stylist.services = serviceIds;
      await stylist.save();

      // Return populated response
      const result = await User.findById(stylist._id)
        .populate("services", "name description duration price ")
        .select("-password");

      res.status(200).json({
        success: true,
        stylist: result,
        message: "Services assigned successfully",
      });
    } catch (err) {
      console.error("Assignment error:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  }
}
export default new ServiceController();
