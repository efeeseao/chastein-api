const mongoose = require('mongoose')

const connectDB = async () => {
 mongoose.connect(process.env.DATABASE_URI).then(() => {
  console.log('Database Connected')
 }).catch(() => {
  console.log('Database Not Connected')
 })
}

module.exports = connectDB
