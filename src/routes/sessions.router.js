import { Router } from "express";
import sessionController from "../controllers/sessions.controller.js";
import passport from "passport";

const router = Router();

//PASSPORT LOCAL
router.post("/signup", sessionController.signup);
router.post("/login", passport.authenticate("login", { failureMessage: true, failureRedirect: "/error" }), sessionController.login);
router.get('/current', passport.authenticate('jwt', { session: false }), sessionController.getCurrentUser);
router.get("/signout", sessionController.signout);
router.post("/restart/:id", sessionController.restartPassword);
router.post("/add-to-cart", sessionController.addToCart);
router.get("/cart-details", sessionController.getCartDetails);
router.post("/restore", sessionController.restorePassword);

// SIGNUP - LOGIN - PASSPORT GITHUB
router.get("/auth/github", sessionController.githubAuth);
router.get("/callback", passport.authenticate("github"), sessionController.githubCallback);

export default router;