const bcrypt = require('bcrypt')

const User = require('../models/User')
const Note = require('../models/Note')


const getAllUsers = async (request, response) => {
  // Get all users from MongoDB
  const users = await User.find().select('-password').lean()

  if (!users?.length) {
    return response.status(400).json({ message: 'No users found' })
  }

  response.json(users)
}

const createNewUser = async (request, response) => {
  const { email, username, password, roles } = request.body

  if (!username || !email || !password) {
    return response.status(400).json({ message: 'All fields are required' })
  }

  // Check for duplicate username
  const duplicateUsername = await User.findOne({ username }).collation({ locale: 'pt', strength: 2 }).lean().exec()

  if (duplicateUsername) {
    return response.status(409).json({ message: 'Duplicate username' })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const userObject = (!Array.isArray(roles) || !roles.length)
    ? { username, "password": hashedPassword, email }
    : { username, "password": hashedPassword, roles, email }

  const user = await User.create(userObject)

  if (user) {
    response.status(201).json({ message: `New user ${username} created` })
  } else {
    response.status(400).json({ message: 'Invalid user data received' })
  }
}

const updateUser = async (request, response) => {
  const { id, username, roles, active, password } = request.body
 
  if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
    return response.status(400).json({ message: 'All fields except password are required' })
  }

  const user = await User.findById(id).exec()

  if (!user) {
      return response.status(400).json({ message: 'User not found' })
  }

  // Check for duplicate 
  const duplicateUsername = await User.findOne({ username }).collation({ locale: 'pt', strength: 2 }).lean().exec()

  // Allow updates to the original user 
  if (duplicateUsername && duplicateUsername?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate username' })
  }

  user.username = username
  user.roles = roles
  user.active = active

  if (password) {
    user.password = await bcrypt.hash(password, 12)

    const updatedUser = await user.save()

    response.json({ message: `${updatedUser.username} updated` })
  }
}

const deleteUser = async (request, response) => {
  const { id } = request.body

  if (!id) {
    return response.status(400).json({ message: 'User ID Required' })
  }

  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
      return response.status(400).json({ message: 'User has assigned notes' })
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return response.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    response.json(reply)
}

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser
}
