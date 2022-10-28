require('express-async-errors')

const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const corsOptions = require('./config/cors.Options')
const connectDB = require('./config/dbConnection')
const root = require('./routes/root')
const userRoutes = require('./routes/userRoutes')
const noteRoutes = require('./routes/noteRoutes')
const authRoutes = require('./routes/authRoutes')

const PORT = process.env.PORT || 3333

connectDB()

const app = express()

app.use(logger)

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, '../public')))

app.use('/', root)
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/notes', noteRoutes)

app.use('*', (request, response) => {
  response.status(404)
  if (request.accepts('html')) {
    response.sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (request.accepts('join')) {
    response.json({ message: '404 Not Found' })
  } else response.type('text').send('404 Not Foud')
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB!')

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})

mongoose.connection.on('error', (error) => {
  console.log(error)
  logEvents(
    `${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`,
    'mongoErrorLog.log'
  )
})
