import { Router } from "express";
const router = Router();
import * as tripController from "./controller/trip.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { auth } from "../../middleware/auth.js";
import { endpoint } from "../indexEndpoint.js";
import { fileValidation, HME, myMulter } from "../../services/multer.js";

router.post(
  "/create",
  auth(endpoint.Admin),
  HME,
  myMulter(fileValidation.image).array("images", 5),
  tripController.createTrip
);

router.post(
  "/edit/:id",
  auth(endpoint.Admin),
  HME,
  myMulter(fileValidation.image).array("images", 5),
  tripController.editTrip
);
router.delete("/delete/:id", auth(endpoint.Admin), tripController.deleteTrip);
router.get("/getAll", auth(endpoint.All), tripController.getAllTrips);
router.get("/get/:id", auth(endpoint.All), tripController.getTripById);
router.put(
  "/toggleStatus/:id",
  auth(endpoint.Admin),
  tripController.toggleTripStatus
);
router.get("/activeTrips", auth(endpoint.All), tripController.getActiveTrips);

export default router;
