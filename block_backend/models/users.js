const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  posts_list: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  comments_list: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
