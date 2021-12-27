const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({
  eventName: { type: String },
  description: { type: String },
  date: { type: String },
  timeStart: { type: String }, 
  timeEnd: { type: String },
  image: { type: String },
  category: { type: String },
  location: { type: String },
  isUpdated: { type: Boolean, default: false },
  isGoing: [{
    userId: { type: String }
  }]

})

module.exports = mongoose.model('Event', EventSchema)