import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { userProfile,follow,updateProfile,getSuggestedUsers,getmyLikedPosts } from "../controllers/users.controller.js";
const router=express.Router();

router.get('/profile/:username',protectRoute,userProfile);
router.get('/suggested',protectRoute,getSuggestedUsers);
router.get('/myliked',protectRoute,getmyLikedPosts);
router.post('/follow/:id',protectRoute,follow);
router.post('/updateProfile',protectRoute,updateProfile);

export default router;