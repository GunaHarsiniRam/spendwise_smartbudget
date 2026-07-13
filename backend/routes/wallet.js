const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance totalDonated penaltyRules')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount < 1) return res.status(400).json({ message: 'Invalid amount' })
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { walletBalance: parseFloat(amount) } },
      { new: true }
    )
    res.json({ walletBalance: user.walletBalance, message: `₹${amount} deposited successfully` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/penalty', auth, async (req, res) => {
  try {
    const { amount, category, charity } = req.body
    if (!amount || amount < 1) return res.status(400).json({ message: 'Invalid amount' })
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.walletBalance < amount) return res.status(400).json({ message: 'Insufficient wallet balance' })
    user.walletBalance -= parseFloat(amount)
    user.totalDonated  += parseFloat(amount)
    await user.save()
    res.json({ walletBalance: user.walletBalance, totalDonated: user.totalDonated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/penalty-rules', auth, async (req, res) => {
  try {
    const { rule1, rule2, rule3 } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { penaltyRules: { rule1, rule2, rule3 } },
      { new: true }
    )
    res.json({ penaltyRules: user.penaltyRules })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
