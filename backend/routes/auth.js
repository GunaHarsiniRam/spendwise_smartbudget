const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const validate = (rules) => async (req, res, next) => {
  await Promise.all(rules.map(r => r.run(req)))
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  next()
}

// ── Register ────────────────────────────────────────────────
router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ]),
  async (req, res) => {
    try {
      const { name, email, password, phone } = req.body
      const existing = await User.findOne({ email })
      if (existing) return res.status(400).json({ message: 'Email already registered' })

      const user = await User.create({ name, email, password, phone })
      const token = generateToken(user._id)
      res.status(201).json({ token, user })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
)

// ── Login ───────────────────────────────────────────────────
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ]),
  async (req, res) => {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email }).select('+password')
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }
      const token = generateToken(user._id)
      res.json({ token, user: user.toJSON() })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
)

// ── Get current user ────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
