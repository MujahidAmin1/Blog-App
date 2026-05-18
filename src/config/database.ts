
import mongoose from "mongoose";
export const connectDB = async(): Promise<void> => {
    try {
        const mongoURI = process.env['MONGODB_URI'];
        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        await mongoose.connect(mongoURI);
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
    

}

export const disconnectDB = async(): Promise<void> => {
    try {
        await mongoose.connection.close();
    } catch (error) {
        console.error("Failed to disconnect from MongoDB", error);
    }
}