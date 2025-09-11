import authService from "./auth.service.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private (admin/superadmin only)
export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    if (role === "customer") {
      return res.status(400).json({
        success: false,
        message: "Cannot register customers through admin interface",
      });
    }

    const user = await authService.registerUser({
      name,
      email,
      password,
      role,
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
    if (err.message === "User already exists") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
}

// @desc    Public self-registration (customers)
// @route   POST /api/auth/register/customer
// @access  Public
export async function registerCustomer(req, res) {
  try {
    const { name, email, password } = req.body;

    const user = await authService.registerCustomer({
      name,
      email,
      password,
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
    if (err.message === "User already exists") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error during customer registration",
    });
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await authService.loginUser({ email, password });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid credentials") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export async function getMe(req, res) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
export async function logout(req, res) {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
}
