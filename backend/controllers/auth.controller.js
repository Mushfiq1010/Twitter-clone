import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {generateTokenAndSetCookies} from "../lib/utils/generateToken.js"
export const signup=async (req,res)=>{
 try {
    const {fullname,username,password,email} =req.body;


    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({error: "Invalid email format"});
    }

    const existingUser=await User.findOne({username});
    if(existingUser){
        return res.status(400).json({error: "Username already taken"});
    }
    const existingEmail=await User.findOne({email});
    if(existingEmail){
        return res.status(400).json({error: "You already have an account with this email"});
    }
   
    if(password.length<6){
        return res.status(400).json({error: "Password should be atleast 6 characters"})
    }

   const salt=await bcrypt.genSalt(10);
   const hashedPass=await bcrypt.hash(password,salt);

   const newUser=new User({
    username,
    fullname,email,
    password:hashedPass
   })

   if(newUser){
     generateTokenAndSetCookies(newUser._id,res);
     await newUser.save();
     res.status(201).json({
        _id:newUser._id,
        username:newUser.username,
        fullname:newUser.fullname,
        email:newUser.email,
        followers:newUser.followers,
        following:newUser.following,
        profileimg:newUser.profileimg,
        coverimg:newUser.coverimg,
        
     })
   }
   else{
    res.status(400).json({error: "Invalid user data"});
   }

 } catch (error) {
    console.log("Error in signup ",error.message);
    res.status(500).json({error: "Server error"});
 }
}

export const login=async (req,res)=>{
 try {
    const{username,password}=req.body;
    const user=await User.findOne({username});
    const isPassCorrect=bcrypt.compare(password,user?.password || "");

    if(!user || !isPassCorrect){
        return res.status(400).json({error: "Invalid username or password"});
    }

    generateTokenAndSetCookies(user._id,res);
    
    res.status(200).json({
       _id:user._id,
       username:user.username,
       fullname:user.fullname,
       email:user.email,
       followers:user.followers,
       following:user.following,
       profileimg: user.profileimg,
       coverimg:user.coverimg,
       
    })
 } catch (error) {
    console.log("Error in login ",error.message);
    res.status(500).json({error: "Server error"});
 }
}

export const logout=async (req,res)=>{
try {
    res.cookie("jwt","",{maxAge:0});
    res.status(200).json({message: "Logged out successfully"});
} catch (error) {
    console.log("Error in logout ",error.message);
    res.status(500).json({error: "Server error"});
}
}

export const getMe=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe ",error.message);
        res.status(500).json({error: "Server error"});
    }
}