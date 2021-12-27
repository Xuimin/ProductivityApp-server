const express = require('express')
const router = express.Router()
const Habits = require('../models/Habits')
const auth = require('../middleware/auth')

// ADD HABIT OR GOALS
router.post('/', auth, async(req, res) => {
  try {
    const { name, timer, category, dueOn } = req.body
    const userId = req.user.id
    const habits = await Habits.findOne({userId})

    Habits.findOne({userId}, (err, found) => {
      if(found) {
        Habits.findOne({"habit.name": name}, (err, foundHabit) => {
          if(foundHabit) return res.status(400).json({ err, msg: "Habit/Goals with this name exists, please use another name" })
          else {
            habits.habit.push({
              name, 
              timer, 
              category,
              dueOn
            })
            habits.save()
            return res.json({ msg: "Habits/Goals Successfully Added", habits })
          }
        })
      } else {
        const newHabit = new Habits({
          userId, 
          habit: [{
            name,
            timer,
            category,
            dueOn
          }]
        })
        newHabit.save()
        return res.json({ msg: "Habits/Goals Successfully Added", newHabit })
      }
    })
  } catch(err) {
    return res.status(400).json({ err, msg: "Failed to Add Habits/Goals" })
  }
})

// VIEW ALL HABITS 
router.get('/', auth, async(req, res) => {
  try {
    const userId = req.user.id
    const habits = await Habits.findOne({userId})
    return res.json(habits)
  } catch (err) {
    return res.status(400).json({ msg: "Habits/Goals Not Found!" })
  }
})

// DELETE HABIT OR GOALS
router.delete('/:id', auth, async(req, res) => {
  try {
    const userId = req.user.id
    const habits = await Habits.findOne({userId})
    const deleted = habits.habit.find(t => t.id === req.params.id)

    await deleted.remove()
    habits.save()

    return res.json({ msg: "Habits/Goals Successfully Deleted", deleted })
  } catch(err) {
    return res.status(400).json({ err, msg: "No Habits/Goals Found!" })
  }
})

// UPDATE HABIT OR GOALS
router.put('/:id', auth, async(req, res) => {
  try {
    const userId = req.user.id
    const { name, timer, category, dueOn } = req.body
    const habits = await Habits.findOne({userId})
    let targeted = habits.habit.find(t => t.id === req.params.id) 

    if(targeted != undefined) {
      Habits.findOne({userId, targeted}, (err, found) => {
        if(found) {
          targeted.name = name,
          targeted.timer = timer,
          targeted.category = category
          targeted.dueOn = dueOn
  
          Habits.updateOne({targeted})
          habits.save()
  
          return res.json({ targeted, msg: "Habits/Goals Successfully Updated" })
        }
      })
    } else {
      return res.json({ msg: "Habits/Goals Not Found!" })
    }
  } catch(err) {
    return res.status(400).json({ err, msg: "No Habits/Goals Found!" })
  }
})

module.exports = router