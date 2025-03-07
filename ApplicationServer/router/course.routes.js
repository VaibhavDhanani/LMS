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
import authenticateToken from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/courses", authenticateToken,createCourse);
router.get("/courses/users",authenticateToken, getInstructorCourse);
router.get("/courses/enrolled/:id",authenticateToken, getStudentCourse);
router.get("/courses/:id", getCourseById);
router.get("/courses", getAllCourses);
router.put("/courses/:id/status",authenticateToken, updateCourseStatus);
router.put("/courses/:id",authenticateToken, updateCourse);
router.delete("/courses/:id",authenticateToken, deleteCourse);

export default router;
