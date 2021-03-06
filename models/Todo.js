const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TodoSchema = new Schema({
  userId: { type: String },
  target: [{
    name: { type: String },
    isFinish: { type: Boolean, default: false }
  }]
})

module.exports = mongoose.model('Todo', TodoSchema)