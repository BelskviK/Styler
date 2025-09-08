import api from "./api";

const USE_PAYZE = import.meta.env.VITE_USE_PAYZE_SUBSCRIPTION === "true";

export async function subscribe(planId) {
  if (!USE_PAYZE) {
    console.log("🔹 Payze disabled, returning dummy subscription");
    return {
      success: true,
      subscriptionId: "dummy-subscription-id",
      message: "Subscription created (dummy mode)",
    };
  }

  // Call backend subscription API
  const res = await api.post("/subscriptions", { planId });
  return res.data;
}
