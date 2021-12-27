const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { body, check, validationResult } = require('express-validator')
require('dotenv').config()

// REGISTER
router.post('/register', 
  body('username').isLength({min: 3}).toLowerCase(),
  body('email').isEmail().custom(email => {
    return User.findOne({email: email}).then(user => {
      if(user) return Promise.reject("E-mail already in use")
    })
  }),
  body('password').isLength({min: 8}),
  check('password').exists(),
  check(
    'password2',
    "Confirm Password and Password must match!"
  ).exists()
  .custom((value, { req }) => value === req.body.password),
  (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(400).json({ msg: "Please fill in the form correctly" })
    }

    const { username, password, email } = req.body

    User.findOne({ email }, (err, found) => {
      if(err) return res.status(400).json({ msg: "Sorry, there was an error. Please try again later." })
      if(found) {
        return res.status(400).json({ msg: "User already exists/You have been login with your google account" })
      }
      else {
        const user = new User() 
        user.username = username
        user.email = email

        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(password, salt)

        user.password = hash
        user.save()
        return res.json({ msg: "Register Successfully", user }) 
      }
    })
})

// LOGIN (NORMAL)
router.post('/login', (req, res) => {
  const { email, password } = req.body

  User.findOne({ email }, (err, user) => {
    if(!user) return res.status(400).json({ msg: "User doesn't exist/ You may be logging in with your google account." })

    if(err) return res.status(400).json({ msg: "Sorry, you may/ may not been login with your google account. Please try again." })

    let isMatch = bcrypt.compareSync(password, user.password)

    if(!isMatch) return res.status(400).json({ msg: "Invalid Credentials" })

    let payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      birthday: user.birthday
    }

    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      { expiresIn: '2h' },
      (err, token) => {
        if(err) return res.status(400).json({ err })
        return res.json({ msg: "Logged in Successfully!", token })
      }
    )
  })
})

// GoogleLogin
router.post('/googlelogin', async(req, res) => {
  const { name, email } = req.body

  User.findOne({ email }, (err, user) => {
    if(err) return "Sorry there was an error. Please try again later."
    
    if(user) {
      let payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        birthday: user.birthday
      }
      jwt.sign(
        payload,
        process.env.SECRET_KEY,
        { expiresIn: '2h' },
        (err, token) => {
          if(err) return res.status(400).json({ err })
          return res.json({ msg: "Logged in Successfully!", token })
        }
      )
    } else {
      const user = new User({
        username: name,
        email, 
        password: null
      }) 
      user.save()
      
      User.findOne({ email }, (err, user) => {
        if(user) {
          let payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin,
            birthday: user.birthday
          }
          jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { expiresIn: '2h' },
            (err, token) => {
              if(err) return res.status(400).json({ err })
              return res.json({ msg: "Logged in Successfully!", token })
            }
          )
        }
      })
    }
  })
})

// GET USER INFO
router.get('/', auth, async(req, res) => {
  try {
    if(req.user.isAdmin) {
      let user = await User.find({})
      return res.json(user)
    } 
  } catch(err) {
    return res.status(400).json({ err, msg: "Not Logged In" })
  }
})

// GET OWN DETAILS
router.get('/user', auth, async(req, res) => {
  try {
    const _id = req.user.id
    let user = await User.findOne({_id})
    return res.json(user)
  } catch(err) {
    return res.status(400).json({err, msg: "No User Found!" })
  }
})

module.exports = router