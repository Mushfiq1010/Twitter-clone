import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import connectmongoDB from "./db/connectmongoDB.js";
import cookieParser from "cookie-parser";
dotenv.config({ path: "./backend/.env" });

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.listen(8000,()=>{
    console.log("Server is listening on port 8000!");
    connectmongoDB();
});