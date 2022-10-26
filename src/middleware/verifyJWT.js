const jwt = require('jsonwebtoken')

const verifyJWT = (request, response, next) => {
  const authHeader = request.headers.authorization || request.headers.Authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return response.status(402).json({ message: 'Unauthorized!'})
  }

  const token = authHeader.split(' ')[1]

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (error, decoded) => {
      if (error) return response.status(403).json({ message: 'Forbidden!' })
      request.user = decoded.UserInfo.username
      request.roles = decoded.UserInfo.roles
      next()    
    }
  )
}

module.exports = verifyJWT