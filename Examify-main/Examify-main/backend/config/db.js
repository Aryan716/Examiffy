const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        
        if (!mongoURI) {
            console.error('MONGO_URI is not set in .env file');
            process.exit(1);
        }
        
        const options = {
            dbName: 'examify',
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
        };
        
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(mongoURI, options);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.error('\nTroubleshooting tips:');
        console.error('1. Check your internet connection');
        console.error('2. Verify MongoDB Atlas cluster is running (not paused)');
        console.error('3. Check if your IP is whitelisted in MongoDB Atlas Network Access');
        console.error('4. Verify your MongoDB Atlas connection string is correct');
        console.error('5. For local development, you can use: mongodb://localhost:27017/examify');
        process.exit(1);
    }
};

module.exports = connectDB;