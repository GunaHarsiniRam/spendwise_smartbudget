const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/profile', auth, async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'notifications']
    const updates = {}
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json({ users, total: users.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
