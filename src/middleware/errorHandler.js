const { logEvents } = require('./logger')

const errorHandler = (error, request, response, next) => {
  logEvents(
    `${error.name}: ${error.message}\t${request.method}\t${request.url}\t${request.headers.origin}`,
    'errorLog.log'
  )

  console.log(error.stack)

  const status = response.statusCode ? response.statusCode : 500
  response.status(status)
  response.json({ message: error.message })
}
module.exports = errorHandler
