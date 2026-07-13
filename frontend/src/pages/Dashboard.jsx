import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, ArrowRight, Target,
  Zap, ChevronRight, Calendar, Plus, Check,
  DollarSign, PieChart, Flag, Smile, ShoppingBag,
  Coffee, AlertTriangle, Sparkles, ShoppingCart
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useUserData } from '../context/UserDataContext'
import { calcPercentage, formatDate, getCategoryInfo, CATEGORIES } from '../utils/helpers'
import PurchaseImpactModal from '../components/features/PurchaseImpact'

/* ── animation helpers ── */
const fade  = (d=0) => ({ hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.45, delay:d, ease:[.22,1,.36,1] } } })
const stag  = { hidden:{opacity:0}, show:{ opacity:1, transition:{ staggerChildren:0.09 } } }

const MERCHANT_MAP = {
  swiggy:'Food',zomato:'Food',mcdonalds:'Food',amazon:'Shopping',flipkart:'Shopping',
  uber:'Travel',ola:'Travel',bigbasket:'Grocery',dmart:'Grocery',netflix:'Entertainment',
  jio:'Bills',airtel:'Bills',apollo:'Healthcare',udemy:'Education',
}
const aiCat = m=>{ const l=m.toLowerCase(); for(const[k,v] of Object.entries(MERCHANT_MAP)) if(l.includes(k)) return v; return 'Others' }

/* ── personality ── */
function getPersonality(budgets, goals) {
  const over = budgets.filter(b=>b.spent>b.limit).length
  const total = budgets.length
  const completed = goals.filter(g=>g.currentAmount>=g.targetAmount).length
  if (total===0&&goals.length===0) return { label:'Fresh Start', color:'#6366F1', bg:'#EEF2FF', icon:'🌱', desc:'Set a budget to discover your financial personality.' }
  if (over===0&&completed>0)       return { label:'Goal Achiever', color:'#059669', bg:'#ECFDF5', icon:'🏆', desc:'You hit goals consistently and keep spending in check.' }
  if (over===0&&total>0)           return { label:'Careful Saver', color:'#4F46E5', bg:'#EEF2FF', icon:'💰', desc:'You stay within every budget. Real financial discipline.' }
  if (over<=Math.floor(total*0.3)) return { label:'Smart Spender', color:'#D97706', bg:'#FFFBEB', icon:'💡', desc:'Mostly disciplined with occasional splurges.' }
  return { label:'Budget Explorer', color:'#DC2626', bg:'#FEF2F2', icon:'🔍', desc:'Still finding your rhythm. Small adjustments make big differences.' }
}

