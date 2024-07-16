const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    user: {
        type:String,
    },
    text: {
        type:String,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const task = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    postAttachement:{
        type:String,
    },
    post:{
        type:String,
    },
    description:{
        type:String
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [commentSchema]
})


const taskData = mongoose.model("task",task)

module.exports = taskData;