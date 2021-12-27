const express = require('express')
const router = express.Router()
const Planner = require('../models/Planner')
const auth = require('../middleware/auth')

// ADD PLANS
router.post('/', auth, async(req, res) => {
  try {
    const { title, description, date, time } = req.body
    const userId = req.user.id
    const plans = await Planner.findOne({userId})

    Planner.findOne({userId}, (err, found) => {
      if(found) {
        Planner.findOne({"planner.title": title}, (err, foundPlans) => {
          if(foundPlans) return res.status(400).json({ err, msg: "Planner with this name exists, please use another name" })
          else {
            plans.planner.push({
              title,
              description, 
              date,
              time
            })
            plans.save()
            return res.json({ msg: "Planner Added Successfully", plans })
          }
        })
      } else {
        const newPlans = new Planner({
          userId,
          planner: [{
            title,
            description,
            date, 
            time
          }]
        })
        newPlans.save()
        return res.json({ msg: "Planner Added Successfully", newPlans })
      }
    })
  } catch(err) {
    return res.status(400).json({ err, msg: "Failed to Add to Calendar" })
  }
})

// ADD REMINDER
router.put('/reminder/:id', auth, async(req, res) => {
  try {
    const userId = req.user.id
    const plans = await Planner.findOne({userId})
    const target = plans.planner.find(t => t.id === req.params.id)

    if(target.isReminded === false) {
      target.isReminded = true

      await Planner.updateOne({target})
      await plans.save()
      return res.json({ msg: "Reminder Added", plans })
    } else {
      target.isReminded = false

      await Planner.updateOne({target})
      await plans.save()
      return res.json({ msg: "Reminder Removed", plans})
    }

  } catch(err) {
    return res.status(400).json({ err, msg: "Failed to Add Reminder", err })
  }
})

// VIEW ALL PLANS
router.get('/', auth, async(req, res) => {
  try {
    const userId = req.user.id
    const plans = await Planner.findOne({userId})
    return res.json(plans)
  } catch(err) {
    return res.status(400).json({ err, msg: "No Plans Found!" })
  }
})

// DELETE PLANS
router.delete('/:id', auth, async(req, res) => {
  try {
    const userId = req.user.id
    const plans = await Planner.findOne({userId})
    const deleted = plans.planner.find(t => t.id === req.params.id)

    await deleted.remove()
    plans.save()

    return res.json({ msg: "Plans Successfully Deleted", deleted })
  } catch(err) {
    return res.status(400).json({ err, msg: "No Plans Found!" })
  }
})

// UPDATE PLANS
router.put('/:id', auth, async(req, res) => {
  try {
    const { title, description } = req.body
    const userId = req.user.id
    let plans = await Planner.findOne({userId})
    let target = plans.planner.find(t => t.id === req.params.id)

    if(target) {
      target.title = title,
      target.description = description

      await Planner.updateOne({target})
      await plans.save()
      return res.json({ target, msg: "Plans Successfully Updated" })
    }
  } catch(err) {
    return res.status(400).json({ err, msg: "No Plans Found!" })
  }
})

module.exports = router