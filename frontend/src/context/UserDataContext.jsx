/**
 * UserDataContext
 * ──────────────
 * Stores and manages user transaction, budget, goal, and wallet stats.
 * Uses backend API endpoints to synchronize changes with MongoDB,
 * falling back to localStorage if offline or backend is unavailable.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api from '../utils/api'

// ── Helpers ────────────────────────────────────────────────────────────────
const key  = (uid, k) => `sw_${uid}_${k}`
const load = (uid, k, fallback) => {
  try {
    const raw = localStorage.getItem(key(uid, k))
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}
const save = (uid, k, val) => {
  try { localStorage.setItem(key(uid, k), JSON.stringify(val)) } catch {}
}

// ── Empty defaults for a brand-new user ────────────────────────────────────
const freshProfile = (user) => ({
  financialHealthScore: 50,
  streak:               0,
  totalBadges:          0,
  walletBalance:        0,
  totalDonated:         0,
  savingsGoalsMet:      0,
  monthlyIncome:        0,   // user sets this themselves
  name:  user?.name  || '',
  email: user?.email || '',
  phone: user?.phone || '',
  selectedCharity:  null,
  onboardingDone:   false,
  savingStyle:      null,
  penaltyRules:     { rule1: 1, rule2: 5, rule3: 10 },
  notifications: {
    budgetAlert:   true,
    goalMilestone: true,
    donation:      true,
    aiInsights:    true,
    weeklyReport:  true,
    monthlyReview: false,
  },
})

// ── Static data shared by everyone (charities, badges list) ───────────────
export const ALL_CHARITIES = [
  { _id:'c1', name:'Akshaya Patra',      cause:'Food Donation',  logo:'🍚', description:'Mid-day meal program for school children',             impactFactor:'meals provided',  verified:true },
  { _id:'c2', name:'WWF India',          cause:'Environment',    logo:'🌱', description:'Wildlife and environmental conservation',               impactFactor:'trees supported', verified:true },
  { _id:'c3', name:'CRY India',          cause:'Education',      logo:'📚', description:'Child rights and education for underprivileged children',impactFactor:'children educated',verified:true },
  { _id:'c4', name:'Animal Welfare Board',cause:'Animal Welfare',logo:'🐾', description:'Care and welfare of stray animals',                     impactFactor:'animals helped',  verified:true },
  { _id:'c5', name:'iCall India',        cause:'Healthcare',     logo:'🏥', description:'Mental health support and counselling',                  impactFactor:'people supported',verified:true },
]

export const ALL_BADGE_TEMPLATES = [
  { id:1, name:'First Step',       icon:'👟', description:'Added your first expense',             condition:'expenses_1' },
  { id:2, name:'Budget Setter',    icon:'🎯', description:'Created your first budget',            condition:'budgets_1' },
  { id:3, name:'Goal Getter',      icon:'🚀', description:'Created your first savings goal',      condition:'goals_1' },
  { id:4, name:'Saver',            icon:'💰', description:'Saved ₹1,000 in your wallet',          condition:'wallet_1000' },
  { id:5, name:'Charity Heart',    icon:'❤️', description:'Made your first charity donation',     condition:'donated_1' },
  { id:6, name:'Week Streak',      icon:'🔥', description:'Logged expenses 7 days in a row',      condition:'streak_7' },
  { id:7, name:'Budget Master',    icon:'🏆', description:'Stayed within all budgets for a month',condition:'all_safe_month' },
  { id:8, name:'Goal Complete',    icon:'⭐', description:'Completed a savings goal',             condition:'goal_completed' },
]

// ── Context ────────────────────────────────────────────────────────────────
const UserDataContext = createContext(null)

export function UserDataProvider({ children }) {
  const { user } = useAuth()
  const uid = user?._id

  // ── Per-user state ────────────────────────────────────────────────────
  const [profile,        setProfileState]    = useState({})
  const [expenses,       setExpensesState]   = useState([])
  const [budgets,        setBudgetsState]    = useState([])
  const [goals,          setGoalsState]      = useState([])
  const [walletTxns,     setWalletTxns]      = useState([])
  const [donations,      setDonations]       = useState([])
  const [earnedBadges,   setEarnedBadges]    = useState([])
  const [notifications,  setNotifications]   = useState([])
  // NEW: impulse records + monthly stories + student profile
  const [impulseRecords, setImpulseRecords]  = useState([])
  const [monthlyStories, setMonthlyStories]  = useState([])
  const [studentProfile, setStudentProfile]  = useState(null)

  // ── Load all user data when userId changes ────────────────────────────
  useEffect(() => {
    if (!uid) {
      setProfileState({})
      setExpensesState([])
      setBudgetsState([])
      setGoalsState([])
      setWalletTxns([])
      setDonations([])
      setEarnedBadges([])
      setNotifications([])
      setImpulseRecords([])
      setMonthlyStories([])
      setStudentProfile(null)
      return
    }

    // Load local-only metadata
    setDonations(load(uid,     'donations',     []))
    setEarnedBadges(load(uid,  'earnedBadges',  []))
    setNotifications(load(uid, 'notifications', []))
    setImpulseRecords(load(uid,'impulseRecords',[]))
    setMonthlyStories(load(uid,'monthlyStories',[]))
    setStudentProfile(load(uid,'studentProfile', null))
    setWalletTxns(load(uid,    'walletTxns',    []))

    const fetchData = async () => {
      try {
        const [profileRes, walletRes, expensesRes, budgetsRes, goalsRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/wallet'),
          api.get('/expenses'),
          api.get('/budgets'),
          api.get('/goals')
        ])

        const dbUser = profileRes.data.user || {}
        const dbWallet = walletRes.data || {}
        
        const mergedProfile = {
          ...freshProfile(user),
          ...dbUser,
          walletBalance: dbWallet.walletBalance || 0,
          totalDonated: dbWallet.totalDonated || 0,
          penaltyRules: dbWallet.penaltyRules || { rule1: 1, rule2: 5, rule3: 10 }
        }
        setProfileState(mergedProfile)
        setExpensesState(expensesRes.data.expenses || [])
        setBudgetsState(budgetsRes.data.budgets || [])
        setGoalsState(goalsRes.data.goals || [])
      } catch (err) {
        console.error('Failed to load user data from backend, using local fallback:', err.message)
        // Fallback to local storage if backend call fails
        setProfileState(load(uid, 'profile',       freshProfile(user)))
        setExpensesState(load(uid, 'expenses',      []))
        setBudgetsState(load(uid,  'budgets',       []))
        setGoalsState(load(uid,    'goals',         []))
      }
    }

    fetchData()
  }, [uid, user])

  // ── Persist helpers ───────────────────────────────────────────────────
  const setProfile = useCallback((val) => {
    const next = typeof val === 'function' ? val(profile) : val
    setProfileState(next); if (uid) save(uid, 'profile', next)
  }, [uid, profile])

  const setExpenses = useCallback((val) => {
    const next = typeof val === 'function' ? val(expenses) : val
    setExpensesState(next); if (uid) save(uid, 'expenses', next)
  }, [uid, expenses])

  const setBudgets = useCallback((val) => {
    const next = typeof val === 'function' ? val(budgets) : val
    setBudgetsState(next); if (uid) save(uid, 'budgets', next)
  }, [uid, budgets])

  const setGoals = useCallback((val) => {
    const next = typeof val === 'function' ? val(goals) : val
    setGoalsState(next); if (uid) save(uid, 'goals', next)
  }, [uid, goals])

  const setWallet = useCallback((val) => {
    const next = typeof val === 'function' ? val(walletTxns) : val
    setWalletTxns(next); if (uid) save(uid, 'walletTxns', next)
  }, [uid, walletTxns])

  const setDonationsState = useCallback((val) => {
    const next = typeof val === 'function' ? val(donations) : val
    setDonations(next); if (uid) save(uid, 'donations', next)
  }, [uid, donations])

  // ── Badge check ───────────────────────────────────────────────────────
  const checkAndAwardBadge = useCallback((condition) => {
    setEarnedBadges(prev => {
      if (prev.includes(condition)) return prev
      const next = [...prev, condition]
      if (uid) save(uid, 'earnedBadges', next)
      return next
    })
  }, [uid])

  // ── Computed stats ────────────────────────────────────────────────────
  const walletBalance = profile.walletBalance || 0
  const totalDonated  = profile.totalDonated || 0

  // Budget spent amount mapping
  const budgetsWithSpent = budgets.map(b => {
    const spent = expenses
      .filter(e => e.category === b.category)
      .reduce((s, e) => s + (e.amount || 0), 0)
    return { ...b, spent }
  })

  // Health score calculation
  const computeHealthScore = () => {
    if (budgetsWithSpent.length === 0 && goals.length === 0) {
      return profile.financialHealthScore || 50
    }
    let score = 40
    if (budgetsWithSpent.length > 0) {
      const safePct = budgetsWithSpent.filter(b => b.spent <= b.limit).length / budgetsWithSpent.length
      score += safePct * 30
    }
    if (goals.length > 0) {
      const avgPct = goals.reduce((s, g) => s + Math.min((g.currentAmount / g.targetAmount) * 100, 100), 0) / goals.length
      score += (avgPct / 100) * 20
    }
    const streak = profile.streak || 0
    score += Math.min(streak, 30) / 30 * 10
    return Math.min(Math.round(score), 100)
  }

  // ── Add expense ───────────────────────────────────────────────────────
  const addExpense = useCallback(async (expenseData) => {
    try {
      const res = await api.post('/expenses', expenseData)
      const newExp = res.data.expense
      setExpenses(prev => [newExp, ...prev])
      checkAndAwardBadge('expenses_1')

      // Fetch fresh data after expense is saved
      const [profileRes, walletRes, budgetsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/wallet'),
        api.get('/budgets'),
      ])
      const dbWallet  = walletRes.data || {}
      const freshBudgets = budgetsRes.data.budgets || []
      setBudgetsState(freshBudgets)
      setProfile(prev => ({
        ...prev,
        ...(profileRes.data.user || {}),
        walletBalance: dbWallet.walletBalance ?? prev.walletBalance,
        totalDonated:  dbWallet.totalDonated  ?? prev.totalDonated,
      }))

      // ── Penalty & donation logic using FRESH budget data ──────────────
      const cat         = newExp.category || expenseData.category
      const freshBudget = freshBudgets.find(b => b.category === cat)

      if (freshBudget && freshBudget.spent > freshBudget.limit) {
        const over    = freshBudget.spent - freshBudget.limit
        const overPct = (over / freshBudget.limit) * 100
        const rules   = profile.penaltyRules || { rule1: 1, rule2: 5, rule3: 10 }
        // Any overage triggers rule1 as minimum penalty
        const penalty = overPct >= 20 ? rules.rule3
                      : overPct >= 10 ? rules.rule2
                      : rules.rule1

        const currentWalletBal = dbWallet.walletBalance ?? walletBalance
        if (penalty > 0 && currentWalletBal >= penalty) {
          const charity = ALL_CHARITIES.find(c => c._id === profile.selectedCharity) || ALL_CHARITIES[0]

          // Deduct from backend wallet
          try {
            await api.post('/wallet/penalty', { amount: penalty, category: cat, charity: charity.name })
          } catch {
            // backend penalty endpoint may not exist — handle locally
          }

          // Record donation locally
          const don = {
            _id:     `d_${uid}_${Date.now()}`,
            charity: charity.name,
            cause:   charity.cause,
            amount:  penalty,
            date:    new Date().toISOString(),
            trigger: `${cat} budget exceeded by ₹${Math.round(over)}`,
            impact:  `₹${penalty} donated to ${charity.name}`,
          }
          setDonationsState(prev => [don, ...prev])
          checkAndAwardBadge('donated_1')

          // Update wallet balance & totalDonated in profile state immediately
          setProfile(prev => ({
            ...prev,
            walletBalance: Math.max(0, (prev.walletBalance || 0) - penalty),
            totalDonated:  (prev.totalDonated || 0) + penalty,
          }))

          // Add penalty transaction to wallet history
          setWallet(prev => [{
            _id:         `wt_${uid}_${Date.now()}`,
            type:        'penalty',
            amount:      -penalty,
            description: `${cat} budget exceeded — donated to ${charity.name}`,
            date:        new Date().toISOString(),
          }, ...prev])

          // Notification
          setNotifications(prev => [{
            _id:     `n_${Date.now()}`,
            type:    'danger',
            title:   'Budget Exceeded!',
            message: `${cat} over by ₹${Math.round(over)}. ₹${penalty} auto-donated to ${charity.name}.`,
            read:    false,
            time:    new Date().toISOString(),
          }, ...prev.slice(0, 19)])
        }
      }

      return newExp
    } catch (err) {
      console.error('addExpense API error, using local fallback:', err.message)
      // ── Offline fallback ──────────────────────────────────────────────
      const newExp = {
        _id:    `e_${uid}_${Date.now()}`,
        ...expenseData,
        date:   expenseData.date || new Date().toISOString(),
        userId: uid,
      }
      setExpenses(prev => [newExp, ...prev])
      checkAndAwardBadge('expenses_1')

      // Penalty check using local budgets state
      const cat         = expenseData.category
      const catBudget   = budgets.find(b => b.category === cat)
      if (catBudget) {
        const currentSpent = expenses
          .filter(e => e.category === cat)
          .reduce((s, e) => s + e.amount, 0) + expenseData.amount
        const over = currentSpent - catBudget.limit
        if (over > 0) {
          const overPct = (over / catBudget.limit) * 100
          const rules   = profile.penaltyRules || { rule1: 1, rule2: 5, rule3: 10 }
          const penalty = overPct >= 20 ? rules.rule3 : overPct >= 10 ? rules.rule2 : rules.rule1
          if (penalty > 0 && walletBalance >= penalty) {
            const charity = ALL_CHARITIES.find(c => c._id === profile.selectedCharity) || ALL_CHARITIES[0]
            const don = {
              _id:     `d_${uid}_${Date.now()}`,
              charity: charity.name,
              cause:   charity.cause,
              amount:  penalty,
              date:    new Date().toISOString(),
              trigger: `${cat} budget exceeded by ₹${Math.round(over)}`,
              impact:  `₹${penalty} donated to ${charity.name}`,
            }
            setDonationsState(prev => [don, ...prev])
            checkAndAwardBadge('donated_1')
            setProfile(prev => ({
              ...prev,
              walletBalance: Math.max(0, (prev.walletBalance || 0) - penalty),
              totalDonated:  (prev.totalDonated || 0) + penalty,
            }))
            setWallet(prev => [{
              _id:         `wt_${uid}_${Date.now()}`,
              type:        'penalty',
              amount:      -penalty,
              description: `${cat} budget exceeded — donated to ${charity.name}`,
              date:        new Date().toISOString(),
            }, ...prev])
            setNotifications(prev => [{
              _id:     `n_${Date.now()}`,
              type:    'danger',
              title:   'Budget Exceeded!',
              message: `${cat} over by ₹${Math.round(over)}. ₹${penalty} auto-donated to ${charity.name}.`,
              read:    false,
              time:    new Date().toISOString(),
            }, ...prev.slice(0, 19)])
          }
        }
      }
      return newExp
    }
  }, [uid, expenses, budgets, walletBalance, profile, setExpenses, setProfile, setWallet, checkAndAwardBadge, setDonationsState])

  const updateExpense = useCallback(async (id, updates) => {
    try {
      if (!String(id).startsWith('e_')) {
        await api.put(`/expenses/${id}`, updates)
      }
      setExpenses(prev => prev.map(e => e._id === id ? { ...e, ...updates } : e))
    } catch (err) {
      console.error('updateExpense API error:', err.message)
      setExpenses(prev => prev.map(e => e._id === id ? { ...e, ...updates } : e))
    }
  }, [setExpenses])

  const deleteExpense = useCallback(async (id) => {
    try {
      if (!String(id).startsWith('e_')) {
        await api.delete(`/expenses/${id}`)
      }
      setExpenses(prev => prev.filter(e => e._id !== id))
    } catch (err) {
      console.error('deleteExpense API error:', err.message)
      setExpenses(prev => prev.filter(e => e._id !== id))
    }
  }, [setExpenses])

  // ── Add budget ────────────────────────────────────────────────────────
  const addBudget = useCallback(async (data) => {
    try {
      const res = await api.post('/budgets', data)
      const b = res.data.budget
      setBudgets(prev => [...prev, b])
      checkAndAwardBadge('budgets_1')
      return b
    } catch (err) {
      console.error('addBudget API error, using local fallback:', err.message)
      const b = { _id: `b_${uid}_${Date.now()}`, ...data, userId: uid }
      setBudgets(prev => [...prev, b])
      checkAndAwardBadge('budgets_1')
      return b
    }
  }, [uid, setBudgets, checkAndAwardBadge])

  const updateBudget = useCallback(async (id, updates) => {
    try {
      if (!String(id).startsWith('b_')) {
        await api.put(`/budgets/${id}`, updates)
      }
      setBudgets(prev => prev.map(b => b._id === id ? { ...b, ...updates } : b))
    } catch (err) {
      console.error('updateBudget API error:', err.message)
      setBudgets(prev => prev.map(b => b._id === id ? { ...b, ...updates } : b))
    }
  }, [setBudgets])

  const deleteBudget = useCallback(async (id) => {
    try {
      if (!String(id).startsWith('b_')) {
        await api.delete(`/budgets/${id}`)
      }
      setBudgets(prev => prev.filter(b => b._id !== id))
    } catch (err) {
      console.error('deleteBudget API error:', err.message)
      setBudgets(prev => prev.filter(b => b._id !== id))
    }
  }, [setBudgets])

  // ── Add goal ──────────────────────────────────────────────────────────
  const addGoal = useCallback(async (data) => {
    try {
      const res = await api.post('/goals', data)
      const g = res.data.goal
      setGoals(prev => [...prev, g])
      checkAndAwardBadge('goals_1')
      return g
    } catch (err) {
      console.error('addGoal API error, using local fallback:', err.message)
      const g = { _id: `g_${uid}_${Date.now()}`, ...data, userId: uid }
      setGoals(prev => [...prev, g])
      checkAndAwardBadge('goals_1')
      return g
    }
  }, [uid, setGoals, checkAndAwardBadge])

  const updateGoal = useCallback(async (id, updates) => {
    try {
      if (!String(id).startsWith('g_')) {
        await api.put(`/goals/${id}`, updates)
      }
      setGoals(prev => prev.map(g => {
        if (g._id !== id) return g
        const updated = { ...g, ...updates }
        if (updated.currentAmount >= updated.targetAmount) {
          checkAndAwardBadge('goal_completed')
          setProfile(p => ({ ...p, savingsGoalsMet: (p.savingsGoalsMet || 0) + 1 }))
        }
        return updated
      }))
    } catch (err) {
      console.error('updateGoal API error:', err.message)
      setGoals(prev => prev.map(g => {
        if (g._id !== id) return g
        const updated = { ...g, ...updates }
        if (updated.currentAmount >= updated.targetAmount) {
          checkAndAwardBadge('goal_completed')
          setProfile(p => ({ ...p, savingsGoalsMet: (p.savingsGoalsMet || 0) + 1 }))
        }
        return updated
      }))
    }
  }, [setGoals, checkAndAwardBadge, setProfile])

  const deleteGoal = useCallback(async (id) => {
    try {
      if (!String(id).startsWith('g_')) {
        await api.delete(`/goals/${id}`)
      }
      setGoals(prev => prev.filter(g => g._id !== id))
    } catch (err) {
      console.error('deleteGoal API error:', err.message)
      setGoals(prev => prev.filter(g => g._id !== id))
    }
  }, [setGoals])

  // ── Impulse purchase tracking ─────────────────────────────────────────
  const addImpulseRecord = useCallback((record) => {
    const rec = { _id:`ir_${uid}_${Date.now()}`, ...record, date:new Date().toISOString() }
    setImpulseRecords(prev => {
      const next = [rec, ...prev]
      if (uid) save(uid, 'impulseRecords', next)
      return next
    })
    return rec
  }, [uid])

  // ── Monthly story ─────────────────────────────────────────────────────
  const saveMonthlyStory = useCallback((story) => {
    setMonthlyStories(prev => {
      const filtered = prev.filter(s => s.monthKey !== story.monthKey)
      const next = [story, ...filtered].slice(0, 24) // keep 2 years
      if (uid) save(uid, 'monthlyStories', next)
      return next
    })
  }, [uid])

  // ── Student profile ───────────────────────────────────────────────────
  const updateStudentProfile = useCallback((updates) => {
    setStudentProfile(prev => {
      const next = { ...(prev||{}), ...updates }
      if (uid) save(uid, 'studentProfile', next)
      return next
    })
  }, [uid])

  // Detect impulse purchase based on expense
  const detectImpulse = useCallback((expense) => {
    const hour = new Date(expense.date || new Date()).getHours()
    const isLateNight = hour >= 22 || hour <= 5
    const isWeekend   = [0,6].includes(new Date(expense.date||new Date()).getDay())
    const catExpenses = expenses.filter(e => e.category === expense.category)
    const avgCatAmt   = catExpenses.length > 0 ? catExpenses.reduce((s,e)=>s+e.amount,0)/catExpenses.length : 0
    const isAboveAvg  = avgCatAmt > 0 && expense.amount > avgCatAmt * 1.5

    const riskFactors = []
    if (isLateNight) riskFactors.push('Late night purchase')
    if (isWeekend)   riskFactors.push('Weekend spending')
    if (isAboveAvg)  riskFactors.push(`${Math.round((expense.amount/avgCatAmt-1)*100)}% above your average`)
    if (['Shopping','Entertainment'].includes(expense.category)) riskFactors.push('High-impulse category')

    const score = Math.min(100, riskFactors.length * 25 + (isAboveAvg ? 25 : 0))
    const level = score >= 75 ? 'High' : score >= 50 ? 'Medium' : score >= 25 ? 'Low' : null

    return level ? { score, level, factors: riskFactors } : null
  }, [expenses])

  const depositToWallet = useCallback(async (amount) => {
    try {
      await api.post('/wallet/deposit', { amount })
      
      // Fetch updated wallet
      const walletRes = await api.get('/wallet')
      const newBal = walletRes.data.walletBalance
      setProfile(prev => ({ ...prev, walletBalance: newBal }))

      const txn = {
        _id: `wt_${uid}_${Date.now()}`,
        type: 'deposit',
        amount,
        description: 'Manual deposit',
        date: new Date().toISOString(),
        balance: newBal,
      }
      setWallet(prev => [txn, ...prev])
      if (newBal >= 1000) checkAndAwardBadge('wallet_1000')
      
      setNotifications(prev => [{
        _id: `n_${Date.now()}`,
        type: 'success',
        title: 'Wallet Topped Up!',
        message: `₹${amount} deposited to your accountability wallet.`,
        read: false,
        time: new Date().toISOString(),
      }, ...prev.slice(0, 19)])
    } catch (err) {
      console.error('depositToWallet API error:', err.message)
      const newBal = walletBalance + amount
      const txn = {
        _id: `wt_${uid}_${Date.now()}`,
        type: 'deposit',
        amount,
        description: 'Manual deposit',
        date: new Date().toISOString(),
        balance: newBal,
      }
      setWallet(prev => [txn, ...prev])
      if (newBal >= 1000) checkAndAwardBadge('wallet_1000')
    }
  }, [walletBalance, uid, setWallet, checkAndAwardBadge])

  // ── Mark notification read ────────────────────────────────────────────
  const markNotificationsRead = useCallback(() => {
    const next = notifications.map(n => ({ ...n, read: true }))
    setNotifications(next)
    if (uid) save(uid, 'notifications', next)
  }, [notifications, uid])

  // ── Update profile ────────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    try {
      const res = await api.put('/users/profile', updates)
      setProfile(prev => ({ ...prev, ...res.data.user }))
    } catch (err) {
      console.error('updateProfile API error:', err.message)
      setProfile(prev => ({ ...prev, ...updates }))
    }
  }, [setProfile])

  // ── Increment streak ──────────────────────────────────────────────────
  const incrementStreak = useCallback(() => {
    setProfile(prev => {
      const newStreak = (prev.streak || 0) + 1
      if (newStreak >= 7) checkAndAwardBadge('streak_7')
      return { ...prev, streak: newStreak }
    })
  }, [setProfile, checkAndAwardBadge])

  // ── Build badges array for UI ─────────────────────────────────────────
  const badges = ALL_BADGE_TEMPLATES.map(t => ({
    ...t,
    earned: earnedBadges.includes(t.condition),
    earnedDate: earnedBadges.includes(t.condition) ? 'Earned' : null,
  }))

  // ── AI insights — personalised based on actual user data ──────────────
  const aiInsights = []
  if (budgetsWithSpent.length > 0) {
    const foodBudget = budgetsWithSpent.find(b => b.category === 'Food')
    if (foodBudget && foodBudget.spent > foodBudget.limit) {
      aiInsights.push({ id:1, type:'warning', icon:'🍕', title:'Food Spending Alert', message:`You've spent ₹${foodBudget.spent.toLocaleString()} on food this month — ₹${(foodBudget.spent - foodBudget.limit).toLocaleString()} over your limit. Cooking 2 meals/week could save ₹1,200/month.`, saving:1200, priority:'high' })
    }
    const shoppingBudget = budgetsWithSpent.find(b => b.category === 'Shopping')
    if (shoppingBudget && shoppingBudget.spent > shoppingBudget.limit * 0.8) {
      aiInsights.push({ id:2, type:'info', icon:'🛍️', title:'Shopping Pattern', message:`Shopping is at ${Math.round((shoppingBudget.spent/shoppingBudget.limit)*100)}% of your budget. Wait 48 hours before non-essential purchases.`, saving:800, priority:'medium' })
    }
  }
  if (goals.length > 0) {
    const slowGoal = goals.find(g => (g.currentAmount / g.targetAmount) < 0.3)
    if (slowGoal) {
      aiInsights.push({ id:3, type:'info', icon:'🎯', title:`Boost ${slowGoal.name}`, message:`Your "${slowGoal.name}" goal is only ${Math.round((slowGoal.currentAmount/slowGoal.targetAmount)*100)}% complete. Add ₹${slowGoal.monthlyContribution?.toLocaleString() || '500'}/month to accelerate.`, saving: slowGoal.monthlyContribution || 500, priority:'medium' })
    }
  }
  if (aiInsights.length === 0) {
    aiInsights.push({ id:4, type:'success', icon:'💡', title:'Great Start!', message:'Add your first expense and create a budget to get personalised AI insights tailored to your spending habits.', saving:0, priority:'low' })
  }

  // ── Monthly spending for charts — derived from real expenses ──────────
  const monthlySpending = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return months.map((month, idx) => {
      const monthExpenses = expenses.filter(e => {
        try { return new Date(e.date).getMonth() === idx } catch { return false }
      })
      const spending = monthExpenses.reduce((s, e) => s + e.amount, 0)
      const monthDonations = donations.filter(d => {
        try { return new Date(d.date).getMonth() === idx } catch { return false }
      })
      const donationTotal = monthDonations.reduce((s, d) => s + d.amount, 0)
      const income = profile.monthlyIncome || 0
      const savings = Math.max(0, income - spending - donationTotal)
      return { month, spending, savings, donations: donationTotal }
    }).filter(m => m.spending > 0 || m.savings > 0)
  })()

  const healthScore = computeHealthScore()

  return (
    <UserDataContext.Provider value={{
      // State
      profile: { ...profile, financialHealthScore: healthScore, walletBalance, totalDonated, totalBadges: earnedBadges.length },
      expenses,
      budgets: budgetsWithSpent,
      goals,
      walletTxns,
      donations,
      badges,
      notifications,
      aiInsights,
      monthlySpending,
      walletBalance,
      totalDonated,
      // Actions
      addExpense,
      updateExpense,
      deleteExpense,
      addBudget, updateBudget, deleteBudget,
      addGoal, updateGoal, deleteGoal,
      depositToWallet,
      updateProfile,
      incrementStreak,
      markNotificationsRead,
      setProfile,
      // NEW features
      impulseRecords,
      monthlyStories,
      studentProfile,
      addImpulseRecord,
      saveMonthlyStory,
      updateStudentProfile,
      detectImpulse,
    }}>      {children}
    </UserDataContext.Provider>
  )
}

export const useUserData = () => {
  const ctx = useContext(UserDataContext)
  if (!ctx) throw new Error('useUserData must be used inside UserDataProvider')
  return ctx
}
