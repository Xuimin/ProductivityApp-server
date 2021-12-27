const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { isEmail } = require('validator')

const UserSchema = new Schema({
  username: { type: String },
  email: { type: String, isValid: [isEmail, 'Please enter a valid email'] },
  password: { type: String },
  birthday: { type: Date, default: null },
  isAdmin: { type: Boolean, default: false },
  joinedEvents: [{
    eventId: { type: String }
  }]
})

module.exports = mongoose.model('User', UserSchema)