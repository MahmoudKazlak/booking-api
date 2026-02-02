import { Router } from "express";
const router = Router();
import * as authController from "./controller/auth.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./auth.validation.js";
router.post(
  "/signup",
  validation(validators.signup),
  asyncHandler(authController.signup)
);
router.get("/confirmEmail/:token", asyncHandler(authController.confirmEmail));
router.post(
  "/signin",
  validation(validators.signin),
  asyncHandler(authController.signIn)
);
router.post(
  "/sendCode",
  validation(validators.sendCode),
  asyncHandler(authController.sendCode)
);
router.post(
  "/forgotPassword",
  validation(validators.forgotPassword),
  asyncHandler(authController.forgotPassword)
);
router.get("/refreshToken/:token", asyncHandler(authController.refreshToken));

export default router;
