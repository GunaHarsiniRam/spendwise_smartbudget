const mongoose = require('mongoose')

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['Food', 'Grocery', 'Shopping', 'Entertainment', 'Travel', 'Healthcare', 'Bills', 'Education', 'Others'],
    required: true,
  },
  limit: { type: Number, required: true, min: 0 },
  spent: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  violationAmount: { type: Number, default: 0 },
  penaltyApplied: { type: Number, default: 0 },
}, { timestamps: true })

budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true })

module.exports = mongoose.model('Budget', budgetSchema)
