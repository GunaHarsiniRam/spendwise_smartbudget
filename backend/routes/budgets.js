const express = require('express')
const auth = require('../middleware/auth')
const Budget = require('../models/Budget')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const now = new Date()
    const month = parseInt(req.query.month) || now.getMonth() + 1
    const year = parseInt(req.query.year) || now.getFullYear()
    const budgets = await Budget.find({ user: req.user.id, month, year })
    res.json({ budgets })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const now = new Date()
    const { category, limit, month = now.getMonth() + 1, year = now.getFullYear() } = req.body
    const existing = await Budget.findOne({ user: req.user.id, category, month, year })
    if (existing) return res.status(400).json({ message: 'Budget already exists for this category' })
    const budget = await Budget.create({ user: req.user.id, category, limit, month, year })
    res.status(201).json({ budget })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    )
    if (!budget) return res.status(404).json({ message: 'Budget not found' })
    res.json({ budget })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    res.json({ message: 'Budget deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
