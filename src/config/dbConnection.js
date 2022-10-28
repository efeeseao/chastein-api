const mongoose = require('mongoose')

// Is not recommended
const DB = process.env.DATABASE_URI || 'mongodb+srv://buzzcode:OL6ko8V7yvjolOMo@cluster0.4xbbdqm.mongodb.net/?retryWrites=true&w=majority'

const connectDB = async () => {
  try {
    await mongoose.connect(DB)
  } catch (error) {
    console.log(error)
  }
}

module.exports = connectDB