const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()

const CHARITIES = [
  { _id: 'c1', name: 'Akshaya Patra', cause: 'Food Donation', logo: '🍚', description: 'Mid-day meal program for school children', verified: true },
  { _id: 'c2', name: 'WWF India', cause: 'Environment', logo: '🌱', description: 'Wildlife and environmental conservation', verified: true },
  { _id: 'c3', name: 'CRY India', cause: 'Education', logo: '📚', description: "Child rights and education", verified: true },
  { _id: 'c4', name: 'Animal Welfare Board', cause: 'Animal Welfare', logo: '🐾', description: 'Care for stray animals', verified: true },
  { _id: 'c5', name: 'iCall India', cause: 'Healthcare', logo: '🏥', description: 'Mental health support', verified: true },
]

router.get('/', auth, (req, res) => {
  res.json({ charities: CHARITIES })
})

module.exports = router
