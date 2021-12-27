const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PlannerSchema = new Schema({
  userId: { type: String },
  planner: [{
    title: { type: String },
    description: { type: String },
    date: { type: String },
    time: { type: String }, // ***
    isReminded: { type: Boolean, default: false }
  }]
})

module.exports = mongoose.model('Planner', PlannerSchema)