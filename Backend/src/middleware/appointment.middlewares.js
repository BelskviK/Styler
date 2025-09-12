// Backend/middleware/appointmentMiddlewares.js
import User from "../modules/user/user.model.js";
import Company from "../modules/company/company.model.js";
// Middleware to update Company with appointment reference
export const updateCompanyAppointments = async function (doc) {
  try {
    await Company.findByIdAndUpdate(
      doc.company,
      { $push: { appointments: doc._id } },
      { new: true, useFindAndModify: false }
    );
  } catch (error) {
    console.error("Error updating company appointments:", error);
  }
};

// Middleware to update Customer (user with role 'customer')
export const updateCustomerAppointments = async function (doc) {
  try {
    // Only update if it's not a guest booking and customer exists
    if (!doc.isGuestBooking && doc.customer) {
      // Find the customer and verify their role
      const customer = await User.findById(doc.customer);
      if (customer && customer.role === "customer") {
        await User.findByIdAndUpdate(
          doc.customer,
          { $push: { appointments: doc._id } },
          { new: true, useFindAndModify: false }
        );
      }
    }
  } catch (error) {
    console.error("Error updating customer appointments:", error);
  }
};

// Middleware to update Stylist (user with role 'styler')
export const updateStylistAppointments = async function (doc) {
  try {
    // Find the stylist and verify their role
    const stylist = await User.findById(doc.stylist);
    if (stylist && stylist.role === "styler") {
      await User.findByIdAndUpdate(
        doc.stylist,
        { $push: { appointments: doc._id } },
        { new: true, useFindAndModify: false }
      );
    }
  } catch (error) {
    console.error("Error updating stylist appointments:", error);
  }
};
// Add to appointmentMiddlewares.js
export const removeCompanyAppointmentRef = async function (doc) {
  try {
    await Company.findByIdAndUpdate(
      doc.company,
      { $pull: { appointments: doc._id } },
      { new: true, useFindAndModify: false }
    );
  } catch (error) {
    console.error("Error removing company appointment reference:", error);
  }
};

export const removeCustomerAppointmentRef = async function (doc) {
  try {
    if (!doc.isGuestBooking && doc.customer) {
      await User.findByIdAndUpdate(
        doc.customer,
        { $pull: { appointments: doc._id } },
        { new: true, useFindAndModify: false }
      );
    }
  } catch (error) {
    console.error("Error removing customer appointment reference:", error);
  }
};

export const removeStylistAppointmentRef = async function (doc) {
  try {
    await User.findByIdAndUpdate(
      doc.stylist,
      { $pull: { appointments: doc._id } },
      { new: true, useFindAndModify: false }
    );
  } catch (error) {
    console.error("Error removing stylist appointment reference:", error);
  }
};
