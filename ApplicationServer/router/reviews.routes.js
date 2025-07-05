import express from "express";
import { 
  createReview, 
  deleteReview, 
  getReviewsByCourse, 
  getReviewsByLearner ,
  getLatestReviews
} from "../controllers/reviews.controller.js";

import authenticateToken from "../middlewares/auth.middleware.js";
const router = express.Router();

// Add a new review
router.post("/reviews",authenticateToken, createReview);

// Delete a review by ID
router.delete("reviews/:id",authenticateToken, deleteReview);

// Get reviews for a course
router.get("/reviews/latest", getLatestReviews);
router.get("/reviews/:courseId",authenticateToken, getReviewsByCourse);

// Get reviews by a learner
router.get("/reviews/:learnerId",authenticateToken, getReviewsByLearner);

export default router;
