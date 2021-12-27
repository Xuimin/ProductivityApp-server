const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Feedback = require('../models/Feedback')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

// SEND FEEDBACK
router.post('/', auth, async(req, res) => {
  try {
    const userId = req.user.id
    const form = new formidable.IncomingForm()
    form.parse(req, async(err, fields, files) => {
      if(err) return res.status(400).json({ err })
      const feedback = new Feedback(fields)
      feedback.userId = userId

      let date = new Date().getTime()

      let oldPath = files.image.filepath
      let newPath = path.join(__dirname, '../Public/') + date + '-' + files.image.originalFilename
      let rawData1 = fs.readFileSync(oldPath)
      fs.writeFileSync(newPath, rawData1)
      feedback.image= "/Public/" + date + '-' + files.image.originalFilename


      feedback.save()
      return res.json({ msg: "Feedback Successfully Send", feedback })
    })
   } catch(err) {
    return res.status(400).json({ err, msg: "Failed to Send Feedback" })
  }
})

// VIEW ALL FEEDBACK (ADMIN)
// VIEW OWN FEEDBACK (USER)
router.get('/', auth, async(req, res) => {
  if(req.user.isAdmin) {
    const feedback = await Feedback.find({})
    return res.json(feedback)
  } else {
    const userId = req.user.id
    const feedback = await Feedback.find({userId})
    return res.json(feedback)
  }
})


// ISVIEW FEEDBACK
router.put('/:id', auth, async(req, res) => {
  try {
    if(!req.user.isAdmin) return res.status(400).json({ msg: "Unauthorized not an admin" })
    else {
      const feedback = await Feedback.findById(req.params.id)
      feedback.isView = true
      
      feedback.save()
      return res.json({ msg: "You have view this feedback", feedback })
    }
  } catch(err) {
    return res.status(400).json({ msg: "No Feedback Found!" })
  }
})

// VIEW FEEDBACK BY CATEGORY
router.get('/:key', auth, async(req, res) => {
  try {
    if(req.user.isAdmin) {
      const feedback = await Feedback.find({category: req.params.key})
      return res.json(feedback)
    }
    else {
      const userId = req.user.id
      const feedback = await Feedback.find({userId, category: req.params.key})
      return res.json(feedback)
    }
  } catch(err) {
    return res.status(400).json({ msg: "No Feedback Found" })
  }
})

module.exports = router