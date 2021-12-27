const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HabitSchema = new Schema({
  userId : { type: String },
  habit: [{
    name: { type: String },
    timer: { type: String },
    category: { type: String },
    dueOn: { type: String }
  }]
})

module.exports = mongoose.model('Habit', HabitSchema)