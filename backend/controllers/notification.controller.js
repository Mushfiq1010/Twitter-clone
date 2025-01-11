import Notification from "../models/notification.model.js";

export const getNotifications=async(req,res)=>{
    try {
        const userId=req.user._id;
        const notifications=await Notification.find({to:userId}).sort({createdAt: -1}).populate({
            path:"from",
            select:"username profileimg"
        })
        await Notification.updateMany({to:userId},{read:true});
        res.status(200).json(notifications);
    } catch (error) {
        console.log("Error in getting notifications ",error.message);
        res.status(500).json({error: "Server error"});
    }
}

export const deleteNotifications=async(req,res)=>{
    try {
        const userId=req.user._id;
        await Notification.deleteMany({to:userId});
        res.status(200).json({message: "Notification deleted"});
    } catch (error) {
        console.log("Error in deleting notifications ",error.message);
        res.status(500).json({error: "Server error"});
    }
}

export const deleteANotification=async(req,res)=>{
    try {
        const notiId=req.params.id;
        const noti=await Notification.findById(notiId);
        if(!noti) return res.status(404).json({message: "Notification not found"});
        await Notification.findByIdAndDelete(notiId);
        res.status(200).json({message: "Notification deleted"});
    } catch (error) {
        console.log("Error in deleting the notification",error.message);
        res.status(500).json({error: "Server error"});
    }
}