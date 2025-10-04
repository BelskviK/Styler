import jwt from "jsonwebtoken";
import User from "../user/user.model.js";

class AuthService {
  // Register a new user (admin/superadmin only)
  async registerUser(userData) {
    const { name, email, password, role, company } = userData;

    // Check for existing user
    if (await User.findOne({ email })) {
      throw new Error("User already exists");
    }

    // Create user
    return await User.create({
      name,
      email,
      password,
      role: role || "styler",
      company,
    });
  }

  // Public self-registration (customers)
  // In your authService.js, add more detailed error handling
  async registerCustomer(customerData) {
    const { name, email, password } = customerData;

    try {
      // Check for existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Create user with role = customer
      const user = await User.create({
        name,
        email,
        password,
        role: "customer",
      });

      console.log("User created successfully:", user._id);
      return user;
    } catch (error) {
      console.error("Registration error details:", error);
      throw error; // Re-throw to see the actual error
    }
  }

  // Login user
  async loginUser(credentials) {
    const { email, password } = credentials;

    // Find user and populate company name
    const user = await User.findOne({ email })
      .select("+password")
      .populate("company", "name");

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        company: user.company?._id || null,
        companyName: user.company?.name || null,
      },
    };
  }

  // Get current user
  async getCurrentUser(userId) {
    return await User.findById(userId).select("-password");
  }
}

export default new AuthService();
