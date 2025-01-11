import express from "express"
import { protectRoute } from "../middleware/protectRoute.js";
import {createPost,deletePost,CommentOnPost,likePost,getAllPosts,getUserPosts,getFollowingPosts} from "../controllers/post.controller.js";
const router=express.Router();
router.get('/all',protectRoute,getAllPosts);
router.get('/userposts/:username',protectRoute,getUserPosts);
router.get('/followingposts',protectRoute,getFollowingPosts);
router.post('/create',protectRoute,createPost);
router.delete('/delete/:id',protectRoute,deletePost);
router.post('/like/:id',protectRoute,likePost);
router.post('/comment/:id',protectRoute,CommentOnPost);





export default router;
