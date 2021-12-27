require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
// const { DB_NAME, DB_PASSWORD, DB_HOST, DB_PORT } = process.env
const { PORT } = process.env

app.use(cors())
app.use(express.json())


// mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)

// ONLINE DATABASE
mongoose.connect("mongodb+srv://xuimin:xuimin123@productivityapp.lxyzi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
mongoose.connection.once('open', () => console.log("Connected to MongoDB"))

app.use(express.static('Public')) // http://localhost:5000/Public/imagename.jpg
app.use('/auth', require('./routes/auth'))
app.use('/todo', require('./routes/todo'))
app.use('/event', require('./routes/event'))
app.use('/planner', require('./routes/planner'))
app.use('/habits', require('./routes/habits'))
app.use('/feedback', require('./routes/feedback'))

app.listen(PORT, () => console.log(`Server is running in PORT ${PORT}`))