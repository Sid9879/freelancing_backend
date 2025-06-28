const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User')

const connectDB = async()=>{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('MongoDB connected successfully');
    }).catch((error)=>{
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    })

}

async function fixCorruptedRatings() {
  const corrupted = await User.find({ $or: [
    { rating: { $type: "number" } },
    { rating: { $type: "object" }, "rating.value": { $exists: false } }
  ] });

  console.log(`Found ${corrupted.length} corrupted user(s)`);

  for (let user of corrupted) {
    user.rating = [];
    await user.save();
    console.log(`✅ Fixed user ${user._id}`);
  }
}
// fixCorruptedRatings()
module.exports = connectDB;