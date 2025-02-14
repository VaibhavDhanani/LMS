import express from "express";
const router = express.Router();
import {createLecture,getLectureById,getInstructorLecture,joinLecture,getStudentLecture,updateLecture,startLecture,deleteLecture} from "../controllers/lecture.controller.js";

router.post("/lectures", createLecture);  // Create a new lecture
router.get("/lectures/:id", getLectureById); // Get lecture by ID
router.get("/lectures/instructor/:id", getInstructorLecture); // Create
router.get("/lectures/student/:id", getStudentLecture); // Create
router.put("/lectures/:id", updateLecture); // Update lecture
router.post("/lectures/startlecture/:id",startLecture); 
router.post("/lectures/join/:id",joinLecture); 
router.delete("/lectures/:id", deleteLecture); // Delete lecture

export default router;
