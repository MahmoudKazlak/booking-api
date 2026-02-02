import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as bookingController from "./controller/booking.controller.js";
import { endpoint } from "../indexEndpoint.js";

const router = Router();

router.post("/book", auth(endpoint.All), bookingController.createBooking);
router.put("/cancel/:id", auth(endpoint.All), bookingController.cancelBooking);
router.put(
  "/complete/:id",
  auth(endpoint.All),
  bookingController.completeBooking
);
router.patch(
  "/revert/:id",
  auth(endpoint.Admin),
  bookingController.revertBooking
);
router.patch("/edit/:id", auth(endpoint.Admin), bookingController.editBooking);

export default router;
