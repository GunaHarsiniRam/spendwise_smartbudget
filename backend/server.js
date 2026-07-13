const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()

const authRoutes    = require('./routes/auth')
const userRoutes    = require('./routes/users')
const expenseRoutes = require('./routes/expenses')
const budgetRoutes  = require('./routes/budgets')
const goalRoutes    = require('./routes/goals')
const walletRoutes  = require('./routes/wallet')
const charityRoutes = require('./routes/charities')
const aiRoutes      = require('./routes/ai')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ─────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(compression())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Health check (always works, even without DB) ───────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SpendWise API is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
  })
})

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/budgets',  budgetRoutes)
app.use('/api/goals',    goalRoutes)
app.use('/api/wallet',   walletRoutes)
app.use('/api/charities',charityRoutes)
app.use('/api/ai',       aiRoutes)

// ── Serve frontend in production ──────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'))
  })
} else {
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' })
  })
}

// ── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ── Connect to MongoDB then start server ───────────────────
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spendwise'

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO_URI)
    app.listen(PORT, () => {
      console.log(`\n🚀 SpendWise API running on http://localhost:${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔧 Health check: http://localhost:${PORT}/api/health\n`)
    })
  })
  .catch((err) => {
    console.error('\n❌ MongoDB connection failed:', err.message)
    console.error('👉 Make sure MongoDB is running: mongod')
    console.error('👉 Or set MONGODB_URI in .env to your MongoDB Atlas connection string\n')
    // Still start the server so health check works
    app.listen(PORT, () => {
      console.log(`⚠️  API started WITHOUT database on http://localhost:${PORT}`)
      console.log('   DB-dependent routes will return 500 until MongoDB is available\n')
    })
  })

module.exports = app
