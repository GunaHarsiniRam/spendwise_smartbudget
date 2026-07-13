const express = require('express')
const auth = require('../middleware/auth')
const Expense = require('../models/Expense')
const Budget = require('../models/Budget')
const User = require('../models/User')

const router = express.Router()

// AI category mapping
const AI_CATEGORIES = {
  swiggy: 'Food', zomato: 'Food', mcdonalds: 'Food', dominos: 'Food', pizza: 'Food',
  amazon: 'Shopping', flipkart: 'Shopping', myntra: 'Shopping', meesho: 'Shopping',
  uber: 'Travel', ola: 'Travel', irctc: 'Travel', flight: 'Travel',
  bigbasket: 'Grocery', dmart: 'Grocery', reliance: 'Grocery', blinkit: 'Grocery',
  netflix: 'Entertainment', hotstar: 'Entertainment', spotify: 'Entertainment',
  apollo: 'Healthcare', medplus: 'Healthcare', practo: 'Healthcare',
  electricity: 'Bills', bsnl: 'Bills', jio: 'Bills', airtel: 'Bills',
  udemy: 'Education', coursera: 'Education', byju: 'Education',
}

function aiCategorize(merchant) {
  const lower = merchant.toLowerCase()
  for (const [key, cat] of Object.entries(AI_CATEGORIES)) {
    if (lower.includes(key)) return cat
  }
  return 'Others'
}

// Calculate penalty
function calcPenalty(overPercent, rules) {
  if (overPercent >= 20) return rules?.rule3 || 10
  if (overPercent >= 10) return rules?.rule2 || 5
  if (overPercent >= 5) return rules?.rule1 || 1
  return 0
}

// GET all expenses for user
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, category, limit = 50, page = 1 } = req.query
    const query = { user: req.user.id }
    if (month) query.month = parseInt(month)
    if (year) query.year = parseInt(year)
    if (category) query.category = category

    const total = await Expense.countDocuments(query)
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    res.json({ expenses, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create expense
router.post('/', auth, async (req, res) => {
  try {
    const { merchant, amount, category, date, note } = req.body
    console.log(`[API] POST /expenses - Request Body:`, { merchant, amount, category, date, note })
    console.log(`[API] Authorized User ID:`, req.user.id)
    
    // Server-side validation
    if (!merchant || !merchant.trim()) {
      console.warn(`[Validation Warning] Merchant name is empty`)
      return res.status(400).json({ message: 'Merchant name is required' })
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      console.warn(`[Validation Warning] Invalid amount:`, amount)
      return res.status(400).json({ message: 'Amount must be a positive number' })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      console.error(`[DB Error] User not found:`, req.user.id)
      return res.status(404).json({ message: 'User not found' })
    }

    const finalCategory = category || aiCategorize(merchant)
    const expDate = date ? new Date(date) : new Date()

    console.log(`[DB] Creating expense record in Mongoose...`)
    const expense = await Expense.create({
      user: req.user.id,
      merchant,
      amount: parseFloat(amount),
      category: finalCategory,
      date: expDate,
      note,
      isAiCategorized: !category,
    })
    console.log(`[DB] Expense record created successfully:`, expense._id)

    // Update budget spent amount
    const budgetMonth = expDate.getMonth() + 1
    const budgetYear = expDate.getFullYear()
    
    console.log(`[DB] Checking budget for Category: ${finalCategory}, Month: ${budgetMonth}, Year: ${budgetYear}`)
    const budget = await Budget.findOne({
      user: req.user.id,
      category: finalCategory,
      month: budgetMonth,
      year: budgetYear,
    })

    if (budget && budget.enabled) {
      console.log(`[DB] Matching budget limit: ₹${budget.limit}, Spent before: ₹${budget.spent}`)
      budget.spent += parseFloat(amount)
      const over = budget.spent - budget.limit
      if (over > 0) {
        const overPercent = (over / budget.limit) * 100
        const penalty = calcPenalty(overPercent, user.penaltyRules)
        console.log(`[Budget Alert] Budget exceeded by ₹${over} (${overPercent.toFixed(1)}%). Calculated penalty: ₹${penalty}`)
        
        if (penalty > 0 && penalty > budget.penaltyApplied) {
          const newPenalty = penalty - budget.penaltyApplied
          console.log(`[Penalty Execute] Deducting new penalty diff: ₹${newPenalty} from wallet...`)
          budget.penaltyApplied = penalty
          budget.violationAmount = over
          if (user.walletBalance >= newPenalty) {
            user.walletBalance -= newPenalty
            user.totalDonated += newPenalty
            await user.save()
            console.log(`[Penalty Success] Wallet updated. New balance: ₹${user.walletBalance}, Total Donated: ₹${user.totalDonated}`)
          } else {
            console.warn(`[Penalty Skip] Wallet balance (₹${user.walletBalance}) is insufficient to cover penalty (₹${newPenalty})`)
          }
        }
      }
      await budget.save()
      console.log(`[DB] Budget record saved successfully:`, budget._id)
    } else {
      console.log(`[Budget Info] No active/enabled budget found for category ${finalCategory}`)
    }

    res.status(201).json({ expense })
  } catch (err) {
    console.error('[API Error] POST /expenses error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// DELETE expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    res.json({ message: 'Expense deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// AI categorize endpoint
router.post('/categorize', auth, (req, res) => {
  const { merchant } = req.body
  const category = aiCategorize(merchant || '')
  res.json({ category, confidence: 0.85 })
})

module.exports = router
