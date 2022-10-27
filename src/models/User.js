const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique:true,
    trim: true,
    lowercase:true
  },

  password: {
    type: String,
    required: true
  },

  roles: {
    type: [String],
    default: ["Employee"]
  },

  active: {
    type: Boolean,
    default: true
  }
})

module.exports = mongoose.model('User', userSchema)
