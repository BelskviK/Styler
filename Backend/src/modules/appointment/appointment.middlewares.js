import User from "../user/user.model.js";
import Appointment from "./appointment.model.js";
import Company from "../company/company.model.js";
import mongoose from "mongoose";

export const updateCustomerAppointments = async function (doc) {
  try {
    // ✅ FIRST: Check if relationships were handled by service
    if (doc.relationshipsHandledByService) {
      // Still update the appointments array if customer exists
      if (doc.customer) {
        await updateCustomerAppointmentsArray(doc.customer, doc._id);
      }
      return;
    }

    // ✅ SECOND: Check if customer assignment was handled by service
    if (
      doc.customerAssignedByService ||
      (doc.customer && !doc.isGuestBooking)
    ) {
      // Still update the appointments array
      if (doc.customer) {
        await updateCustomerAppointmentsArray(doc.customer, doc._id);
      }
      return;
    }

    let customerIdToUpdate = doc.customer;
    let shouldUpdateAppointment = false;

    // Search for customer by phone/email only for guest bookings or appointments without customer
    if (!customerIdToUpdate || doc.isGuestBooking) {
      let foundCustomer = null;

      // Search by phone number with normalization
      if (doc.customerPhone) {
        const normalizedAppointmentPhone = normalizePhoneNumber(
          doc.customerPhone
        );

        if (normalizedAppointmentPhone) {
          const allCustomers = await User.find({ role: "customer" });

          for (const customer of allCustomers) {
            if (customer.phone) {
              const normalizedCustomerPhone = normalizePhoneNumber(
                customer.phone
              );

              if (
                doPhoneNumbersMatch(
                  normalizedAppointmentPhone,
                  normalizedCustomerPhone
                )
              ) {
                foundCustomer = customer;
                console.log("✅ Found customer by phone match:", customer._id);
                break;
              }
            }
          }

          // Fallback to exact match
          if (!foundCustomer) {
            foundCustomer = await User.findOne({
              phone: doc.customerPhone,
              role: "customer",
            });
            if (foundCustomer) {
              console.log(
                "📱 Found customer by exact phone:",
                foundCustomer._id
              );
            }
          }
        }
      }

      // Search by email
      if (
        !foundCustomer &&
        doc.customerEmail &&
        doc.customerEmail !== "guest@example.com"
      ) {
        foundCustomer = await User.findOne({
          email: doc.customerEmail.toLowerCase().trim(),
          role: "customer",
        });
        if (foundCustomer) {
          console.log("📧 Found customer by email:", foundCustomer._id);
        }
      }

      if (foundCustomer) {
        customerIdToUpdate = foundCustomer._id;
        shouldUpdateAppointment = true;
        console.log(
          "🔗 Middleware will link appointment to customer:",
          customerIdToUpdate
        );
      }
    }

    // Update the appointment document if we found a customer
    if (shouldUpdateAppointment && customerIdToUpdate) {
      console.log(
        "📝 Updating appointment with customer ID:",
        customerIdToUpdate
      );
      await Appointment.findByIdAndUpdate(
        doc._id,
        {
          customer: customerIdToUpdate,
          isGuestBooking: false,
        },
        { new: true }
      );
      console.log("✅ Appointment updated with customer link");
    }

    // Update customer's appointments array if we have a customer ID
    if (customerIdToUpdate) {
      await updateCustomerAppointmentsArray(customerIdToUpdate, doc._id);
    } else {
      console.log("ℹ️ No customer to update - remains as guest booking");
    }
  } catch (error) {
    console.error("❌ Error updating customer appointments:", error);
  }
};

async function updateCustomerAppointmentsArray(customerId, appointmentId) {
  try {
    console.log("👤 Updating customer appointments array for:", customerId);

    const customer = await User.findById(customerId);
    if (customer && customer.role === "customer") {
      // Use $addToSet to prevent duplicates
      const updatedUser = await User.findByIdAndUpdate(
        customerId,
        { $addToSet: { appointments: appointmentId } },
        { new: true, useFindAndModify: false }
      );
      console.log("✅ Updated customer appointments array:", customerId);
      console.log(
        "📊 Customer now has appointments:",
        updatedUser.appointments.length
      );
    } else {
      console.log("❌ Customer not found or not a customer role");
    }
  } catch (error) {
    console.error("❌ Error updating customer appointments array:", error);
  }
}
// Phone number normalization function
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  try {
    let normalized = phone.toString().trim().replace(/\D/g, "");
    console.log(`📞 Phone normalization: "${phone}" -> "${normalized}"`);
    return normalized;
  } catch (error) {
    console.error("❌ Error normalizing phone number:", error);
    return phone;
  }
}

// Simple phone number matching using contains
function doPhoneNumbersMatch(phone1, phone2) {
  if (!phone1 || !phone2) return false;

  // Direct match
  if (phone1 === phone2) {
    console.log(`✅ Exact phone match: ${phone1} === ${phone2}`);
    return true;
  }

  // Check if one number contains the other
  if (phone1.includes(phone2)) {
    console.log(`✅ Phone match: ${phone1} contains ${phone2}`);
    return true;
  }

  if (phone2.includes(phone1)) {
    console.log(`✅ Phone match: ${phone2} contains ${phone1}`);
    return true;
  }

  console.log(`❌ No phone match: ${phone1} vs ${phone2}`);
  return false;
}

// Other middleware functions remain the same
export const updateStylistAppointments = async function (doc) {
  try {
    console.log("🔄 Running stylist appointment middleware...");

    // ✅ Skip if relationships were handled by service
    if (doc.relationshipsHandledByService) {
      console.log(
        "🛑 Stylist relationships handled by service, skipping middleware"
      );
      return;
    }

    if (doc.stylist) {
      console.log("💇 Updating stylist appointments for:", doc.stylist);
      const updatedStylist = await User.findByIdAndUpdate(
        doc.stylist,
        { $addToSet: { appointments: doc._id } }, // ✅ Use $addToSet to prevent duplicates
        { new: true, useFindAndModify: false }
      );
      console.log("✅ Updated stylist appointments:", doc.stylist);
    }
  } catch (error) {
    console.error("❌ Error updating stylist appointments:", error);
  }
};

export const updateCompanyAppointments = async function (doc) {
  try {
    console.log("🔄 Running company appointment middleware...");

    // ✅ Skip if relationships were handled by service
    if (doc.relationshipsHandledByService) {
      console.log(
        "🛑 Company relationships handled by service, skipping middleware"
      );
      return;
    }

    if (doc.company) {
      console.log("🏢 Updating company appointments for:", doc.company);
      const updatedCompany = await Company.findByIdAndUpdate(
        doc.company,
        { $addToSet: { appointments: doc._id } }, // ✅ Use $addToSet to prevent duplicates
        { new: true, useFindAndModify: false }
      );
      console.log("✅ Updated company appointments:", doc.company);
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
