const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchant: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['Food', 'Grocery', 'Shopping', 'Entertainment', 'Travel', 'Healthcare', 'Bills', 'Education', 'Others'],
    default: 'Others',
  },
  date: { type: Date, default: Date.now },
  note: { type: String, trim: true },
  isAiCategorized: { type: Boolean, default: false },
  receiptUrl: { type: String },
  month: { type: Number },
  year: { type: Number },
}, { timestamps: true })

expenseSchema.pre('save', function() {
  if (this.date) {
    const d = new Date(this.date)
    this.month = d.getMonth() + 1
    this.year = d.getFullYear()
  }
})

module.exports = mongoose.model('Expense', expenseSchema)
