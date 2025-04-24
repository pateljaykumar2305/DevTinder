import mongoose from 'mongoose';


const MONGODB_URI = "mongodb+srv://JayPatel:fiPa85iVechVXsZg@atlascluster.r4fzzjw.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster"
const connectDb = async () => {
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log(MONGODB_URI);
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in the environment variables');
    }
    await mongoose.connect(MONGODB_URI);
};

connectDb()
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.log('MongoDB connection error:', err);
    });

export default connectDb;