const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
  avatar: { type: String },
  googleId: { type: String },
  financialHealthScore: { type: Number, default: 50, min: 0, max: 100 },
  streak: { type: Number, default: 0 },
  totalBadges: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  totalDonated: { type: Number, default: 0 },
  savingsGoalsMet: { type: Number, default: 0 },
  selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
  penaltyRules: {
    rule1: { type: Number, default: 1 },
    rule2: { type: Number, default: 5 },
    rule3: { type: Number, default: 10 },
  },
  notifications: {
    budgetAlert: { type: Boolean, default: true },
    goalMilestone: { type: Boolean, default: true },
    donation: { type: Boolean, default: true },
    aiInsights: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
  },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true })

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
