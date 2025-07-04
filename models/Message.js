const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    text:{
        type:String,
        required:true,
    }
},{timestamps:true});

module.exports = mongoose.model('message',messageSchema);