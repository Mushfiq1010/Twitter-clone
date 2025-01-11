import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from "cloudinary";
export const createPost=async (req,res)=>{
    try {
        const {text}=req.body;
        let {img}=req.body;
        const userId=req.user._id.toString();
    
        const user=await User.findById(userId);
        if(!user) return res.status(404).json({error: "user not found"});
        if(!text && !img) return res.status(400).json({error: "Post must have some text or image"});
        
        if(img){
            const uploadres=await cloudinary.uploader.upload(img);
            img=uploadres.secure_url;
        }

        const newPost=new Post({
            user:userId,
            text,
            img

        });
        await newPost.save();
        await User.updateOne({_id:req.user._id},{$push: {posts:newPost._id}});
        res.status(201).json(newPost);
    } catch (error) {
        console.log("Error in creating post ",error.message);
        res.status(500).json({error: "Server error"});
    }

    
}

export const deletePost=async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id);
        if(!post) return res.status(404).json({error: "Post not found"});
        if(post.user.toString()!=req.user._id.toString()) return res.status(400).json({error: "You cannot delete other's posts"});
        
        if(post.img){
           await cloudinary.uploader.destroy( post.img.split("/").pop().split(".")[0]);
        }
        await User.updateOne({_id:req.user._id},{$pull:{posts:post._id}});
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Post removed"});

    } catch (error) {
        console.log("Error in deleting post ",error.message);
        res.status(500).json({error: "Server error"});
    }
}

export const CommentOnPost=async (req,res)=>{
    try {
        const{text}=req.body;
        const post=await Post.findById(req.params.id);
        if(!text) return res.status(400).json({error: "Some text required to post comment"});
        if(!post) return res.status(404).json({error: "Post not found"});
    
        post.comments.push({user: req.user._id,text});
        await post.save();
        const notification=new Notification({
            from:req.user._id,
            to:post.user,
            noti:"comment",
            postId:req.params.id
         })
         await notification.save();
        res.status(200).json(post);
    } catch (error) {
        console.log("Error in commenting on post ",error.message);
        res.status(500).json({error: "Server error"});
    }


}

export const likePost=async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id);
        if(!post) return res.status(404).json({error: "Post not found"});

        const isLiked=post.likes.includes(req.user._id);
        if(!isLiked){
        await Post.findByIdAndUpdate(req.params.id,{$push:{likes:req.user._id}});
        await post.save();
        await User.updateOne({_id:req.user._id},{$push:{likedPosts:req.params.id}});
        const notification=new Notification({
            from:req.user._id,
            to:post.user,
            noti:"like",
            postId:req.params.id
         })
         await notification.save();
        res.status(200).json({message: "You reacted to the post"});
        }
        else{
            await Post.findByIdAndUpdate(req.params.id,{$pull:{likes:req.user._id}});
            await User.updateOne({_id:req.user._id},{$pull:{likedPosts:req.params.id}});
            await post.save();
            await Notification.deleteOne({
                from:req.user._id,
                to:post.user,
                noti:"like",
                postId:req.params.id
            })
            res.status(200).json({message: "You removed reaction from the post"});
        }
     


    } catch (error) {
        console.log("Error in liking the post ",error.message);
        res.status(500).json({error: "Server error"});
    }
}

export const getAllPosts=async(req,res)=>{
    try {
        const posts=await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path:"comments.user",
            select: "-password"
        }).populate({
            path:"likes.user",
            select: "-password"
        });

        if(posts.length === 0){
          return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in fetching all posts",error.message);
        res.status(500).json({error: "Server error"});
    }
}

export const getUserPosts=async (req,res)=>{
    try {
        const user=await User.findOne({username:req.params.username});
        if(!user) return res.status(404).json({error: "user not found"});
        const userposts=await Post.find({_id: {$in:user.posts}}).sort({createdAt: -1}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"likes.user",
            select:"-password"
        }).populate({
              path:"comments.user",
            select:"-password"
        });
        res.status(200).json(userposts);
    } catch (error) {
        console.log("Error in fetching user posts",error.message);
        res.status(500).json({error: "Server error"});
    }
}

export const getFollowingPosts=async (req,res)=>{
    try {
        const user=await User.findById(req.user._id);
        if(!user) return res.status(404).json({error: "user not found"});
        const followedUsers=user.following;
        const feedPosts=await Post.find({user:{$in:followedUsers}}).sort({createdAt: -1}).populate({
            path:"user",
            select:"-password -posts -likedPosts"
        }).populate({
            path:"likes.user",
            select:"-password -posts -likedPosts"
        }).populate({
             path:"comments.user",
            select:"-password -posts -likedPosts"
        });
     res.status(200).json(feedPosts);
    } catch (error) {
        console.log("Error in fetching following posts",error.message);
        res.status(500).json({error: "Server error"});
    }
}