// backend/database/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Mongoose v9+ doesn't need useNewUrlParser or useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('💡 Check:');
    console.log('1. MONGODB_URI in .env: mongodb+srv://InaSharma:Butterfly@cluster0.fquj3lq.mongodb.net/banasthali_startup?retryWrites=true&w=majority');
    console.log('2. MongoDB Atlas Network Access (IP whitelist)');
    console.log('3. Database user permissions');
    process.exit(1);
  }
};

module.exports = connectDB;