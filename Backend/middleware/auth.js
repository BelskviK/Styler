// Backend\middleware\auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Get token from cookies, Authorization header, or query
    const token =
      req.cookies.token ||
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user and attach to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    next();
  } catch (err) {
    console.error("Authentication error:", err);

    // Specific error handling
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// Role authorization
auth.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = auth;
