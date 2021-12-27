const express = require('express')
const router = express.Router()
const Event = require('../models/Event')
const User = require('../models/User')
const auth = require('../middleware/auth')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

// ADD EVENT 
router.post('/', auth, async(req, res) => {
  try {
    if(!req.user.isAdmin) return res.status(400).json({ msg: "Unauthorized not an admin" })

    const form = new formidable.IncomingForm()
    form.parse(req, async(err, fields, files) => {
      const eventName = fields.eventName

      if(err) return res.json({ err })
      
      Event.findOne({eventName}, (err, found) => {
        if(found) {
          return res.status(400).json({ err, msg: "Event name has been used. Please use another name" })
        } else {
          if(err) return res.json({err})

          let date = new Date().getTime()
          const event = new Event(fields)

          let oldPath = files.image.filepath
          let newPath = path.join(__dirname, '../Public/') + date + '-' + files.image.originalFilename
          let rawData = fs.readFileSync(oldPath)
          fs.writeFileSync(newPath, rawData)

          event.image = "/Public/" + date + '-' + files.image.originalFilename
          event.save()

          return res.json({msg: "Event added successfully", event })
        }
      })
    })
  } catch(err) {
    return res.status(400).json({ err, msg: "Failed to Add Event" })
  }
}) 

// VIEW ALL EVENT
router.get('/', async(req, res) => {
  try {
    const event = await Event.find({}).sort({date: -1})
    return res.json(event)
  } catch(err) {
    return res.status(400).json({ err, msg: "No Event Found!" })
  }
})

// VIEW SINGLE EVENT
router.get('/:id', async(req, res) => {
  try {
    const event = await Event.findOne({_id: req.params.id})
    return res.json(event)
  } catch(err) {
    return res.status(400).json({ err, msg: "No Event Found!" })
  }
})

// DELETE EVENT
router.delete('/:id', auth, async(req, res) => {
  try {
    if(!req.user.isAdmin) return res.status(400).json({ msg: "Unauthorized not an admin" })
    const event = await Event.findByIdAndDelete(req.params.id)
    fs.unlinkSync(path.join(__dirname, '../', event.image))

    return res.json({ msg: "Event Successfully Deleted", event })
  } catch(err) {
    return res.status(400).json({ err, msg: "No Event Found!" })
  }
})

// UPDATE EVENT
router.put('/:id', auth, async(req, res) => {
  try {
    if(!req.user.isAdmin) return res.status(400).json({ msg: "Unauthorized not an admin" })
    const event = await Event.findById(req.params.id)

    const form = new formidable.IncomingForm()
    form.parse(req, async(err, fields, files) => {

      if(err) return res.json({ err })

      event.eventName = (fields.eventName !== '' ) ? fields.eventName : event.eventName
      event.description = (fields.description !== '') ? fields.description : event.description
      event.category = (fields.category !== '') ? fields.category : event.category
      event.timeStart = (fields.timeStart !== '' ) ? fields.timeStart : event.timeStart
      event.timeEnd = (fields.timeEnd !== '' ) ? fields.timeEnd : event.timeEnd
      event.location = (fields.location !== '' ) ? fields.location : event.location
      event.date = (fields.date !== '' ) ? fields.date : event.date

      if(files.image != null) {
        let date = new Date().getTime()
  
        fs.unlinkSync(path.join(__dirname, '../', event.image))

        let oldPath = files.image.filepath
        let newPath = path.join(__dirname, '../Public/') + date + '-' + files.image.originalFilename
        let rawData = fs.readFileSync(oldPath)
        fs.writeFileSync(newPath, rawData)
  
        event.image = "/Public/" + date + '-' + files.image.originalFilename
      } else {
        event.image = event.image
      }

      event.isUpdated = true
      Event.updateOne({_id: req.params.id}, event)
      event.save()

      return res.json({ msg: "Event Updated successfully", event }) 
    })
  } catch(err) {
    return res.status(401).json({ err, msg: "No Event Found!" })
  }
})

// SEARCH EVENT BY NAME 
router.get('/search/:key', async(req, res) => {
  try {
    const event = await Event.find({eventName: {'$regex': '^' + req.params.key, '$options': 'i'}})
    return res.json(event)
  } catch(err) {
    return res.status(400).json({ err, msg: "No Event Found!" })
  }
})

// SEARCH EVENT BY CATEGORY
router.get('/category/:key', async(req, res) => {
  try {
    const event = await Event.find({category: {'$regex': '^' + req.params.key, '$options': 'i'}})
    return res.json(event)
  } catch(err) {
    return res.status(400).json({ err, msg: "No Event Found!" })
  }
})

// JOIN EVENT
router.post('/join/:id', auth, async(req, res) => {
  try {
    const _id = req.user.id
    const event = await Event.findById(req.params.id)
    const isGoing = event.isGoing.find(going => going.userId === _id)
    const user = await User.findOne({_id})
  
    const eventId = event._id
    const event_Id = user.joinedEvents.find(target => target.eventId === req.params.id)

    if(isGoing) {
      isGoing.remove()
      event_Id.remove()

      user.save()
      event.save()
      return res.json({ msg: "You unjoin this event!" })
    }
    else {
      event.isGoing.push({
        userId: _id
      })
      user.joinedEvents.push({
        eventId
      })

      user.save()
      event.save()
      return res.json({ msg: "You join this event!" })
    }
  } catch(err) {
    return res.status(400).json({ err, msg: "Can't join Event!" })
  }
})

module.exports = router