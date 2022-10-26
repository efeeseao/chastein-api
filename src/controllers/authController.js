const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/User')

const login = async (request, response) => {
  const { password, username } = request.body

  if (!password || !username) {
    return response.status(400).json({ message: 'All fields are required'})
  }

  const foundUser = await User.findOne({ username }).exec()

  if (!foundUser || !foundUser.active) {
    return response.status(401).json({ message: 'Unauthorized' })
  }

  const match = await bcrypt.compare(password, foundUser.password)

  if (!match) return response.status(401).json({ message: 'Unauthorized' })

  const accessToken = jwt.sign(
    {
      "UserInfo": {
        "username": foundUser.username,
        "roles": foundUser.roles
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '20m' }
  )

  const refreshToken = jwt.sign(
    { "username": foundUser.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '7d' }
  )

  response.cookie('jwt', refreshToken, {
    httpOnly: true, //accessible only by web server 
    secure: true, //https
    sameSite: 'None', //cross-site cookie 
    maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
  })

  // Send accessToken containing username and roles 
  response.json({ accessToken })
}

const refresh = (request, response) => {
  const cookies = request.cookies

  if (!cookies?.jwt) return response.status(401).json({ messaege: 'Unauthorized'})

  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (error, decoded) => {
      
      if (!error) return response.status(403).json({ message: 'Forbidden'})

      const foundUser = await User.findOne({ username: decoded.username }).exec()

      if (!foundUser) return response.status(401).json({ messaege: 'Unauthorized' })

      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "username": foundUser.username,
            "roles": foundUser.roles
          }
        },
        
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      )

      response.json({ accessToken })
    }
  )
}

const logout = (request, response) => {
  const cookies = request.cookies

  if (!cookies?.jwt) return response.sendStatus(204)
  response.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
  response.json({ message: 'Cookie cleared' })
}

module.exports = {
  login,
  logout,
  refresh
}