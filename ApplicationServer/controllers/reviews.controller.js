import Review from "../models/review.js";
import Course from "../models/course.js";
import User from "../models/user.js";

const updateCourseRating = async (courseId) => {
  const reviews = await Review.find({ courseId });
  
  if (reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Course.findByIdAndUpdate(courseId, { 
      rating: parseFloat(averageRating.toFixed(1)) 
    });
  } else {
    await Course.findByIdAndUpdate(courseId, { rating: 0 });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { content, rating, courseId, learnerId } = req.body;
    const ratingValue = parseFloat(rating); // Convert to number
    
    // Input validation
    if (!content || !rating || !courseId || !learnerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate rating range
    if (ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Validate course and learner existence
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const learner = await User.findById(learnerId);
    if (!learner) return res.status(404).json({ error: "Learner not found" });

    // Check if learner is verified
    if (!learner.isVerified) {
      return res.status(403).json({ error: "Only verified users can submit reviews" });
    }

    // Check if learner is enrolled in the course
    const enrollment = await Enrollment.findOne({ 
      courseId, 
      learnerId 
    });

    if (!enrollment) {
      return res.status(403).json({ 
        error: "You must be enrolled in the course to submit a review" 
      });
    }

    // Check if learner has already reviewed this course
    const existingReview = await Review.findOne({ courseId, learnerId });
    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this course" });
    }

    // Create the review
    const review = await Review.create({ 
      content, 
      rating: ratingValue, 
      courseId, 
      learnerId 
    });

    // Update course reviews
    course.reviews.push(review._id);
    await course.save();

    // Update the learner with the new review
    learner.reviews.push(review._id);
    await learner.save();

    // Update course rating
    await updateCourseRating(courseId);

    res.status(201).json(review);
  } catch (error) {
    console.error('Review Creation Error:', error);
    res.status(500).json({ 
      error: "An unexpected error occurred", 
      details: error.message 
    });
  }
};


// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the review to get associated courseId and learnerId
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    const { courseId, learnerId } = review;

    // Delete the review
    await Review.findByIdAndDelete(id);

    // Update the course to remove the review
    const course = await Course.findById(courseId);
    if (course) {
      course.reviews.pull(id);
      await course.save();
    }

    // Update the learner to remove the review reference
    const learner = await User.findById(learnerId);
    if (learner) {
      learner.reviews.pull(id);
      await learner.save();
    }

    // Recalculate and update course rating
    await updateCourseRating(courseId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get reviews by course
export const getReviewsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({ courseId })
      .populate("learnerId", "name")
      .populate("courseId", "title");
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get reviews by learner
export const getReviewsByLearner = async (req, res) => {
  try {
    const { learnerId } = req.params;

    const reviews = await Review.find({ learnerId })
      .populate("courseId", "title");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};