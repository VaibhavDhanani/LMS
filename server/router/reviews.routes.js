import express from "express";
import { 
  createReview, 
  deleteReview, 
  getReviewsByCourse, 
  getReviewsByLearner 
} from "../controllers/reviews.controller.js";

const router = express.Router();

// Add a new review
router.post("/reviews", createReview);

// Delete a review by ID
router.delete("reviews/:id", deleteReview);

// Get reviews for a course
router.get("/reviews/:courseId", getReviewsByCourse);

// Get reviews by a learner
router.get("/reviews/:learnerId", getReviewsByLearner);

export default router;
