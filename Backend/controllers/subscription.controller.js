// Backend/controllers/subscription.controller.js
const { createSubscription } = require("../utils/payze");

exports.subscribeUser = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const result = await createSubscription(planId, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("subscribeUser error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
