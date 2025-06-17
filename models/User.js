const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Name must be at least 4 characters long'],
        maxlength: [50, 'Name must be less than 50 characters long'],
         set: name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    },
    role:{
        type: String,
        enum: ["freelancer",'client'],
        required: true,
    },
    email:{
        type: String,
        required: [true,'email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: [true,'password is required'],
    },
    profilePicture: {
        type: String,
        default: 'https://res.cloudinary.com/dhsb9luqr/image/upload/v1731955238/samples/people/boy-snow-hoodie.jpg'
    },

    phone:{
        type:Number,
        required: [true,'phone number is required'],
        unique: true,
        trim: true,
    },
     address: {
    city: {
      type: String,
      trim: true,
    },
    pincode: {
      type: Number,
      trim: true,
    },
    stateCode: {
      type: String,
      trim: true,
    },
    stateName: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      trim: true,
    },
    countryName: {
      type: String,
      trim: true,
    }
},
skills:[String],
rating: [
    {
      value: { type: Number, min: 0, max: 5, default: 0 },
      createdAt: { type: Date, default: Date.now },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,required:true },
    },
  ],

isOnline: {
    type: Boolean,
    default: false
},
createdAt: {
    type: Date,
    default: Date.now
},

},{timestamps: true});


userSchema.add({
  appliedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }
],
postedJobs:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
}],
 
avgRating: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);