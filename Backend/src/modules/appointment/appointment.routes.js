// Backend\routes\appointment.routes.js
import express from "express";
const AppointmentRouter = express.Router();
import auth from "../../middleware/auth.js";

import {
  getAppointments,
  getAppointmentsByCompany,
  getAppointmentsByStyler,
  getTodayAppointments,
  getUpcomingAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  checkAvailability,
} from "./appointment.controller.js";

AppointmentRouter.get("/", auth, getAppointments);
AppointmentRouter.get("/company/:companyId", auth, getAppointmentsByCompany);
AppointmentRouter.get("/styler/:companyId", auth, getAppointmentsByStyler);

AppointmentRouter.get("/today", auth, getTodayAppointments);
AppointmentRouter.get("/upcoming", auth, getUpcomingAppointments);
AppointmentRouter.post("/", auth, createAppointment);
AppointmentRouter.put("/:id/status", auth, updateAppointmentStatus);
AppointmentRouter.delete("/:id", auth, deleteAppointment);
export default AppointmentRouter;
