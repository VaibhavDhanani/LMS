import express from "express";
const router = express.Router();
import {createLecture,getLectureById,getInstructorLecture,joinLecture,endLecture,getStudentLecture,updateLecture,startLecture,deleteLecture} from "../controllers/lecture.controller.js";

router.get("/lectures/instructor", getInstructorLecture); // Create
router.get("/lectures/student", getStudentLecture); // Create
router.get("/lectures/:id", getLectureById); // Get lecture by ID
router.post("/lectures", createLecture);  // Create a new lecture
router.put("/lectures/:id", updateLecture); // Update lecture
router.post("/lectures/startlecture/:id",startLecture); 
router.post("/lectures/endlecture/:id",endLecture); 
router.post("/lectures/join/:id",joinLecture); 
router.delete("/lectures/:id", deleteLecture); // Delete lecture

export default router;
