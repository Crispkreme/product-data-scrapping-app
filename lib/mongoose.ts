import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {

    mongoose.set('strictQuery', true);

    if(!process.env.MONGODB_URI) return console.log('MONGODB_URI is not defined');
    if(isConnected) return console.log(' => using existing database connection');

    try {
        
        await mongoose.connect(process.env.MONGODB_URI);

        let isConnected = true;

        console.log('MONGO DB is now connected');

    } catch (error) {
        console.log(error);
    }
}