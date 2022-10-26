const { format } = require('date-fns')
const { v4: uuidV4 } = require('uuid')
const fs = require('fs')
const path = require('path')
const fsPromises = require('fs').promises

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), 'ddMMyyyy\tHH:mm:ss')
  const logItem = `${dateTime}\t${uuidV4()}\t${message}\n`

  try {
    if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'))
    }
    await fsPromises.appendFile(
      path.join(__dirname, '..', '..', 'logs', logFileName),
      logItem
    )
  } catch (error) {
    console.log(error)
  }
}

const logger = (request, response, next) => {
  logEvents(
    `${request.method}\t${request.url}\t${request.headers.origin}`,
    'requestLog.log'
  )
  console.log(`${request.method} ${request.path}`)
  next()
}

module.exports = { logEvents, logger }
