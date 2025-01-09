import mongoose from "mongoose";

const connectmongoDB=async()=>{
try {
    const connect=await mongoose.connect(process.env.MONGO_URL)
    console.log(`MONGODB connected : ${connect.connection.host}`);
} catch (error) {
    console.error(`Error connection to mongoDB: ${error.message}`);
    process.exit(1);
}


}

export default connectmongoDB;