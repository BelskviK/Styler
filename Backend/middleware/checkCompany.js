const checkCompany = async (req, res, next) => {
  try {
    if (req.user.role === "superadmin" && !req.user.company) {
      return res.status(403).json({
        message: "Superadmin must be associated with a company",
      });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export default checkCompany;
