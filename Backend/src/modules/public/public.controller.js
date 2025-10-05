import publicService from "./public.service.js";

/**
 * Get available stylists for a company
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getCompanyStylists(req, res) {
  try {
    const { companyId } = req.params;

    const result = await publicService.getCompanyStylists(companyId);

    if (!result.success) {
      return res.status(result.status || 500).json({
        message: result.error,
      });
    }

    res.status(200).json(result.data);
  } catch (error) {
    console.error("Controller error - getCompanyStylists:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Get available services for a stylist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getStylistServices(req, res) {
  try {
    const { stylistId } = req.params;

    const result = await publicService.getStylistServices(stylistId);

    if (!result.success) {
      return res.status(result.status || 500).json({
        message: result.error,
      });
    }

    res.status(200).json(result.data);
  } catch (error) {
    console.error("Controller error - getStylistServices:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Create appointment for non-authenticated users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
// export async function createPublicAppointment(req, res) {
//   try {
//     const notificationService = req.app.get("notificationService") || null;

//     const result = await publicService.createPublicAppointment(
//       req.body,
//       notificationService
//     );

//     if (!result.success) {
//       if (result.conflictingAppointment) {
//         return res.status(result.status).json({
//           message: result.error,
//           conflictingAppointment: result.conflictingAppointment,
//         });
//       }
//       return res.status(result.status || 500).json({
//         message: result.error,
//       });
//     }

//     res.status(201).json({
//       success: true,
//       appointment: result.data,
//     });
//   } catch (error) {
//     console.error("Controller error - createPublicAppointment:", error);
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// }
