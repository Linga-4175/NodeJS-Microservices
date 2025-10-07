const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref  : 'User',
        unique:true
    },
    content:{
     type: String,
      required: true,

    },
    mediaIds:{
        type:Array,
        required  : true
    },
     createdAt:{
     type: Date,
      default: Date.now,

    },
},{
        timestamps:true
    });

    postSchema.index({content:'text'});

const Post = mongoose.model('Post',postSchema);

module.exports = Post;