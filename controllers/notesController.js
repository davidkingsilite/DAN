const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')


//@desc Get all users 
// @route Get /users
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
    //get all notes from Mongo db
    const notes = await Note.find().lean()

    //if no notes
    if(!notes?.length){
        return res.status(400).json({ message: 'No notes found'})
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop

     const notesWithUser = await Promise.all(notes.map( async(note)=>{
        const user = await User.findById(note.user).lean().exec()
        return {...note, username: user.username}
     }))
    

    res.json(notesWithUser)
})
//@desc create new note 
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    //confirm data
    if(!user || !title || !text ){
        return res.status(400).json({ message: 'All fields are required'})
    }
    // check for duplicate
    const duplicate = await Note.findOne({title}).lean().exec()

    if(duplicate){
        return res.status(409).json({ message: 'Duplicate note title'})
    }

    //
    
    //create and store new note 
    const note = await Note.create({user, title, text})

    if (note){ //created
        res.status(201).json({message: 'new note created'})
    } else {
        res.status(400).json({mesage:'Invalid note data received'})
    }
})
//@desc update a note 
// @route PATCH /note
// @access Private
const updateNote = asyncHandler(async (req, res) => {
   const { id, user, title, text, completed } = req.body

   // confirm data 
   if (!id || !user|| title || text || typeof completed !== 'boolean'){
    return res.status(400).json({ message: 'All fields are required'})
   }
    // confirm note exists  to update
   const note = await Note.findById(id).exec()

   if (!note){
    return res.status(400).json({message: ' Note not found'})
   }

   // check for duplicate 

   const duplicate = await Note.findOne({title}).lean().exec()
      //allow updates to the original user
      if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({ message: 'Duplicate note title'})
      }

      note.user = user
      note.title= title
      note.text = text
      note.completed = completed

      
      const updatedNote = await note.save()

      res.json({ message: `${updatedNote.title} updated`})
})
//@desc delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    if(!id){
        return res.status(400).json({ message: 'Note ID required'})
    }
     // confirm if notes exists to be deleted
    const note = await Note.findById(id).exec()

    if(!note){
        return res.status(400).json({ message: 'Note not found'})
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}