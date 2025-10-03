import mongoose from "mongoose";
import User from "./user.model.js";

class UserService {
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return { success: false, status: 404, message: "User not found" };
      }

      return {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          address: user.address || "",
          profileImage: user.profileImage || "",
          role: user.role,
          company: user.company,
        },
      };
    } catch (err) {
      console.error("getCurrentUser service error:", err);
      throw err;
    }
  }

  async updateUser(userId, updateData, currentUser) {
    try {
      const { name, email, phone, address, profileImage, role } = updateData;

      // Validate that the ID is provided and is a valid ObjectId
      if (!userId || userId === "undefined") {
        return { success: false, status: 400, message: "User ID is required" };
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          status: 400,
          message: "Invalid user ID format",
        };
      }

      let user = await User.findById(userId);

      if (!user) {
        return { success: false, status: 404, message: "User not found" };
      }

      // Check if current user is admin of the same company or superadmin or the user themselves
      if (
        currentUser.role !== "superadmin" &&
        (currentUser.role !== "admin" ||
          user.company.toString() !== currentUser.company.toString()) &&
        user._id.toString() !== currentUser.id
      ) {
        return {
          success: false,
          status: 403,
          message: "Not authorized to update this user",
        };
      }

      // Update fields - allow empty strings to be saved
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (profileImage !== undefined) user.profileImage = profileImage;

      // Only admin/superadmin can change role
      if (
        (currentUser.role === "admin" || currentUser.role === "superadmin") &&
        role !== undefined
      ) {
        user.role = role;
      }

      await user.save();

      return {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          profileImage: user.profileImage,
          role: user.role,
          company: user.company,
        },
      };
    } catch (err) {
      console.error("Update user service error:", err);
      throw err;
    }
  }

  async getStylists(userCompanyId, userRole, queryCompanyId) {
    try {
      let companyId = userCompanyId;

      // If superadmin and companyId query parameter is provided, use that
      if (userRole === "superadmin" && queryCompanyId) {
        companyId = queryCompanyId;
      }

      if (!companyId) {
        return {
          success: false,
          status: 403,
          message: "Not authorized to view stylists",
        };
      }

      const stylists = await User.find({
        company: companyId,
        role: "styler",
      })
        .select("-password")
        .lean();

      // Format response
      const formattedStylists = stylists.map((stylist) => ({
        _id: stylist._id,
        id: stylist._id,
        name: stylist.name,
        expertise: stylist.expertise || "General Styling",
        profileImage: stylist.profileImage || "",
        schedule: stylist.schedule || "Available",
        reviews: stylist.reviews || "No reviews yet",
      }));

      return { success: true, stylists: formattedStylists };
    } catch (err) {
      console.error("getStylists service error:", err);
      throw err;
    }
  }

  async getCompanyUsers(companyId, userRole) {
    try {
      if (userRole !== "admin") {
        return {
          success: false,
          status: 403,
          message: "Not authorized to access this resource",
        };
      }

      const users = await User.find({ company: companyId }).select("-password");
      return { success: true, users };
    } catch (err) {
      console.error("getCompanyUsers service error:", err);
      throw err;
    }
  }

  async addEmployee(employeeData, companyId, userRole) {
    try {
      const { name, email, password, role } = employeeData;

      if (userRole !== "admin") {
        return {
          success: false,
          status: 403,
          message: "Not authorized to perform this action",
        };
      }

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return {
          success: false,
          status: 400,
          message: "Employee already exists",
        };
      }

      // Create employee
      user = new User({
        name,
        email,
        password,
        role: role || "styler",
        company: companyId,
      });

      await user.save();

      return {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      };
    } catch (err) {
      console.error("addEmployee service error:", err);
      throw err;
    }
  }

  async deleteUser(userId, currentUser) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        return { success: false, status: 404, message: "User not found" };
      }

      // Check if current user is admin of the same company or superadmin
      if (
        currentUser.role !== "superadmin" &&
        (currentUser.role !== "admin" ||
          user.company.toString() !== currentUser.company.toString())
      ) {
        return {
          success: false,
          status: 403,
          message: "Not authorized to delete this user",
        };
      }

      await User.findByIdAndDelete(userId);

      return { success: true };
    } catch (err) {
      console.error("deleteUser service error:", err);
      throw err;
    }
  }

  async getStylistWithServices(stylistId, currentUser) {
    try {
      const stylist = await User.findById(stylistId)
        .populate("services", "name description duration price")
        .select("-password");

      if (!stylist) {
        return { success: false, status: 404, message: "Stylist not found" };
      }

      // Check permissions
      if (currentUser.role !== "superadmin" && currentUser.role !== "admin") {
        if (stylist.company.toString() !== currentUser.company.toString()) {
          return { success: false, status: 403, message: "Not authorized" };
        }
      }

      return { success: true, stylist };
    } catch (err) {
      console.error("getStylistWithServices service error:", err);
      throw err;
    }
  }

  async getCompanyStylists(companyId, currentUser) {
    try {
      // Allow superadmin OR admin of the same company
      if (currentUser.role !== "superadmin") {
        // Check if user is admin of the requested company
        if (
          currentUser.role !== "admin" ||
          currentUser.company.toString() !== companyId
        ) {
          return { success: false, status: 403, message: "Not authorized" };
        }
      }

      // Validate company ID
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return {
          success: false,
          status: 400,
          message: "Invalid company ID format",
        };
      }

      const stylists = await User.find({
        company: companyId,
        role: "styler",
      })
        .select("-password")
        .lean();

      // Format response
      const formattedStylists = stylists.map((stylist) => ({
        id: stylist._id,
        _id: stylist._id,
        name: stylist.name,
        expertise: stylist.expertise || "General Styling",
        schedule: stylist.schedule || "Available",
        reviews: stylist.reviews || "No reviews yet",
        profileImage: stylist.profileImage || "",
      }));

      return { success: true, stylists: formattedStylists };
    } catch (err) {
      console.error("getCompanyStylists service error:", err);
      throw err;
    }
  }
}

export default new UserService();
