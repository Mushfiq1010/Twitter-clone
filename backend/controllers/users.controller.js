import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";
export const userProfile=async(req,res)=>{
const {username}=req.params;
try {
    const user=await User.findOne({username}).select("-password");
    if(!user){
        return res.status(404).json({error: "user not found"});
    }
    res.status(200).json(user);
} catch (error) {
    console.log("Error in userprofile ",error.message);
    res.status(500).json({error: "Server error"});
}

}

export const follow=async(req,res)=>{
    try {
        const {id}=req.params;
        const otherUser=await User.findById(id);
        const myUser=await User.findById(req.user._id);
        
        if(id==req.user._id.toString()){
            return res.status(400).json({message: "You can't follow yourself"});
        }

        if(!otherUser || !myUser){
            return res.status(404).json({error: "user not found"});
        }

        const isFollowing= myUser.following.includes(id);
        if(isFollowing){
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}});
            const newNoti=new Notification({
                noti:'unfollow',
                from: req.user._id,
                to: id,
            })

            await newNoti.save();
            res.status(200).json({message: "You have unfollowed this user"});
        }

        else{
            await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$push:{following:id}});
            const newNoti=new Notification({
                noti:'follow',
                from: req.user._id,
                to: id,
            })

            await newNoti.save();
            res.status(200).json({message: "You have started following this user"});
        }
    } catch (error) {
        console.log("Error in follow ",error.message);
    res.status(500).json({error: "Server error"});
    }
}

export const updateProfile=async(req,res)=>{
const {username,fullname,currentpassword,newPassword,bio,link}=req.body;
let {profileimg,coverimg}=req.body;
const userId=req.user._id;

try {
    let user=await User.findById(userId);
    if(!user){
        return res.status(404).json({error: "user not found"});
    }

    if(username){
        const exists=await User.findOne({username});
        if(exists){
            return res.status(400).json({error: "Username already taken"});
        }
        user.username=username;
    }

    if((!currentpassword && newPassword) || (currentpassword && !newPassword)) {
        return res.status(400).json({error: "Please enter both current and new password"});
    }
    if(currentpassword && newPassword){
        const isCorrect=await bcrypt.compare(currentpassword,user.password);
        if(!isCorrect){
         return res.status(400).json({error: "Invalid current password"});
        }
        if(newPassword.length <6){
            return res.status(400).json({error: "New password must have atleast 6 characters"});
        }
        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(newPassword,salt);
    }

    if(profileimg){
        if(user.profileimg){
            await cloudinary.uploader.destroy(user.profileimg.split("/").pop().split(".")[0]);
        }
       const uploadres=await cloudinary.uploader.upload(profileimg);
       profileimg=uploadres.secure_url;
    }

    if(coverimg){
        if(user.coverimg){
            await cloudinary.uploader.destroy(user.coverimg.split("/").pop().split(".")[0]);
        }
        const uploadres=await cloudinary.uploader.upload(coverimg);
        coverimg=uploadres.secure_url;
    }


    user.fullname=fullname || user.fullname;
    user.bio=bio || user.bio;
    user.link=link || user.link;
    user.profileimg=profileimg || user.profileimg;
    user.coverimg=coverimg || user.coverimg;

    user=await user.save();
    user.password=null;
    res.status(200).json(user);
} catch (error) {
    console.log("Error in profile update ",error.message);
    res.status(500).json({error: "Server error"});
}


}


export const getSuggestedUsers=async(req,res)=>{
try {
    const userId=req.user._id;
    const usersFollowed=await User.findById(userId).select("following");

    const suggestions=await User.aggregate([
        {
            $match: {
                _id:{$ne:userId}
            }
        },
        {
         $sample:{size:10}   
        }
    ])
    const filteredSuggestions=suggestions.filter(user=>!usersFollowed.following.includes(user._id));
    const finalSuggestions=filteredSuggestions.slice(0,4);
    finalSuggestions.forEach((user)=>{
        user.password=null;
    })
    return res.status(200).json(finalSuggestions);
} catch (error) {
    console.log("Error in suggested_users ",error.message);
    res.status(500).json({error: "Server error"});
}
}

export const getmyLikedPosts=async(req,res)=>{
    try {
        const user=await User.findById(req.user.id);
        if(!user) return res.status(404).json({error: "user not found"});
        const myLiked=await Post.find({_id: {$in:user.likedPosts}}).sort({createdAt: -1}).populate({
            path:"user",
            select:"-password -posts -likedPosts"
        });
        res.status(200).json(myLiked);
    } catch (error) {
        console.log("Error in fetching my liked ",error.message);
    res.status(500).json({error: "Server error"});
    }
}