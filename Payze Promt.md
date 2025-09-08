Make sure to have env variable for both frontend and backend wich will triger all and do not crush when code of subscription is not done

I could easily change it to true and false to continiue my job without finishing the subscription api integration with "Payze"

> > > // Backend\controllers\auth.controller.js
> > > const jwt = require("jsonwebtoken");
> > > const User = require("../models/User");
> > > const Company = require("../models/Company");

// @desc Register a new user
// @route POST /api/auth/register
// @access Private (admin/superadmin only)

// @desc Register a new user
exports.register = async (req, res) => {
try {
const { name, email, password, role } = req.body;

    // Validate role
    if (role === "customer") {
      return res.status(400).json({
        success: false,
        message: "Cannot register customers through admin interface",
      });
    }

    // Check for existing user
    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "styler",
      company: req.user.company, // Inherits creator's company
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });

} catch (err) {
console.error(err);
res.status(500).json({
success: false,
message: "Server error during registration",
});
}
};

// @desc Public self-registration (customers)
// @route POST /api/auth/register/customer
// @access Public
exports.registerCustomer = async (req, res) => {
try {
const { name, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user with role = customer
    const user = await User.create({
      name,
      email,
      password,
      role: "customer",
    });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

} catch (err) {
console.error(err);
res.status(500).json({
success: false,
message: "Server error during customer registration",
});
}
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
const { email, password } = req.body;

try {
// Find user and populate company name
const user = await User.findOne({ email })
.select("+password")
.populate("company", "name"); // ✅ populate only the name field

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company?._id || null,
        companyName: user.company?.name || null, // ✅ now this will have the name
      },
    });

} catch (err) {
console.error(err);
res.status(500).json({ message: "Server error" });
}
};

// @desc Get current user
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res, next) => {
try {
const user = await User.findById(req.user.id).select("-password");
res.status(200).json(user);
} catch (err) {
console.error(err);
res.status(500).json({ message: "Server error" });
}
};

// @desc Logout user
// @route GET /api/auth/logout
// @access Private
exports.logout = async (req, res, next) => {
res.cookie("token", "", {
httpOnly: true,
expires: new Date(0),
});
res.status(200).json({ message: "Logged out successfully" });
};

> > > // controllers/user.controller.js
> > > const mongoose = require("mongoose");
> > > const User = require("../models/User");

// @desc Get current user profile
// @route GET /api/users/me
// @access Private
exports.getCurrentUser = async (req, res) => {
try {
const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
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
    });

} catch (err) {
console.error("getCurrentUser error:", err);
res.status(500).json({ message: "Server error" });
}
};

