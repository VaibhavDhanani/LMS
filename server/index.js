import express from "express";
import { configDotenv } from 'dotenv';
configDotenv();
import connectDB from "./utills/dbConnection.js";
const app=express();
connectDB();
const port = process.env.PORT || 5000;


app.listen(port,()=>{
    
    console.log(`Server running on port ${port}`);
});