import { Router } from "express";
import { createReview, deleteReview } from "../Controllers/ReviewController.js";
import VerifyToken from "../Helper/VerifyToken.js";
const router = Router();

router.post("/create", VerifyToken, createReview.validator, createReview.controller);

router.delete("/:id", VerifyToken, deleteReview.validator, deleteReview.controller);

export default router;