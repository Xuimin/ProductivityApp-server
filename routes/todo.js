const express = require('express')
const router = express.Router()
const Todo = require('../models/Todo')
const auth = require('../middleware/auth')
const Habits = require('../models/Habits')

// ADD TODO
router.post('/', auth, async(req, res) => {
  try {
    const { name } = req.body
    const userId = req.user.id
    const todo = await Todo.findOne({userId})

    Todo.findOne({userId}, (err, found) => {
      if(found) {
        Todo.findOne({"target.name": name}, (err, foundTodo) => {
          if(foundTodo) return res.status(400).json({ msg: "Todo name exists, please use another name" })
          else {
            todo.target.push({
              name
            })
            todo.save()
            return res.json({ msg: "Todo Added Successfully", todo })
          }
        }) 
      } else {
          const newTodo = new Todo({
            userId,
            target: [{
              name
            }]
          }) 
          newTodo.save()
          return res.json({ msg: "Todo Added Successfully", newTodo })
        }
    })
  } catch(err) {
    return res.status(400).json({ err, msg: "Failed to Add Todo" })
  }
})

// GET ALL TODO (OWN)
router.get('/', auth, async(req, res) => {
  try {
    let userId = req.user.id
    let todo = await Todo.findOne({userId})
    return res.json(todo)
} catch(err) {
    return res.status(401).json({ err, msg: "No Todo found!" })
}
})

// DELETE TODO
router.delete('/:id', auth, async(req, res) => {
  try {
    let userId = req.user.id
    let todo = await Todo.findOne({userId}) 
    const deleted = todo.target.find(t => t.id === req.params.id)

    await deleted.remove()
    todo.save()
    return res.json({ msg: "Todo Successfully Deleted", deleted })
  } catch(err) {
    return res.status(401).json({ err, msg: "No Todo Found!" })
  }
})

// UPDATE TODO
router.put('/:id', auth, async(req, res) => {
  try {
    const { name, description } = req.body
    let userId = req.user.id
    let todo = await Todo.findOne({userId})
    let targeted = todo.target.find(t => t.id === req.params.id)

    if(targeted != undefined) {
      Todo.findOne({userId, targeted}, (err, found) => {
        if(found) {  
          targeted.name = name,
          targeted.description = description
  
          Todo.updateOne({targeted})
          todo.save()
          return res.json({ targeted, msg: "Todo Successfully Updated" })
  
        }
      })
    } else {
      return res.json({ msg: "Habits/Goals Not Found!" })
    }
  } catch(err) {
    return res.status(401).json({ err, msg: "No Todo Found!" })
  }
})

// COMPLETE TODO
router.put('/complete/:id', auth, async(req, res) => {
  try {
    const userId = req.user.id
    let todo = await Todo.findOne({userId})
    let targeted = todo.target.find(t => t.id === req.params.id)

    if(targeted.isFinish === false) {
      targeted.isFinish = true

      await Todo.updateOne({targeted}) 
      await todo.save()
      return res.json({ msg: "Todo Completed", todo })
    } else {
      targeted.isFinish = false

      await Todo.updateOne({targeted}) 
      await todo.save()
      return res.json({ msg: "Todo Not Completed", todo })
    }

  } catch(err) {
    return res.status(401).json({ err, msg: "Todo not foud!" })
  }
})

module.exports = router