const axios = require("axios");

const USE_PAYZE = process.env.USE_PAYZE_SUBSCRIPTION === "true";

async function createSubscription(planId, userId) {
  if (!USE_PAYZE) {
    console.log("🔹 Payze disabled, returning dummy subscription");
    return {
      success: true,
      subscriptionId: "dummy-subscription-id",
      message: "Subscription created (dummy mode)",
    };
  }

  try {
    const response = await axios.post(
      "https://payze.io/api/subscription",
      {
        planId,
        userId,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYZE_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("❌ Payze error:", err.message);
    throw new Error("Payze subscription failed");
  }
}

module.exports = {
  createSubscription,
};
