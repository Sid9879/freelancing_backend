const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
    members:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    message:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"message"
    }
},{timestamps:true});

module.exports = mongoose.model("conversation",conversationSchema);