import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  getInstructorCourse,
  deleteCourse,
  getStudentCourse,
  updateCourseStatus,
} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/courses", createCourse);
router.get("/courses", getAllCourses);
router.get("/courses/:id", getCourseById);
router.put("/courses/:id/status", updateCourseStatus);
router.get("/courses/users/:id", getInstructorCourse);
router.get("/courses/enrolled/:id", getStudentCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

export default router;
