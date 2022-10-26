const bcrypt = require('bcrypt')

const Note = require('../models/Note')
const User = require('../models/User')

const getAllUsers = async (request, response) => {
  const users = await User.find().select('-password').lean()

  if (!users?.length) {
    return response.status(400).json({ message: 'No user found!' })
  }

  response.json(users)
}

const createNewUser = async (request, response) => {
  const { username, email, password, roles } = request.body

  // Confirm data
  if (
    !username ||
    !password ||
    !email ||
    !Array.isArray(roles) ||
    !roles.length
  ) {
    return response.status(400).json({ message: 'All fields must be provided' })
  }

  //Check for duplicate email
  const duplicateuUsername = await User.findOne({ username }).lean().exec()

  if (duplicateuUsername) {
    return response.status(409).json({ message: 'Duplicate username' })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  const userObject = { email, username, password: hashedPassword, roles }

  // Create and store new User
  const user = await User.create(userObject)

  if (user) {
    response
      .status(201)
      .json({ message: `User ${username} created successfully!` })
  } else {
    response.status(400).json({ message: 'Invalid user data recived!' })
  }
}

const upateUser = async (request, response) => {
  const { id, username, email, roles, active, password } = request.body

  // Confirm data
  if (
    !id ||
    !username ||
    !email ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== 'boolean'
  ) {
    return response.status(400).json({ message: 'All fields are required!' })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return response.status(400).json({ message: 'User not found!' })
  }

  //Check for duplicate email
  const duplicateUsername = await User.findOne({ username }).lean().exec()

  // Allow update to the original user
  if (duplicateUsername && duplicateUsername?._id.toString() !== id) {
    return response.status(409).json({ message: 'Duplicate username' })
  }

  user.username = username
  user.roles = roles
  user.email = email
  user.active = active

  if (password) {
    user.password = await bcrypt.hash(password, 12)
  }

  const updateUser = await user.save()

  response.json({ message: `${updateUser.username} updated` })
}

const deleteUser = async (request, response) => {
  const { id } = request.body

  if (!id) {
    return response.status(400).json({ message: 'User ID is required!' })
  }

  const note = await Note.findOne({ user: id }).lean().exec()

  if (note?.length) {
    return response.status(400).json({ message: 'User has assigned notes!' })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return response.status(400).json({ message: 'User does not exist!' })
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with ID ${result._id} was deleted!`

  response.json(reply)
}

module.exports = {
  getAllUsers,
  createNewUser,
  upateUser,
  deleteUser
}
