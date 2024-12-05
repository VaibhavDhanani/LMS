import express from "express";
import { configDotenv } from 'dotenv';
import connectDB from "./utills/dbConnection.js";
import userRoutes from "./router/user.routes.js";
import courseRoutes from "./router/course.routes.js";
import enrollmentRoutes from "./router/enrollment.routes.js";
import reviewRoutes from "./router/reviews.routes.js";
configDotenv();
const app=express();
connectDB();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/api",userRoutes,courseRoutes,enrollmentRoutes,reviewRoutes);

app.listen(port,()=>{
    
    console.log(`Server running on port ${port}`);
});