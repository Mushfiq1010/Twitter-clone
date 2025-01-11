import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getNotifications,deleteNotifications,deleteANotification } from "../controllers/notification.controller.js"
const router=express.Router();

router.get('/getnotifications',protectRoute,getNotifications);
router.delete('/deletenotifications',protectRoute,deleteNotifications);
router.delete('/deletenoti/:id',protectRoute,deleteANotification);



export default router;