function getMood(spentPct, overCount) {
  if (overCount>0)      return { label:'Budget Alert',   color:'#EF4444', dot:'#EF4444', bg:'#FEF2F2', border:'#FECACA' }
  if (spentPct>70)      return { label:'Watch Spending', color:'#F59E0B', dot:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' }
  return                       { label:'Strong Month',   color:'#10B981', dot:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' }
}

function getInsight(saved, goals, spentPct, firstName) {
  if (goals.length>0) {
    const top = [...goals].sort((a,b)=>(b.currentAmount/b.targetAmount)-(a.currentAmount/a.targetAmount))[0]
    const pct = Math.round((top.currentAmount/top.targetAmount)*100)
    if (pct>0) return `You're ${pct}% closer to your ${top.name} goal — keep it up, ${firstName}!`
  }
  if (spentPct<40) return `Only ${Math.round(spentPct)}% of your budget used — you're pacing really well this month.`
  if (saved>5000)  return `You've saved ₹${saved.toLocaleString()} this month — that's a great start!`
  return `Every smart financial choice you make compounds over time, ${firstName}.`
}

const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#1C1C1E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'#8E8E93', marginBottom:6, fontSize:11 }}>{label}</p>
      {payload.map((e,i)=>(
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:e.color }}/>
          <span style={{ color:'#AEAEB2', fontSize:11 }}>{e.name}:</span>
          <span style={{ color:'#F5F5F7', fontWeight:600 }}>₹{e.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   ONBOARDING COMPONENT
══════════════════════════════════════════════════════ */
function OnboardingDashboard({ firstName, profile, onComplete }) {
  const { addExpense, addBudget, addGoal, updateProfile } = useUserData()
  const navigate = useNavigate()

  const [step, setStep]           = useState(0)   // 0=welcome, 1=income, 2=expense, 3=budget, 4=goal, 5=style
  const [completedSteps, setDone] = useState([])
  const [income, setIncome]       = useState('')
  const [expense, setExpense]     = useState({ merchant:'', amount:'', category:'Food' })
  const [budget, setBudget]       = useState({ category:'Food', limit:'' })
  const [goal, setGoal]           = useState({ name:'', targetAmount:'', monthlyContribution:'' })
  const [savingStyle, setStyle]   = useState('')
  const [saving, setSaving]       = useState(false)

  const totalSteps = 5
  const progress   = Math.round((completedSteps.length / totalSteps) * 100)

  const markDone = (s) => setDone(p => p.includes(s) ? p : [...p, s])

  const handleIncome = () => {
    const val = parseFloat(income)
    if (!val||val<1) return
    updateProfile({ monthlyIncome: val })
    markDone(1); setStep(2)
  }

  const handleExpense = () => {
    const amt = parseFloat(expense.amount)
    if (!expense.merchant||!amt) return
    addExpense({ merchant:expense.merchant, amount:amt, category:aiCat(expense.merchant)||expense.category, date:new Date().toISOString(), note:'First expense' })
    markDone(2); setStep(3)
  }

  const handleBudget = () => {
    const lim = parseFloat(budget.limit)
    if (!lim) return
    addBudget({ category:budget.category, limit:lim, spent:0, enabled:true })
    markDone(3); setStep(4)
  }

  const handleGoal = () => {
    const tgt = parseFloat(goal.targetAmount)
    if (!goal.name||!tgt) return
    addGoal({ name:goal.name, targetAmount:tgt, currentAmount:0, monthlyContribution:parseFloat(goal.monthlyContribution)||0, color:'#4F46E5', icon:'🎯' })
    markDone(4); setStep(5)
  }

  const handleStyle = (style) => {
    setStyle(style)
    updateProfile({ savingStyle: style })
    markDone(5)
    setSaving(true)
    setTimeout(() => { setSaving(false); onComplete() }, 1200)
  }

  const STEPS = [
    { id:1, icon:<DollarSign size={20}/>, label:'Monthly Income',  color:'#4F46E5' },
    { id:2, icon:<ShoppingBag size={20}/>, label:'First Expense',  color:'#DC2626' },
    { id:3, icon:<PieChart size={20}/>,    label:'First Budget',   color:'#D97706' },
    { id:4, icon:<Target size={20}/>,      label:'First Goal',     color:'#059669' },
    { id:5, icon:<Smile size={20}/>,       label:'Saving Style',   color:'#7C3AED' },
  ]

  if (saving) {
    return (
      <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
        <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }}
          style={{ width:56, height:56, borderRadius:'50%', border:'4px solid #E5E7EB', borderTopColor:'#4F46E5' }}/>
        <p style={{ fontSize:18, fontWeight:700, color:'#111827' }}>Building your dashboard…</p>
        <p style={{ fontSize:14, color:'#9CA3AF' }}>Just a moment, {firstName}!</p>
      </div>
    )
  }

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ maxWidth:680, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>

      {/* Welcome header */}
      <motion.div variants={fade(0)}>
        <div style={{ background:'linear-gradient(135deg,#0F0C29 0%,#302B63 50%,#24243E 100%)', borderRadius:24, padding:'40px 44px', position:'relative', overflow:'hidden', textAlign:'center' }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(99,102,241,0.15)', filter:'blur(50px)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-50, left:-50, width:200, height:200, borderRadius:'50%', background:'rgba(16,185,129,0.1)', filter:'blur(40px)', pointerEvents:'none' }}/>
          <div style={{ position:'relative' }}>
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200, delay:0.2 }}
              style={{ width:72, height:72, borderRadius:20, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:32 }}>
              👋
            </motion.div>
            <h1 style={{ fontSize:30, fontWeight:800, color:'white', letterSpacing:'-0.03em', marginBottom:10 }}>
              Welcome to SpendWise, {firstName}!
            </h1>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:15, lineHeight:1.7, maxWidth:440, margin:'0 auto 24px' }}>
              Let's set up your personalized financial dashboard in just a few steps. It takes less than 2 minutes.
            </p>

            {/* Progress bar */}
            <div style={{ maxWidth:360, margin:'0 auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>Profile Setup</span>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:700 }}>{progress}%</span>
              </div>
              <div style={{ height:6, background:'rgba(255,255,255,0.1)', borderRadius:99, overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ duration:0.6, ease:'easeOut' }}
                  style={{ height:'100%', background:'linear-gradient(90deg,#6366F1,#10B981)', borderRadius:99 }}/>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step pills */}
      <motion.div variants={fade(0.05)}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {STEPS.map(s => {
            const done    = completedSteps.includes(s.id)
            const current = step === s.id
            return (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:99, fontSize:12, fontWeight:600, transition:'all 0.2s',
                background: done ? '#ECFDF5' : current ? s.color : '#F9FAFB',
                color:      done ? '#059669'  : current ? 'white'  : '#9CA3AF',
                border:     `1px solid ${done?'#A7F3D0':current?s.color:'#E5E7EB'}` }}>
                {done ? <Check size={13}/> : s.icon}
                {s.label}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Step cards ── */}
      <AnimatePresence mode="wait">

        {/* Step 0: Start prompt */}
        {step===0 && (
          <motion.div key="s0" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
            <div style={{ background:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:20, padding:'36px 40px', textAlign:'center', boxShadow:'0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:28, flexWrap:'wrap' }}>
                {[{ icon:'💰', label:'Track spending' },{ icon:'🎯', label:'Hit your goals' },{ icon:'📊', label:'Understand money' },{ icon:'❤️', label:'Give back' }].map((f,i)=>(
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 18px', borderRadius:14, background:'#F9FAFB', border:'1px solid #E5E7EB', minWidth:100 }}>
                    <span style={{ fontSize:26 }}>{f.icon}</span>
                    <span style={{ fontSize:12, color:'#6B7280', fontWeight:600 }}>{f.label}</span>
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={() => setStep(1)} className="btn-primary" style={{ fontSize:15, padding:'13px 36px', gap:10 }}>
                <Sparkles size={17}/> Let's get started
              </motion.button>
              <p style={{ marginTop:14, color:'#9CA3AF', fontSize:12 }}>You can skip any step and fill in details later</p>
            </div>
          </motion.div>
        )}

        {/* Step 1: Income */}
        {step===1 && (
          <motion.div key="s1" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
            <StepCard icon={<DollarSign size={24}/>} color="#4F46E5" step="1 of 5" title="What's your monthly income?" desc="This helps us calculate your savings rate and set realistic budgets." onSkip={() => { markDone(1); setStep(2) }}>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Monthly Income (₹)</label>
                <input type="number" value={income} onChange={e=>setIncome(e.target.value)} placeholder="e.g. 30000" className="input" style={{ fontSize:16, fontWeight:600 }} onKeyDown={e=>e.key==='Enter'&&handleIncome()}/>
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
                {['20000','30000','50000','75000','100000'].map(v=>(
                  <button key={v} onClick={()=>setIncome(v)}
                    style={{ padding:'7px 14px', borderRadius:99, fontSize:13, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                      background:income===v?'#4F46E5':'#FFFFFF', color:income===v?'white':'#374151', borderColor:income===v?'#4F46E5':'#D1D5DB' }}>
                    ₹{parseInt(v).toLocaleString()}
                  </button>
                ))}
              </div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={handleIncome}
                className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'13px' }} disabled={!income}>
                Save Income <ArrowRight size={16}/>
              </motion.button>
            </StepCard>
          </motion.div>
        )}

        {/* Step 2: Expense */}
        {step===2 && (
          <motion.div key="s2" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
            <StepCard icon={<ShoppingBag size={24}/>} color="#DC2626" step="2 of 5" title="Add your first transaction" desc="Start tracking where your money goes. Enter any recent purchase." onSkip={() => { markDone(2); setStep(3) }}>
              <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Merchant / Where did you spend?</label>
                  <input value={expense.merchant} onChange={e=>setExpense(p=>({...p,merchant:e.target.value,category:aiCat(e.target.value)}))}
                    placeholder="e.g. Swiggy, Amazon, BigBasket" className="input"/>
                  {expense.merchant && <p style={{ fontSize:12, color:'#4F46E5', fontWeight:600, marginTop:6 }}>AI detected: {aiCat(expense.merchant)} category</p>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Amount (₹)</label>
                    <input type="number" value={expense.amount} onChange={e=>setExpense(p=>({...p,amount:e.target.value}))} placeholder="0" className="input"/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Category</label>
                    <select value={expense.category} onChange={e=>setExpense(p=>({...p,category:e.target.value}))} className="input">
                      {Object.keys(CATEGORIES).map(c=><option key={c} value={c}>{CATEGORIES[c].icon} {c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <motion.button whileHover={{ scale:1.02 }} onClick={handleExpense}
                className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'13px' }} disabled={!expense.merchant||!expense.amount}>
                Log Transaction <ArrowRight size={16}/>
              </motion.button>
            </StepCard>
          </motion.div>
        )}

        {/* Step 3: Budget */}
        {step===3 && (
          <motion.div key="s3" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
            <StepCard icon={<PieChart size={24}/>} color="#D97706" step="3 of 5" title="Set your first budget" desc="Budgets keep your spending in check. Start with one category you want to track." onSkip={() => { markDone(3); setStep(4) }}>
              <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Category</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                    {['Food','Grocery','Shopping','Travel','Entertainment','Healthcare'].map(c=>(
                      <button key={c} onClick={()=>setBudget(p=>({...p,category:c}))}
                        style={{ padding:'10px 8px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'all 0.15s', textAlign:'center',
                          background:budget.category===c?'#FEF3C7':'#FFFFFF', color:budget.category===c?'#92400E':'#374151', borderColor:budget.category===c?'#F59E0B':'#E5E7EB' }}>
                        {CATEGORIES[c]?.icon} {c}
                      </button>
                    ))}
                  </div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Monthly Limit (₹)</label>
                  <input type="number" value={budget.limit} onChange={e=>setBudget(p=>({...p,limit:e.target.value}))} placeholder="e.g. 5000" className="input"/>
                </div>
              </div>
              <motion.button whileHover={{ scale:1.02 }} onClick={handleBudget}
                className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'13px' }} disabled={!budget.limit}>
                Create Budget <ArrowRight size={16}/>
              </motion.button>
            </StepCard>
          </motion.div>
        )}

        {/* Step 4: Goal */}
        {step===4 && (
          <motion.div key="s4" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
            <StepCard icon={<Target size={24}/>} color="#059669" step="4 of 5" title="What are you saving for?" desc="Set a goal that motivates you. Your dashboard will track your progress daily." onSkip={() => { markDone(4); setStep(5) }}>
              <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Goal Name</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                    {['Emergency Fund','Buy iPhone','Goa Vacation','New Laptop','Home Down Payment'].map(g=>(
                      <button key={g} onClick={()=>setGoal(p=>({...p,name:g}))}
                        style={{ padding:'7px 14px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                          background:goal.name===g?'#ECFDF5':'#FFFFFF', color:goal.name===g?'#059669':'#374151', borderColor:goal.name===g?'#10B981':'#D1D5DB' }}>
                        {g}
                      </button>
                    ))}
                  </div>
                  <input value={goal.name} onChange={e=>setGoal(p=>({...p,name:e.target.value}))} placeholder="Or type your own goal…" className="input"/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Target Amount (₹)</label>
                    <input type="number" value={goal.targetAmount} onChange={e=>setGoal(p=>({...p,targetAmount:e.target.value}))} placeholder="e.g. 50000" className="input"/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:8 }}>Monthly Savings (₹)</label>
                    <input type="number" value={goal.monthlyContribution} onChange={e=>setGoal(p=>({...p,monthlyContribution:e.target.value}))} placeholder="e.g. 5000" className="input"/>
                  </div>
                </div>
              </div>
              <motion.button whileHover={{ scale:1.02 }} onClick={handleGoal}
                className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'13px' }} disabled={!goal.name||!goal.targetAmount}>
                Set Goal <ArrowRight size={16}/>
              </motion.button>
            </StepCard>
          </motion.div>
        )}

        {/* Step 5: Saving style */}
        {step===5 && (
          <motion.div key="s5" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
            <StepCard icon={<Smile size={24}/>} color="#7C3AED" step="5 of 5" title="What's your saving style?" desc="This helps us personalise your insights and coaching tips.">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:8 }}>
                {[
                  { id:'careful',  label:'Careful Saver',    icon:'💰', desc:'I save first, spend later' },
                  { id:'balanced', label:'Balanced',          icon:'⚖️', desc:'I balance saving & enjoying' },
                  { id:'spender',  label:'Enjoy Life',        icon:'🎉', desc:'I spend more, save what\'s left' },
                ].map(s=>(
                  <motion.button key={s.id} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                    onClick={() => handleStyle(s.id)}
                    style={{ padding:'20px 14px', borderRadius:14, fontSize:13, fontWeight:600, cursor:'pointer', border:'2px solid', textAlign:'center', transition:'all 0.2s',
                      background:savingStyle===s.id?'#F3F0FF':'#FFFFFF', color:savingStyle===s.id?'#4F46E5':'#374151', borderColor:savingStyle===s.id?'#4F46E5':'#E5E7EB',
                      display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:28 }}>{s.icon}</span>
                    <div>
                      <p style={{ fontWeight:700, marginBottom:4 }}>{s.label}</p>
                      <p style={{ fontSize:11, color:'#9CA3AF', fontWeight:400, lineHeight:1.4 }}>{s.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </StepCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip all */}
      {step > 0 && step < 5 && (
        <motion.div variants={fade(0.2)} style={{ textAlign:'center' }}>
          <button onClick={onComplete} style={{ background:'none', border:'none', color:'#9CA3AF', fontSize:13, cursor:'pointer', textDecoration:'underline' }}>
            Skip setup and go straight to dashboard
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ── Reusable step card ── */
function StepCard({ icon, color, step, title, desc, children, onSkip }) {
  return (
    <div style={{ background:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.06)' }}>
      <div style={{ padding:'20px 28px', borderBottom:'1px solid #F3F4F6', background:'#FAFAFA', display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexShrink:0, boxShadow:`0 4px 14px ${color}40` }}>
          {icon}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:11, color:'#9CA3AF', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Step {step}</p>
          <p style={{ fontSize:17, fontWeight:700, color:'#111827', letterSpacing:'-0.01em' }}>{title}</p>
        </div>
        {onSkip && (
          <button onClick={onSkip} style={{ background:'none', border:'none', color:'#9CA3AF', fontSize:13, cursor:'pointer', fontWeight:500 }}>Skip</button>
        )}
      </div>
      <div style={{ padding:'24px 28px' }}>
        <p style={{ color:'#6B7280', fontSize:14, lineHeight:1.6, marginBottom:20 }}>{desc}</p>
        {children}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   LEVEL BADGES  (shown in full dashboard)
══════════════════════════════════════════════════════ */
function LevelBadge({ level }) {
  const levels = [
    null,
    { label:'Starter',    color:'#6B7280', bg:'#F9FAFB', border:'#E5E7EB' },
    { label:'Tracker',    color:'#D97706', bg:'#FFFBEB', border:'#FDE68A' },
    { label:'Planner',    color:'#2563EB', bg:'#EFF6FF', border:'#BFDBFE' },
    { label:'Achiever',   color:'#059669', bg:'#ECFDF5', border:'#A7F3D0' },
  ]
  const l = levels[level]
  if (!l) return null
  return (
    <span style={{ padding:'4px 12px', borderRadius:99, fontSize:11, fontWeight:700, background:l.bg, color:l.color, border:`1px solid ${l.border}`, letterSpacing:'0.04em' }}>
      Level {level} · {l.label}
    </span>
  )
}

/* ══════════════════════════════════════════════════════
   EMPTY STATE CARD
══════════════════════════════════════════════════════ */
function EmptyCard({ icon, title, desc, action, to, color='#4F46E5', bg='#EEF2FF' }) {
  return (
    <div style={{ background:'#FFFFFF', border:'2px dashed #E5E7EB', borderRadius:16, padding:'28px 24px', textAlign:'center' }}>
      <div style={{ width:48, height:48, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
        {React.cloneElement(icon, { size:24, color, strokeWidth:1.5 })}
      </div>
      <p style={{ fontSize:15, fontWeight:700, color:'#374151', marginBottom:6 }}>{title}</p>
      <p style={{ fontSize:13, color:'#9CA3AF', marginBottom:16, lineHeight:1.6 }}>{desc}</p>
      <Link to={to} style={{ textDecoration:'none' }}>
        <button className="btn-primary" style={{ fontSize:13, padding:'9px 20px', gap:7 }}>
          <Plus size={14}/> {action}
        </button>
      </Link>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   FULL ADAPTIVE DASHBOARD
══════════════════════════════════════════════════════ */
function FullDashboard({ firstName, expenses, budgets, goals, profile, aiInsights, monthlySpending, walletBalance, totalDonated }) {
  const now        = new Date()
  const income     = profile?.monthlyIncome || 0   // user sets this — no default
  const thisMonth  = expenses.filter(e => {
    try { const d=new Date(e.date); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear() } catch { return false }
  })
  const spent      = thisMonth.reduce((s,e)=>s+e.amount,0)
  const saved      = Math.max(0,income-spent)
  const saveRate   = income>0?Math.round((saved/income)*100):0
  const spentPct   = income>0?Math.min(Math.round((spent/income)*100),100):0
  const violations = budgets.filter(b=>b.spent>b.limit)
  const mood       = getMood(spentPct, violations.length)
  const personality= getPersonality(budgets, goals)
  const insight    = getInsight(saved, goals, spentPct, firstName)
  const healthScore= profile?.financialHealthScore || 0   // starts at 0 until user has data

  const catBreakdown = Object.entries(
    thisMonth.reduce((acc,e)=>{ acc[e.category]=(acc[e.category]||0)+e.amount; return acc },{})
  ).sort((a,b)=>b[1]-a[1])

  const topCat         = catBreakdown[0]
  const biggestPurchase= thisMonth.length>0?thisMonth.reduce((a,b)=>a.amount>b.amount?a:b):null
  const monthsLeft     = 12-(now.getMonth())
  const projSavings    = saved*monthsLeft

  const healthData = [
    { metric:'Saving',    value: Math.min(saveRate,100) },
    { metric:'Budgets',   value: budgets.length>0?Math.round((budgets.filter(b=>b.spent<=b.limit).length/budgets.length)*100):50 },
    { metric:'Goals',     value: goals.length>0?Math.round((goals.filter(g=>g.currentAmount>=g.targetAmount).length/goals.length)*100):50 },
    { metric:'Control',   value: Math.max(0,100-spentPct) },
    { metric:'Habit',     value: Math.min(expenses.length*4,100) },
  ]

  /* Adaptive level */
  const level = goals.length>0&&budgets.length>0&&monthlySpending.length>2?4:
                goals.length>0&&budgets.length>0?3:
                budgets.length>0?2:1

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:28, maxWidth:960, margin:'0 auto' }}>

      {/* HERO */}
      <motion.div variants={fade(0)}>
        <div style={{ borderRadius:24, padding:'36px 40px', background:'linear-gradient(135deg,#0F0C29 0%,#302B63 50%,#24243E 100%)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(99,102,241,0.18)', filter:'blur(60px)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-60, left:-40, width:260, height:260, borderRadius:'50%', background:'rgba(16,185,129,0.12)', filter:'blur(50px)', pointerEvents:'none' }}/>
          <div style={{ position:'relative', display:'flex', flexWrap:'wrap', gap:32, alignItems:'center' }}>
            <div style={{ flex:1, minWidth:260 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, fontWeight:500 }}>
                  {new Date().getHours()<12?'Good morning':new Date().getHours()<17?'Good afternoon':'Good evening'}
                </p>
                <LevelBadge level={level}/>
              </div>
              <h1 style={{ fontSize:34, fontWeight:800, color:'#FFFFFF', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:14 }}>{firstName} 👋</h1>
              <div style={{ display:'inline-block', padding:'10px 18px', borderRadius:99, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)', marginBottom:22 }}>
                <p style={{ color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:500, lineHeight:1.4 }}>{insight}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:99, background:mood.bg, border:`1px solid ${mood.border}` }}>
                  <motion.div animate={{ scale:[1,1.4,1] }} transition={{ duration:2, repeat:Infinity }}
                    style={{ width:8, height:8, borderRadius:'50%', background:mood.dot }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:mood.color }}>{mood.label}</span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
              <ResponsiveContainer width={190} height={170}>
                <RadarChart data={healthData} margin={{ top:10, right:20, bottom:10, left:20 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" radialLines={false}/>
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize:10, fill:'rgba(255,255,255,0.45)', fontWeight:600 }}/>
                  <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} dot={{ fill:'#6366F1', r:3 }}/>
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ textAlign:'center', marginTop:-10 }}>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>Health Score</p>
                <p style={{ fontSize:28, fontWeight:800, color:'white', lineHeight:1.1 }}>{Math.round(healthScore)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MONEY STORY */}
      <motion.div variants={fade(0.05)}>
        <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>My Money Story — {now.toLocaleDateString('en-IN',{month:'long'})}</p>
        <div style={{ background:'#FFFFFF', borderRadius:20, border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {[
              { label:'Income', value:`₹${income.toLocaleString()}`, sub:'Estimated monthly', color:'#374151', bar:'#E5E7EB' },
              { label:'Spent',  value:`₹${spent.toLocaleString()}`,  sub:`${spentPct}% used`, color:'#DC2626', bar:'#EF4444' },
              { label:'Saved',  value:`₹${saved.toLocaleString()}`,  sub:'Kept safe',         color:'#059669', bar:'#10B981' },
              { label:'Rate',   value:`${saveRate}%`,                sub:'Saving rate',       color:saveRate>=50?'#4F46E5':saveRate>=20?'#D97706':'#DC2626', bar:saveRate>=50?'#4F46E5':saveRate>=20?'#F59E0B':'#EF4444' },
            ].map((s,i)=>(
              <div key={i} style={{ padding:'22px 20px', borderLeft:i>0?'1px solid #F3F4F6':'none', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.bar }}/>
                <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>{s.label}</p>
                <motion.p initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.07 }}
                  style={{ fontSize:20, fontWeight:800, color:s.color, letterSpacing:'-0.02em', lineHeight:1, marginBottom:5 }}>{s.value}</motion.p>
                <p style={{ fontSize:11, color:'#9CA3AF' }}>{s.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ padding:'14px 20px', borderTop:'1px solid #F3F4F6', background:'#FAFAFA' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:12, color:'#9CA3AF', fontWeight:600, whiteSpace:'nowrap' }}>Spending pace</span>
              <div style={{ flex:1, height:6, background:'#F3F4F6', borderRadius:99, overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${spentPct}%` }} transition={{ duration:1.5, ease:'easeOut', delay:0.4 }}
                  style={{ height:'100%', background:spentPct>80?'#EF4444':spentPct>60?'#F59E0B':'#10B981', borderRadius:99 }}/>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:'#374151', whiteSpace:'nowrap' }}>{spentPct}% used</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* COACH */}
      {aiInsights.length>0 && (
        <motion.div variants={fade(0.08)}>
          <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Today's Financial Coach</p>
          <div style={{ background:'linear-gradient(135deg,#FAFAFA,#F5F3FF)', borderRadius:20, border:'1px solid #E5E7EB', padding:'28px 32px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-30, right:-30, width:160, height:160, borderRadius:'50%', background:'rgba(99,102,241,0.06)', pointerEvents:'none' }}/>
            <div style={{ display:'flex', gap:18, alignItems:'flex-start', flexWrap:'wrap', position:'relative' }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 8px 24px rgba(79,70,229,0.35)' }}>
                <Zap size={22} color="white" strokeWidth={2.5}/>
              </div>
              <div style={{ flex:1, minWidth:200 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#6366F1', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Personalised for {firstName}</p>
                <p style={{ fontSize:16, fontWeight:600, color:'#111827', lineHeight:1.6, marginBottom:14 }}>{aiInsights[0].message}</p>
                {aiInsights[0].saving>0 && (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:99, background:'#ECFDF5', border:'1px solid #A7F3D0' }}>
                    <TrendingUp size={14} color="#059669" strokeWidth={2.5}/>
                    <span style={{ fontSize:13, fontWeight:700, color:'#059669' }}>Save ₹{aiInsights[0].saving.toLocaleString()} more each month</span>
                  </div>
                )}
              </div>
              <Link to="/ai-coach" style={{ textDecoration:'none', flexShrink:0 }}>
                <button className="btn-secondary" style={{ fontSize:13 }}>More advice <ArrowRight size={14}/></button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* GOALS */}
      <motion.div variants={fade(0.1)}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em' }}>My Goals</p>
          <Link to="/goals" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:4, fontSize:13, color:'#4F46E5', fontWeight:600 }}>View all <ChevronRight size={14}/></Link>
        </div>
        {goals.length===0 ? (
          <EmptyCard icon={<Target/>} color="#059669" bg="#ECFDF5" title="No savings goals yet" desc="Set a goal like 'Buy iPhone' or 'Emergency Fund' and track your progress every day." action="Create First Goal" to="/goals"/>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {goals.slice(0,3).map((goal,i)=>{
              const pct = calcPercentage(goal.currentAmount, goal.targetAmount)
              const rem = goal.targetAmount-goal.currentAmount
              const mos = goal.monthlyContribution>0?Math.ceil(rem/goal.monthlyContribution):null
              const eta = mos?new Date(new Date().getFullYear(),new Date().getMonth()+mos,1).toLocaleDateString('en-IN',{month:'long',year:'numeric'}):null
              const c   = goal.color||'#4F46E5'
              return (
                <motion.div key={goal._id} whileHover={{ y:-3, boxShadow:'0 12px 40px rgba(0,0,0,0.1)' }}
                  style={{ background:'#FFFFFF', borderRadius:18, border:'1px solid #E5E7EB', padding:22, transition:'all 0.2s', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:c }}/>
                  <div style={{ marginBottom:14 }}>
                    <p style={{ fontSize:16, fontWeight:700, color:'#111827', letterSpacing:'-0.01em', marginBottom:3 }}>{goal.name}</p>
                    <p style={{ fontSize:12, color:'#9CA3AF' }}>₹{goal.currentAmount.toLocaleString()} of ₹{goal.targetAmount.toLocaleString()}</p>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontSize:22, fontWeight:800, color:c, letterSpacing:'-0.02em' }}>{pct}%</span>
                      {eta && <span style={{ fontSize:12, color:'#9CA3AF', display:'flex', alignItems:'center', gap:4 }}><Calendar size={12}/>{eta}</span>}
                    </div>
                    <div style={{ height:8, background:'#F3F4F6', borderRadius:99, overflow:'hidden' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1.2, ease:'easeOut', delay:0.1+i*0.1 }}
                        style={{ height:'100%', background:`linear-gradient(90deg,${c}CC,${c})`, borderRadius:99 }}/>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                      {[25,50,75,100].map(m=>(
                        <div key={m} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                          <div style={{ width:4, height:4, borderRadius:'50%', background:pct>=m?c:'#E5E7EB', transition:'background 0.4s' }}/>
                          <span style={{ fontSize:9, color:pct>=m?c:'#D1D5DB', fontWeight:600 }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:'#6B7280' }}>₹{rem.toLocaleString()} remaining{mos?` · ${mos} months`:''}</p>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* BUDGETS + PERSONALITY */}
      <motion.div variants={fade(0.12)} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        {/* Budget status */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em' }}>Budget Status</p>
            <Link to="/budgets" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:4, fontSize:13, color:'#4F46E5', fontWeight:600 }}>Manage <ChevronRight size={14}/></Link>
          </div>
          {budgets.length===0 ? (
            <EmptyCard icon={<PieChart/>} color="#D97706" bg="#FFFBEB" title="No budgets set" desc="Create category budgets to track and control your monthly spending." action="Create Budget" to="/budgets"/>
          ) : (
            <div style={{ background:'#FFFFFF', borderRadius:18, border:'1px solid #E5E7EB', padding:'20px', display:'flex', flexDirection:'column', gap:14 }}>
              {budgets.slice(0,4).map(b=>{
                const pct=calcPercentage(b.spent,b.limit), over=b.spent>b.limit
                const clr=over?'#EF4444':pct>80?'#F59E0B':'#4F46E5'
                return (
                  <div key={b._id}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{b.category}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:clr }}>{over?`₹${(b.spent-b.limit).toLocaleString()} over`:`${pct}%`}</span>
                    </div>
                    <div style={{ height:6, background:'#F3F4F6', borderRadius:99, overflow:'hidden' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(pct,100)}%` }} transition={{ duration:0.8 }}
                        style={{ height:'100%', background:clr, borderRadius:99 }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Spending personality */}
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Spending Personality</p>
          <div style={{ background:'#FFFFFF', borderRadius:18, border:'1px solid #E5E7EB', padding:'20px 22px', height:'calc(100% - 34px)', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:52, height:52, borderRadius:14, background:personality.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:24 }}>
                {personality.icon}
              </div>
              <div>
                <p style={{ fontSize:18, fontWeight:800, color:personality.color, letterSpacing:'-0.02em', marginBottom:6 }}>{personality.label}</p>
                <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.6 }}>{personality.desc}</p>
              </div>
            </div>
            {(topCat||biggestPurchase) && (
              <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid #F3F4F6', display:'flex', flexDirection:'column', gap:8 }}>
                {topCat && (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'#9CA3AF' }}>Top category</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{topCat[0]} — ₹{topCat[1].toLocaleString()}</span>
                  </div>
                )}
                {biggestPurchase && (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'#9CA3AF' }}>Largest purchase</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>₹{biggestPurchase.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* FORECAST */}
      {level>=3 && (
        <motion.div variants={fade(0.14)}>
          <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>What's Coming Next</p>
          <div style={{ background:'linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E1B4B 100%)', borderRadius:20, padding:'28px 32px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:'rgba(165,180,252,0.08)', pointerEvents:'none' }}/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:20, position:'relative' }}>
              {[
                { label:'Projected Year-End Savings', value:`₹${(projSavings/100000).toFixed(1)}L`, sub:'At current pace', color:'#A5F3FC' },
                { label:'Financial Health Forecast',  value:`${Math.min(Math.round(healthScore)+5,100)}/100`, sub:'Improving trend', color:'#86EFAC' },
                { label:'Budget Risk Level',          value:violations.length>0?'Moderate':'Low', sub:violations.length>0?`${violations.length} over limit`:'All on track', color:violations.length>0?'#FCA5A5':'#86EFAC' },
              ].map((s,i)=>(
                <div key={i}>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:600, marginBottom:8, lineHeight:1.4 }}>{s.label}</p>
                  <p style={{ fontSize:22, fontWeight:800, color:s.color, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>{s.value}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TREND CHART */}
      {monthlySpending.length>1 && (
        <motion.div variants={fade(0.16)}>
          <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Spending Trend</p>
          <div style={{ background:'#FFFFFF', borderRadius:18, border:'1px solid #E5E7EB', padding:'24px 26px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlySpending} margin={{ top:4, right:4, bottom:0, left:0 }}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.12}/><stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.12}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:12, fill:'#9CA3AF' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:12, fill:'#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}K`}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="spending" name="Spending" stroke="#4F46E5" strokeWidth={2} fill="url(#sg)" dot={false} activeDot={{ r:4, fill:'#4F46E5' }}/>
                <Area type="monotone" dataKey="savings"  name="Savings"  stroke="#10B981" strokeWidth={2} fill="url(#ag)"  dot={false} activeDot={{ r:4, fill:'#10B981' }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* RECENT ACTIVITY */}
      {expenses.length>0 && (
        <motion.div variants={fade(0.18)}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em' }}>Recent Activity</p>
            <Link to="/expenses" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:4, fontSize:13, color:'#4F46E5', fontWeight:600 }}>All transactions <ChevronRight size={14}/></Link>
          </div>
          <div style={{ background:'#FFFFFF', borderRadius:18, border:'1px solid #E5E7EB', overflow:'hidden' }}>
            {expenses.slice(0,5).map((exp,i)=>{
              const cat=getCategoryInfo(exp.category)
              return (
                <div key={exp._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:i<Math.min(expenses.length-1,4)?'1px solid #F9FAFB':'none', transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#FAFAFA'}
                  onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <div style={{ width:40, height:40, borderRadius:12, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{cat.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{exp.merchant}</p>
                    <p style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>{exp.category} · {formatDate(exp.date)}</p>
                  </div>
                  <p style={{ fontSize:15, fontWeight:700, color:'#111827', flexShrink:0 }}>-₹{exp.amount.toLocaleString()}</p>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT — decides which experience to show
══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth()
  const data     = useUserData()
  const { profile, expenses, budgets, goals, aiInsights, monthlySpending, walletBalance, totalDonated, updateProfile } = data

  const firstName = (user?.name || profile?.name || 'Friend').split(' ')[0]
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  /* has the user completed onboarding or has enough data? */
  const hasData    = expenses.length>0 || budgets.length>0 || goals.length>0 || (profile?.monthlyIncome && profile.monthlyIncome>0)
  const isOnboarded= profile?.onboardingDone === true

  const [showFull, setShowFull] = useState(hasData || isOnboarded)

  useEffect(() => {
    if (hasData || isOnboarded) setShowFull(true)
  }, [hasData, isOnboarded])

  const handleOnboardingComplete = () => {
    updateProfile({ onboardingDone: true })
    setShowFull(true)
  }

  return showFull ? (
    <>
      <FullDashboard
        firstName={firstName}
        expenses={expenses}
        budgets={budgets}
        goals={goals}
        profile={profile}
        aiInsights={aiInsights}
        monthlySpending={monthlySpending}
        walletBalance={walletBalance}
        totalDonated={totalDonated}
      />
      {/* Floating "Should I Buy?" button */}
      <motion.button
        whileHover={{ scale:1.06, y:-2 }}
        whileTap={{ scale:0.95 }}
        onClick={() => setShowPurchaseModal(true)}
        style={{
          position:'fixed', bottom:24, right:24, zIndex:90,
          display:'flex', alignItems:'center', gap:8,
          padding:'12px 20px', borderRadius:99,
          background:'linear-gradient(135deg,#7C5CFC,#9B7BFF)',
          color:'white', fontWeight:700, fontSize:'0.875rem',
          border:'none', cursor:'pointer',
          boxShadow:'0 8px 28px rgba(124,92,252,0.45)',
          fontFamily:'Inter, sans-serif',
        }}>
        <ShoppingCart size={16}/>
        Should I Buy?
      </motion.button>
      <PurchaseImpactModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)}/>
    </>
  ) : (
    <OnboardingDashboard
      firstName={firstName}
      profile={profile}
      onComplete={handleOnboardingComplete}
    />
  )
}
