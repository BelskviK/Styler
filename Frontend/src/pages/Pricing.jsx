// src/pages/Pricing.jsx
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlanSelect = (plan) => {
    if (!user) {
      navigate("/register/business");
      return;
    }

    // If user is already logged in, handle based on role
    if (user.role === "customer") {
      navigate("/forbusiness");
    } else {
      // For business users, show upgrade flow
      // Here you would typically integrate with payment processing
      console.log(`Selected plan: ${plan}`);
    }
  };

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individual stylists starting out",
      buttonText: "Get Started",
      popular: false,
      features: [
        "1 Stylist Account",
        "Basic Appointment Management",
        "Client Database (up to 100 clients)",
        "Email Notifications",
        "Online Booking Widget",
        "Basic Reporting & Analytics",
        "Mobile-Friendly Interface",
        "Email Support",
      ],
      roleBenefits: {
        styler: "Manage your own schedule and clients",
        customer: "Book with confidence",
      },
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Ideal for growing salons and multiple stylists",
      buttonText: "Most Popular",
      popular: true,
      features: [
        "Up to 5 Stylists",
        "Advanced Appointment Management",
        "Unlimited Clients",
        "SMS & Email Reminders",
        "Custom Booking Website",
        "Advanced Analytics & Reports",
        "Inventory Tracking",
        "Marketing Tools",
        "Priority Support",
        "Payment Processing",
      ],
      roleBenefits: {
        admin: "Manage your entire team efficiently",
        styler: "Focus on your craft while we handle the rest",
      },
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large salons and multi-location businesses",
      buttonText: "Contact Sales",
      popular: false,
      features: [
        "Unlimited Stylists",
        "Multi-Location Management",
        "Custom Branding",
        "API Access",
        "Advanced Integrations",
        "Custom Reporting",
        "Dedicated Account Manager",
        "24/7 Phone Support",
        "Training & Onboarding",
        "Custom Development",
      ],
      roleBenefits: {
        superadmin: "Complete control over your business ecosystem",
        admin: "Scale your operations seamlessly",
      },
    },
  ];

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and bank transfers for annual plans. All payments are processed securely through our PCI-compliant payment gateway.",
    },
    {
      question: "Can I change my plan later?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the start of your next billing cycle.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "We offer a 14-day free trial for all plans. No credit card required to start. Experience all features risk-free and see how StyleSeat can transform your business.",
    },
    {
      question: "Do you offer discounts for annual billing?",
      answer:
        "Yes! Save 20% when you choose annual billing. You'll get all the same features at a significantly reduced cost while simplifying your business expenses.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Absolutely. There are no long-term contracts. You can cancel your subscription at any time, and you'll continue to have access until the end of your billing period.",
    },
    {
      question: "What support do you offer?",
      answer:
        "All plans include email support. Professional and Enterprise plans include priority support with faster response times. Enterprise customers receive dedicated phone support and a personal account manager.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pricing Plans for Every Business Need
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're an independent stylist, growing salon, or
            multi-location enterprise, we have the perfect plan to help you
            thrive in the beauty industry.
          </p>
        </div>

        {/* Role-based messaging */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-blue-800 font-medium">
              {user.role === "customer"
                ? "Ready to grow your beauty business? Choose the perfect plan to get started."
                : user.role === "styler"
                ? "Upgrade your tools and take your styling business to the next level."
                : user.role === "admin"
                ? "Scale your salon operations with features designed for team management."
                : "Enterprise solutions for managing multiple locations and complex business needs."}
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 ${
                plan.popular
                  ? "border-blue-500 bg-white shadow-xl transform scale-105"
                  : "border-gray-200 bg-white shadow-lg"
              } p-8 flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex-1">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {plan.period}
                    </span>
                  </div>

                  {user && plan.roleBenefits[user.role] && (
                    <p className="text-sm text-green-600 font-medium mb-4">
                      {plan.roleBenefits[user.role]}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  } mb-6`}
                >
                  {plan.buttonText}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Plan Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="text-center py-4 font-semibold text-gray-900">
                    Starter
                  </th>
                  <th className="text-center py-4 font-semibold text-gray-900">
                    Professional
                  </th>
                  <th className="text-center py-4 font-semibold text-gray-900">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium text-gray-700">Stylists</td>
                  <td className="text-center py-4">1</td>
                  <td className="text-center py-4">Up to 5</td>
                  <td className="text-center py-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium text-gray-700">
                    Client Management
                  </td>
                  <td className="text-center py-4">✓</td>
                  <td className="text-center py-4">✓</td>
                  <td className="text-center py-4">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium text-gray-700">
                    Advanced Analytics
                  </td>
                  <td className="text-center py-4">-</td>
                  <td className="text-center py-4">✓</td>
                  <td className="text-center py-4">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 font-medium text-gray-700">
                    Priority Support
                  </td>
                  <td className="text-center py-4">-</td>
                  <td className="text-center py-4">✓</td>
                  <td className="text-center py-4">✓</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-700">
                    Dedicated Manager
                  </td>
                  <td className="text-center py-4">-</td>
                  <td className="text-center py-4">-</td>
                  <td className="text-center py-4">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-900 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of beauty professionals who trust StyleSeat to grow
            their business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register/business")}
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Support
            </a>
          </div>
          <p className="text-gray-600">
            © {new Date().getFullYear()} StyleSeat. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
