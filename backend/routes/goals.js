const express = require('express')
const auth = require('../middleware/auth')
const Goal = require('../models/Goal')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json({ goals })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const goal = await Goal.create({ user: req.user.id, ...req.body })
    res.status(201).json({ goal })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    )
    if (!goal) return res.status(404).json({ message: 'Goal not found' })
    if (goal.currentAmount >= goal.targetAmount && !goal.completed) {
      goal.completed = true
      goal.completedAt = new Date()
      await goal.save()
    }
    res.json({ goal })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    res.json({ message: 'Goal deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
