const Note = require('../models/Note')
const User = require('../models/User')

const getAllNotes = async (request, response) => {
  // Get all notes from MongoDB
  const notes = await Note.find().lean()

  if (!notes?.length) {
    return response.status(400).json({ message: 'No notes found' })
  }

  const notesWithUser = await Promise.all(notes.map(async (note) => {
    const user = await User.findById(note.user).lean().exec()
    return { ...note, username: user.username }
  }))

  response.json(notesWithUser)
}

const createNewNote = async (request, response) => {
  const { user, title, text } = request.body

  if (!user || !title || !text) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const duplicateTitle = await Note.findOne({ title }).collation({ locale: 'pt', strength: 2 }).lean().exec()

  if (duplicateTitle) {
    return response.status(409).json({ message: 'Duplicate note title' })
  }

  const note = await Note.create({ user, title, text })

  if (note) {
    return response.status(201).json({ message: 'New note created' })
  } else {
    return response.status(400).json({ message: 'Invalid note data received' })
  }

}

const updateNote = async (request, response) => {
  const { id, user, title, text, completed } = request.body

  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return response.status(400).json({ message: 'All fields are required' })
  }

  const note = await Note.findById(id).exec()

  if (!note) {
    return res.status(400).json({ message: 'Note not found' })
  }

  const duplicateTitle = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

  if (duplicateTitle && duplicateTitle?._id.toString() !== id) {
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

  if (!id) {
    return res.status(400).json({ message: 'Note ID required' })
  }

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