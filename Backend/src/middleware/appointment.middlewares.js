import User from "../modules/user/user.model.js";
import mongoose from "mongoose";

export const updateCustomerAppointments = async function (doc) {
  try {
    console.log("🔄 Running customer appointment middleware...");
    console.log("📋 Appointment details:", {
      appointmentId: doc._id,
      customerId: doc.customer,
      customerPhone: doc.customerPhone,
      customerEmail: doc.customerEmail,
      isGuestBooking: doc.isGuestBooking,
      isAdminCreation: doc.isAdminCreation,
    });

    // Skip if this is an admin creation (let admin handle assignment manually)
    if (doc.isAdminCreation) {
      console.log("🛑 Skipping customer assignment - admin creation");
      return;
    }

    let customerIdToUpdate = doc.customer;

    // If no customer ID but this is a guest booking, try to find customer by phone/email
    if (!customerIdToUpdate && doc.isGuestBooking) {
      let foundCustomer = null;

      // Search by phone number (most reliable)
      if (doc.customerPhone) {
        foundCustomer = await User.findOne({
          phone: doc.customerPhone,
          role: "customer",
        });
        if (foundCustomer) {
          console.log(
            "📱 Middleware found customer by phone:",
            foundCustomer._id
          );
        }
      }

      // If not found by phone, search by email
      if (
        !foundCustomer &&
        doc.customerEmail &&
        doc.customerEmail !== "guest@example.com"
      ) {
        foundCustomer = await User.findOne({
          email: doc.customerEmail,
          role: "customer",
        });
        if (foundCustomer) {
          console.log(
            "📧 Middleware found customer by email:",
            foundCustomer._id
          );
        }
      }

      if (foundCustomer) {
        customerIdToUpdate = foundCustomer._id;
        // Update the appointment to link it to the customer
        await mongoose.model("Appointment").findByIdAndUpdate(doc._id, {
          customer: customerIdToUpdate,
          isGuestBooking: false,
        });
        console.log(
          "🔗 Middleware linked guest appointment to customer:",
          customerIdToUpdate
        );
      }
    }

    // Update customer's appointments array if we have a customer ID
    if (customerIdToUpdate) {
      console.log("👤 Updating customer appointments for:", customerIdToUpdate);

      const customer = await User.findById(customerIdToUpdate);
      if (customer && customer.role === "customer") {
        const updatedUser = await User.findByIdAndUpdate(
          customerIdToUpdate,
          { $addToSet: { appointments: doc._id } }, // Use $addToSet to avoid duplicates
          { new: true, useFindAndModify: false }
        );
        console.log("✅ Updated customer appointments:", customerIdToUpdate);
        console.log(
          "📊 Customer now has appointments:",
          updatedUser.appointments.length
        );
      } else {
        console.log("❌ Customer not found or not a customer role");
      }
    } else {
      console.log("ℹ️ No customer to update - remains as guest booking");
    }
  } catch (error) {
    console.error("❌ Error updating customer appointments:", error);
  }
};

export const updateStylistAppointments = async function (doc) {
  try {
    console.log("🔄 Running stylist appointment middleware...");

    if (doc.stylist) {
      console.log("💇 Updating stylist appointments for:", doc.stylist);

      const updatedStylist = await User.findByIdAndUpdate(
        doc.stylist,
        { $push: { appointments: doc._id } },
        { new: true, useFindAndModify: false }
      );
      console.log("✅ Updated stylist appointments:", doc.stylist);
      console.log(
        "📊 Stylist now has appointments:",
        updatedStylist.appointments
      );
    }
  } catch (error) {
    console.error("❌ Error updating stylist appointments:", error);
  }
};

export const updateCompanyAppointments = async function (doc) {
  try {
    console.log("🔄 Running company appointment middleware...");

    if (doc.company) {
      console.log("🏢 Updating company appointments for:", doc.company);

      const Company = mongoose.model("Company");
      const updatedCompany = await Company.findByIdAndUpdate(
        doc.company,
        { $push: { appointments: doc._id } },
        { new: true, useFindAndModify: false }
      );
      console.log("✅ Updated company appointments:", doc.company);
      console.log(
        "📊 Company now has appointments:",
        updatedCompany.appointments
      );
    }
  } catch (error) {
    console.error("❌ Error updating company appointments:", error);
  }
};

// Remove middleware functions (updated for admin logic)
export const removeCustomerAppointmentRef = async function (doc) {
  try {
    // Only remove from customer if it wasn't an admin creation
    if (!doc.isAdminCreation && !doc.isGuestBooking && doc.customer) {
      await User.findByIdAndUpdate(
        doc.customer,
        { $pull: { appointments: doc._id } },
        { new: true, useFindAndModify: false }
      );
    }
  } catch (error) {
    console.error("Error removing customer appointment ref:", error);
  }
};

export const removeStylistAppointmentRef = async function (doc) {
  try {
    if (doc.stylist) {
      await User.findByIdAndUpdate(
        doc.stylist,
        { $pull: { appointments: doc._id } },
        { new: true, useFindAndModify: false }
      );
    }
  } catch (error) {
    console.error("Error removing stylist appointment ref:", error);
  }
};

export const removeCompanyAppointmentRef = async function (doc) {
  try {
    if (doc.company) {
      const Company = mongoose.model("Company");
      await Company.findByIdAndUpdate(
        doc.company,
        { $pull: { appointments: doc._id } },
        { new: true, useFindAndModify: false }
      );
    }
  } catch (error) {
    console.error("Error removing company appointment ref:", error);
  }
};
