const mongoose = require('mongoose')
const express = require('express')
const multer = require('multer')
const taskData = require('./taskSchema')

const app = express();
const PORT = 1234;
app.use(express.json())
app.use('/attach', express.static('attach'));

// Building Connection
mongoose.connect('mongodb://localhost:27017/Task-2')
.then(()=>{
    console.log("DB Connected")
}).catch(err=>{console.log(err)});

// Defining Multer
let storage= multer.diskStorage({
    destination:function(req,file,cb){
    cb(null,'attach')
    },

    filename:function(req,file,cb){
        cb(null,file.fieldname+ '-'+Date.now()+'.'+file.originalname.split('.')
		[file.originalname.split('.').length-1])
       }


});
let upload = multer({storage:storage}).single('postAttachement');

//Add a Post
app.post('/postContent',async(req,res)=>{
    try{
        upload(req,res,async(err)=>{
            if(err){
                res.status(400).json({"error":"Error in attachment Uploading"})
            }
            else{
                const{title,post,description} = req.body;

                let send = await taskData.create({
                    "title":title,
                    "post":post,
                    "description":description,
                    "postAttachement":req.file ? req.file.filename : null,
                    "date": new Date()
                })
                if(send){
                    res.status(200).json({"msg":"Posted on social media"})
                    }
                    else{
                    res.status(400).json({"error":"Error in DB query"})
                    }
            }
        })
    } catch{
        res.status(500).json({"err":"Internal server error"})
    }
})


//See multiple Post
app.get('/readContent',async(req,res)=>{
    try{
        let data = await taskData.find()
        res.send(data);
    } catch(err){
        res.status(500).json({"err":"Internal server error"})
    }
})

//See individual post 
app.get('/readContent/:id',async(req,res)=>{
    try{
        const postId = req.params.id;
        const data = await taskData.findById(postId);

        if (data) {
            res.status(200).json(data);
          } else {
            res.status(404).json({ "error": "Movie not found" });
          }
        } catch (err) {
            res.status(500).json({"err":"Internal server error"})
        }
})

//Update individual post
app.put('/updateContent/:id',async(req,res)=>{
    try {
    upload(req, res, async (err) => {

        const postId = req.params.id;
        const { title, post, description, date } = req.body;

        let updateFields = {
            title: title,
            post: post,
            description: description,
            date: date ? new Date(date) : new Date()
        };

        if (req.file) {
            updateFields.postAttachement = req.file.filename;
        }

            const updatedPost = await taskData.findByIdAndUpdate(
                postId,
                updateFields,
                { new: true }
            );

            if (updatedPost) {
                res.status(200).json({ msg: "Post details updated successfully" });
            } else {
                res.status(404).json({ error: "Post not found" });
            }
            })
        } catch (err) {
            res.status(500).json({"err":"Internal server error"})
        }
});

//Delete individual post
app.delete('/deletePost/:id',async(req,res)=>{
    try{
        const postId = req.params.id;
        const data = await taskData.findByIdAndDelete(postId)
        if(data){
            res.status(200).json({ msg: "Post Deleted successfully" });
        }
    } catch(err){
        res.status(500).json({"err":"Internal server error"})
    }
})

//Like a Post
app.post('/likePost/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await taskData.findById(postId);

        if (post) {
            post.likes += 1;
            await post.save();
            res.status(200).json({ msg: "Post liked successfully"});
        } else {
            res.status(404).json({ error: "Post not found" });
        }
    } catch (err) {
        res.status(500).json({"err":"Internal server error"})
    }
});

// Add a comment to a post
app.post('/addComment/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { user, text } = req.body;

        const post = await taskData.findById(postId);

        if (post) {
            post.comments.push({ user, text, date: new Date() });
            await post.save();
            res.status(200).json({ msg: "Comment added successfully"});
        } else {
            res.status(404).json({ error: "Post not found" });
        }
    } catch (err) {
        res.status(500).json({"err":"Internal server error"})
    }
});

app.listen(PORT, ()=> console.log(`Connection build on port ${PORT}`))
