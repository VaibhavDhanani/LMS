import express from "express";
import {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentsByLearnerId,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

router.post("/enrollments", createEnrollment);
router.get("/enrollments", getAllEnrollments);
router.get("/enrollments/:id", getEnrollmentsByLearnerId);
router.put("/enrollments/:id", updateEnrollment);
router.delete("/enrollments/:id", deleteEnrollment);

export default router;