// @desc Update user
// @route PUT /api/users/:id
// @access Private (admin or self)
exports.updateUser = async (req, res, next) => {
// Destructure all fields including profileImage
const { name, email, phone, address, profileImage, role } = req.body;

try {
// Validate that the ID is provided and is a valid ObjectId
if (!req.params.id || req.params.id === "undefined") {
return res.status(400).json({ message: "User ID is required" });
}

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user is admin of the same company or superadmin or the user themselves
    if (
      req.user.role !== "superadmin" &&
      (req.user.role !== "admin" ||
        user.company.toString() !== req.user.company.toString()) &&
      user._id.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user" });
    }

    // Update fields - allow empty strings to be saved
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Only admin/superadmin can change role
    if (
      (req.user.role === "admin" || req.user.role === "superadmin") &&
      role !== undefined
    ) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({
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
    });

} catch (err) {
console.error("Update user error:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    res.status(500).json({ message: "Server error" });

}
};

// @desc Get all stylists for the current user's company
// @route GET /api/users/stylists
// @access Private (admin/superadmin/styler)
exports.getStylists = async (req, res, next) => {
try {
let companyId = req.user.company;

    // If superadmin and companyId query parameter is provided, use that
    if (req.user.role === "superadmin" && req.query.companyId) {
      companyId = req.query.companyId;
      // console.log("Using query parameter companyId:", companyId);
    }

    if (!companyId) {
      console.log("No company ID found");
      return res
        .status(403)
        .json({ message: "Not authorized to view stylists" });
    }

    console.log("Final company ID:", companyId);

    const stylists = await User.find({
      company: companyId,
      role: "styler",
    })
      .select("-password")
      .lean();

    // Format response
    const formattedStylists = stylists.map((stylist) => ({
      _id: stylist._id, // Add this
      id: stylist._id, // Keep this for compatibility
      name: stylist.name,
      expertise: stylist.expertise || "General Styling",
      schedule: stylist.schedule || "Available",
      reviews: stylist.reviews || "No reviews yet",
    }));

    res.status(200).json(formattedStylists);

} catch (err) {
console.error("Error in getStylists:", err);
res.status(500).json({ message: "Server error" });
}
};

// @desc Get current company users (admin only)
// @route GET /api/users/company
// @access Private (admin)
exports.getCompanyUsers = async (req, res, next) => {
try {
if (req.user.role !== "admin") {
return res
.status(403)
.json({ message: "Not authorized to access this resource" });
}

    const users = await User.find({ company: req.user.company }).select(
      "-password"
    );
    res.status(200).json(users);

} catch (err) {
console.error(err);
res.status(500).json({ message: "Server error" });
}
};

// @desc Add employee to company (admin only)
// @route POST /api/users/employee
// @access Private (admin)
exports.addEmployee = async (req, res, next) => {
const { name, email, password, role } = req.body;

try {
if (req.user.role !== "admin") {
return res
.status(403)
.json({ message: "Not authorized to perform this action" });
}

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create employee
    user = new User({
      name,
      email,
      password,
      role: role || "styler",
      company: req.user.company,
    });

    await user.save();

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });

} catch (err) {
console.error(err);
res.status(500).json({ message: "Server error" });
}
};

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private (admin or superadmin)
exports.deleteUser = async (req, res, next) => {
try {
const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user is admin of the same company or superadmin
    if (
      req.user.role !== "superadmin" &&
      (req.user.role !== "admin" ||
        user.company.toString() !== req.user.company.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this user" });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

} catch (err) {
console.error(err);
res.status(500).json({ message: "Server error" });
}
};
// Backend/controllers/user.controller.js
exports.getStylistWithServices = async (req, res) => {
try {
const stylist = await User.findById(req.params.id)
.populate("services", "name description duration price")
.select("-password");

    if (!stylist) {
      return res.status(404).json({ message: "Stylist not found" });
    }

    // Check permissions
    if (req.user.role !== "superadmin" && req.user.role !== "admin") {
      if (stylist.company.toString() !== req.user.company.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    res.status(200).json(stylist);

} catch (err) {
console.error("getStylistWithServices error:", err);
res.status(500).json({ message: "Server error" });
}
};
// @desc Get stylists for a specific company (superadmin only)
// @route GET /api/users/company/:companyId/stylists
// @access Private (superadmin)

exports.getCompanyStylists = async (req, res, next) => {
try {
const { companyId } = req.params;

    // Allow superadmin OR admin of the same company
    if (req.user.role !== "superadmin") {
      // Check if user is admin of the requested company
      if (
        req.user.role !== "admin" ||
        req.user.company.toString() !== companyId
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    // Validate company ID
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      console.error("Invalid company ID format:", companyId);
      return res.status(400).json({ message: "Invalid company ID format" });
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

    res.status(200).json(formattedStylists);

} catch (err) {
console.error("getCompanyStylists error:", err);
res.status(500).json({ message: "Server error" });
}
};

> > > // Backend\models\User.js?
> > > const mongoose = require("mongoose");
> > > const bcrypt = require("bcryptjs");
> > > const jwt = require("jsonwebtoken");
> > > const userSchema = new mongoose.Schema({
> > > name: {

    type: String,
    required: true,

},
email: {
type: String,
required: true,
unique: true,
},
password: {
type: String,
required: true,
select: false,
},
phone: {
type: String,
default: "",
},
address: {
type: String,
default: "",
},
profileImage: {
type: String,
default: "",
},
role: {
type: String,
enum: ["customer", "styler", "admin", "superadmin"],
default: "customer",
},
expertise: {
type: String,
default: "General Styling",
},
schedule: {
type: String,
default: "Available",
},
rating: {
type: Number,
default: 0,
},
description: {
type: String,
default: "Professional stylist",
},
company: {
type: mongoose.Schema.Types.ObjectId,
ref: "Company",
},
services: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "Service",
},
],
createdAt: {
type: Date,
default: Date.now,
},
});

// 🔹 Hash password before saving
userSchema.pre("save", async function (next) {
if (!this.isModified("password")) return next();
this.password = await bcrypt.hash(this.password, 10);
next();
});

// 🔹 Compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function (enteredPassword) {
return await bcrypt.compare(enteredPassword, this.password);
};

// 🔹 (Optional) Generate JWT token directly from the model
userSchema.methods.getSignedJwtToken = function () {
return jwt.sign({ id: this.\_id }, process.env.JWT_SECRET, {
expiresIn: process.env.JWT_EXPIRE,
});
};

module.exports = mongoose.model("User", userSchema);

> > > // Backend/app.js
> > > const express = require("express");
> > > const cors = require("cors");
> > > const mongoose = require("mongoose");
> > > const cookieParser = require("cookie-parser");
> > > require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth.routes");
const companyRoutes = require("./routes/company.routes");
const userRoutes = require("./routes/user.routes");
const serviceRoutes = require("./routes/service.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const notificationRoutes = require("./routes/notification.routes");
const publicRoutes = require("./routes/public.routes");

// Initialize app
const app = express();
const allowedOrigins = [
"http://localhost:5173",
"https://styler-frontend.onrender.com",
"https://styler-d41n.onrender.com",
"https://stylerb.onrender.com",
];

// Database connection
mongoose
.connect(process.env.MONGODB_URI)
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(
cors({
origin: function (origin, callback) {
// Allow requests with no origin (like mobile apps or curl requests)
if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,

})
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/public", publicRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
res.status(200).json({
status: "OK",
message: "Server is running",
timestamp: new Date().toISOString(),
});
});

// Error handling middleware
app.use((err, req, res, next) => {
console.error("❌ Error:", err.stack);
res.status(500).json({
message: "Something went wrong!",
error: process.env.NODE_ENV === "development" ? err.message : undefined,
});
});

// 404 handler
app.use((req, res) => {
res.status(404).json({ message: "Route not found" });
});

module.exports = app;

> > > // Backend/index.js - Make sure this is your entry point
> > > const app = require("./app");
> > > const NotificationServer = require("./NotificationServer");

// Create and start the server with Socket.IO support
const server = new NotificationServer(app);

const PORT = process.env.PORT || 10000;

try {
server.initialize().start(PORT);
console.log(`✅ Server started on port ${PORT}`);
} catch (error) {
console.error("❌ Failed to start server:", error);
process.exit(1);
}

module.exports = server;

> > > // Frontend/src/context/AuthContext.js
> > > import { createContext } from "react";

// This file only exports the context
export const AuthContext = createContext();

> > > // Frontend/src/context/useAuth.js
> > > import { useContext } from "react";
> > > import { AuthContext } from "@/context/AuthContext";

export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) {
throw new Error("useAuth must be used within an AuthProvider");
}
return context;
};

> > > // Frontend\src\services\api.js

import axios from "axios";
import { API_BASE } from "@/config";

const api = axios.create({
baseURL: `${API_BASE}/api`,
withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
(config) => {
const token =
localStorage.getItem("token") ||
localStorage.getItem("authToken") ||
getCookie("token") ||
getCookie("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token available for authorization");
    }

    return config;

},
(error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
(response) => response,
(error) => {
console.error("API Error:", error.response?.status, error.message);

    if (error.response?.status === 401) {
      // Check current path
      const currentPath = window.location.pathname;

      // List of protected routes
      const protectedPaths = [
        "/dashboard",
        "/appointments",
        "/services",
        "/settings",
        "/stylists",
        "/bookings",
      ];

      // Redirect only if the user is in a protected route
      const isProtected = protectedPaths.some((path) =>
        currentPath.startsWith(path)
      );

      if (isProtected) {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);

}
);

// Helper function to get cookie
function getCookie(name) {
const value = `; ${document.cookie}`;
const parts = value.split(`; ${name}=`);
if (parts.length === 2) return parts.pop().split(";").shift();
return null;
}

export default api;

> > > // src/pages/Pricing.jsx
> > > export default function Pricing() {
> > > return (

    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight">
              Choose the plan that's right for you
            </p>
            <p className="text-[#49739c] text-sm font-normal leading-normal">
              Whether you're just starting out or scaling your business, we've
              got a plan to help you succeed.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(228px,1fr))] gap-2.5 px-4 py-3 @3xl:grid-cols-4">
          <div className="flex flex-1 flex-col gap-4 rounded-lg border border-solid border-[#cedbe8] bg-slate-50 p-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141c] text-base font-bold leading-tight">
                Basic
              </h1>
              <p className="flex items-baseline gap-1 text-[#0d141c]">
                <span className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em]">
                  $29
                </span>
                <span className="text-[#0d141c] text-base font-bold leading-tight">
                  /month
                </span>
              </p>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Choose Basic</span>
            </button>
            <div className="flex flex-col gap-2">
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                1 Stylist
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Basic Reporting
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Limited Bookings
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 rounded-lg border border-solid border-[#cedbe8] bg-slate-50 p-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141c] text-base font-bold leading-tight">
                Pro
              </h1>
              <p className="flex items-baseline gap-1 text-[#0d141c]">
                <span className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em]">
                  $49
                </span>
                <span className="text-[#0d141c] text-base font-bold leading-tight">
                  /month
                </span>
              </p>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Choose Pro</span>
            </button>
            <div className="flex flex-col gap-2">
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Up to 5 Stylists
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Advanced Reporting
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Unlimited Bookings
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Priority Support
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 rounded-lg border border-solid border-[#cedbe8] bg-slate-50 p-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141c] text-base font-bold leading-tight">
                Premium
              </h1>
              <p className="flex items-baseline gap-1 text-[#0d141c]">
                <span className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em]">
                  $99
                </span>
                <span className="text-[#0d141c] text-base font-bold leading-tight">
                  /month
                </span>
              </p>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Choose Premium</span>
            </button>
            <div className="flex flex-col gap-2">
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Unlimited Stylists
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Custom Reporting
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Unlimited Bookings
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
                  data-size="20px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Dedicated Account Manager
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col p-4 gap-3">
          <details
            className="flex flex-col rounded-lg border border-[#cedbe8] bg-slate-50 px-[15px] py-[7px] group"
            open=""
          >
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
              <p className="text-[#0d141c] text-sm font-medium leading-normal">
                What payment methods do you accept?
              </p>
              <div
                className="text-[#0d141c] group-open:rotate-180"
                data-icon="CaretDown"
                data-size="20px"
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </div>
            </summary>
            <p className="text-[#49739c] text-sm font-normal leading-normal pb-2">
              We accept all major credit cards, including Visa, MasterCard,
              American Express, and Discover. Payments are processed securely
              through our payment gateway.
            </p>
          </details>
          <details className="flex flex-col rounded-lg border border-[#cedbe8] bg-slate-50 px-[15px] py-[7px] group">
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
              <p className="text-[#0d141c] text-sm font-medium leading-normal">
                Can I change my plan later?
              </p>
              <div
                className="text-[#0d141c] group-open:rotate-180"
                data-icon="CaretDown"
                data-size="20px"
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </div>
            </summary>
            <p className="text-[#49739c] text-sm font-normal leading-normal pb-2">
              We accept all major credit cards, including Visa, MasterCard,
              American Express, and Discover. Payments are processed securely
              through our payment gateway.
            </p>
          </details>
          <details className="flex flex-col rounded-lg border border-[#cedbe8] bg-slate-50 px-[15px] py-[7px] group">
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
              <p className="text-[#0d141c] text-sm font-medium leading-normal">
                Is there a free trial available?
              </p>
              <div
                className="text-[#0d141c] group-open:rotate-180"
                data-icon="CaretDown"
                data-size="20px"
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </div>
            </summary>
            <p className="text-[#49739c] text-sm font-normal leading-normal pb-2">
              We accept all major credit cards, including Visa, MasterCard,
              American Express, and Discover. Payments are processed securely
              through our payment gateway.
            </p>
          </details>
          <footer className="flex justify-center">
            <div className="flex max-w-[960px] flex-1 flex-col">
              <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
                <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                  <a
                    className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                    href="#"
                  >
                    Terms of Service
                  </a>
                  <a
                    className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                  <a
                    className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                    href="#"
                  >
                    Contact Us
                  </a>
                </div>
                <p className="text-[#49739c] text-base font-normal leading-normal">
                  © {new Date().getFullYear()} StyleSeat. All rights reserved.
                </p>
              </footer>
            </div>
          </footer>
        </div>
      </div>
    </div>

);
}
