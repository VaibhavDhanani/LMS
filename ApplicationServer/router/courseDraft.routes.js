import express from "express";
import {
    createCourseDraft,
    getAllCourseDrafts,
    getCourseDraftById,
    updateCourseDraft,
  deleteCourseDraft,
} from "../controllers/courseDraft.controller.js";

const router = express.Router();

router.post("/drafts", createCourseDraft);
router.get("/drafts", getAllCourseDrafts);
router.get("/drafts/:id", getCourseDraftById);
router.put("/drafts/:id", updateCourseDraft);
router.delete("/drafts/:id", deleteCourseDraft);

export default router;
