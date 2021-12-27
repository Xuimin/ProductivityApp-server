const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FeedbackSchema = new Schema({
  userId: { type: String },
  email: { type: String },
  title: { type: String },
  feedbackDes: { type: String },
  image: { type: String, default: null },
  published: { type: String, default: new Date().toISOString() },
  isView: { type: Boolean, default: false },
  category: { type: String }
})

module.exports = mongoose.model('Feedback', FeedbackSchema)