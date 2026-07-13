const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '🎯' },
  color: { type: String, default: '#8b5cf6' },
  targetAmount: { type: Number, required: true, min: 1 },
  currentAmount: { type: Number, default: 0, min: 0 },
  monthlyContribution: { type: Number, required: true, min: 0 },
  deadline: { type: Date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('Goal', goalSchema)
