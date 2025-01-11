import mongoose from "mongoose";

const notificationSchema=new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
       ref: 'User'
    },
   to:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
   ref: 'User'
   },
   noti:{
    type:String,
    required:true,
    enum:['follow','unfollow','like','comment']
   },
   read:{
    type:Boolean,
    default:false
   },
   postId:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default:null,
   }
},{timestamps:true});

const Notification=mongoose.model('Notification',notificationSchema);
export default Notification;