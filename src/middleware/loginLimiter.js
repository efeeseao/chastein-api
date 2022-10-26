const rateLimit = require('express-rate-limit')

const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 
      { message: 'Too many login attempts from this IP, please try again after a 60 second pause!'},
      handler: (request, response, next, options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${request.method}\t${request.url}\t${request.headers.origin}`, 'errLog.log')
      },
  standardHeaders: true,
  legacyHeaders: false
})

module.exports = loginLimiter