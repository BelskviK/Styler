// Backend\routes\appointment.routes.js
import express from "express";
const AppointmentRouter = express.Router();
import auth from "../middleware/auth.js";

import appointmentController from "../controllers/appointment.controller.js";

AppointmentRouter.get("/", auth, appointmentController.getAppointments);
AppointmentRouter.get(
  "/company/:companyId",
  auth,
  appointmentController.getAppointmentsByCompany
);
AppointmentRouter.get(
  "/styler/:companyId",
  auth,
  appointmentController.getAppointmentsByStyler
);

AppointmentRouter.get(
  "/today",
  auth,
  appointmentController.getTodayAppointments
); // Add this route
AppointmentRouter.get(
  "/upcoming",
  auth,
  appointmentController.getUpcomingAppointments
); // Add this route
AppointmentRouter.post("/", auth, appointmentController.createAppointment);
AppointmentRouter.put(
  "/:id/status",
  auth,
  appointmentController.updateAppointmentStatus
);
AppointmentRouter.delete("/:id", auth, appointmentController.deleteAppointment);
export default AppointmentRouter;
