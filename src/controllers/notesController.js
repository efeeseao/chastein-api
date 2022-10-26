const Note = require('../models/Note')
const User = require('../models/User')

const getAllNotes = async (request, response) => {
  // Get all notes from MongoDB
  const notes = await Note.find().lean()

  // If no notes
  if (!notes?.length) {
    return response.status(400).json({ message: 'No notes found' })
  }

  // Add username to each note before sending the response
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec()
      return { ...note, username: user }
    })
  )

  response.json(notesWithUser)
}

const createNewNote = async (request, response) => {
  const { user, title, text } = request.body

  // Confirm data
  if (!user || !title || !text) {
    return response.status(400).json({ message: 'All fields are required' })
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec()

  if (duplicate) {
    return response.status(409).json({ message: 'Duplicate note title' })
  }

  // Create and store the new user
  const note = await Note.create({ user, title, text })

  if (note) {
    // Created
    return response.status(201).json({ message: 'New note created' })
  } else {
    return response.status(400).json({ message: 'Invalid note data received' })
  }
}

const updateNote = async (request, response) => {
  const { id, user, title, text, completed } = request.body

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return response.status(400).json({ message: 'All fields are required' })
  }

  // Confirm note exists to update
  const note = await Note.findById(id).exec()

  if (!note) {
    return response.status(400).json({ message: 'Note not found' })
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec()

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return response.status(409).json({ message: 'Duplicate note title' })
  }

  note.user = user
  note.title = title
  note.text = text
  note.completed = completed

  const updatedNote = await note.save()

  response.json(`'${updatedNote.title}' updated`)
}

const deleteNote = async (request, response) => {
  const { id } = request.body

  // Confirm data
  if (!id) {
    return response.status(400).json({ message: 'Note ID required' })
  }

  // Confirm note exists to delete
  const note = await Note.findById(id).exec()

  if (!note) {
    return response.status(400).json({ message: 'Note not found' })
  }

  const result = await note.deleteOne()

  const reply = `Note '${result.title}' with ID ${result._id} deleted`

  response.json(reply)
}

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote
}
