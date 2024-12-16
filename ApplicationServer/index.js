import express from "express";
import { configDotenv } from 'dotenv';
import cors from "cors";
import connectDB from "./utills/dbConnection.js";
import userRoutes from "./router/user.routes.js";
import courseRoutes from "./router/course.routes.js";
import enrollmentRoutes from "./router/enrollment.routes.js";
import reviewRoutes from "./router/reviews.routes.js";
import courseDraft from "./router/courseDraft.routes.js";
configDotenv();
const app=express();
connectDB();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // Allow cookies or authentication headers
  }));
const port = process.env.PORT || 5000;


app.use("/api",userRoutes,courseDraft,courseRoutes,enrollmentRoutes,reviewRoutes);

app.listen(port,()=>{
    
    console.log(`Server running on port ${port}`);
});