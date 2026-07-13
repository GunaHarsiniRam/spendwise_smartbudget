import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Plus, Zap, Target, TrendingDown, AlertTriangle, CheckCircle, BookOpen, Coffee, Home } from 'lucide-react'
import { useUserData } from '../context/UserDataContext'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'

const stag = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.07 } } }
const it   = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ duration:0.25 } } }

const CHALLENGES = [
  { id:'no_swiggy',    title:'No Swiggy Week',       desc:'No food delivery for 7 days',         reward:'Save ₹600+',  icon:'🍕', days:7 },
  { id:'save_100',     title:'Save ₹100 Daily',       desc:'Save ₹100 every day this week',       reward:'₹700 saved',  icon:'💰', days:7 },
  { id:'no_shopping',  title:'No Shopping Weekend',   desc:'Zero shopping purchases this weekend', reward:'Save ₹500+',  icon:'🛍️', days:2 },
  { id:'monthly_save', title:'Monthly Savings Goal',  desc:'Save 20% of your allowance',          reward:'Habit built', icon:'📈', days:30 },
]

export default function StudentMode() {
  const { user }   = useAuth()
  const { profile, expenses, updateStudentProfile, studentProfile } = useUserData()
  const [showSetup, setShowSetup] = useState(!studentProfile?.allowance)
  const [form, setForm] = useState({
    allowance:     studentProfile?.allowance     || '',
    semester:      studentProfile?.semester      || '',
    institution:   studentProfile?.institution   || '',
    hostelRent:    studentProfile?.hostelRent    || '',
    semesterEnd:   studentProfile?.semesterEnd   || '',
  })
  const [activeChallenge, setActiveChallenge] = useState(studentProfile?.activeChallenge || null)

  const firstName = (user?.name || profile?.name || 'Student').split(' ')[0]

  const handleSave = () => {
    updateStudentProfile({ ...form, allowance: parseFloat(form.allowance)||0, hostelRent: parseFloat(form.hostelRent)||0, activeChallenge })
    setShowSetup(false)
  }

  const allowance  = parseFloat(studentProfile?.allowance || form.allowance) || 0
  const hostelRent = parseFloat(studentProfile?.hostelRent || form.hostelRent) || 0

  // This month expenses
  const now = new Date()
  const thisMonthExp = expenses.filter(e => {
    try { const d=new Date(e.date); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear() } catch { return false }
  })
  const totalSpent   = thisMonthExp.reduce((s,e)=>s+e.amount, 0)
  const remaining    = Math.max(0, allowance - totalSpent)
  const burnRate     = allowance > 0 ? Math.round((totalSpent/allowance)*100) : 0
  const daysInMonth  = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
  const daysLeft     = daysInMonth - now.getDate()
  const dailyBurn    = now.getDate() > 0 ? totalSpent / now.getDate() : 0
  const projectedEnd = dailyBurn > 0 ? Math.floor(remaining / dailyBurn) : daysLeft
  const willRunOut   = projectedEnd < daysLeft

  // Category totals
  const catTotals = {}
  thisMonthExp.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0)+e.amount })
  const foodSpend  = catTotals['Food'] || 0
  const hostelTotal= catTotals['Bills'] || hostelRent

  // Insights
  const insights = []
  if (willRunOut && allowance > 0) {
    insights.push({ type:'danger', icon:'⚠️', text:`At your current spending rate, your allowance may run out ${daysLeft - projectedEnd} days before month-end.` })
  }
  const deliveryCount = thisMonthExp.filter(e => e.category==='Food' && e.amount > 150).length
  if (deliveryCount >= 3) {
    const potentialSave = Math.round(deliveryCount * 0.4 * 180)
    insights.push({ type:'info', icon:'🍕', text:`Reducing food delivery by 2 orders per week could save ₹${potentialSave} monthly.` })
  }
  if (burnRate > 70 && daysLeft > 15) {
    insights.push({ type:'warning', icon:'📊', text:`You've used ${burnRate}% of your allowance with ${daysLeft} days remaining. Slow down spending.` })
  }
  if (remaining > allowance * 0.4 && daysLeft < 10) {
    insights.push({ type:'success', icon:'🎉', text:`Great job! You have ₹${remaining.toLocaleString()} left with just ${daysLeft} days to go.` })
  }
  if (insights.length === 0) {
    insights.push({ type:'info', icon:'💡', text:`Set up your allowance and log daily expenses to get personalised student insights.` })
  }

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <motion.div variants={it} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#7C5CFC,#9B7BFF)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <GraduationCap size={19} color="white"/>
            </div>
            <h1 className="page-title" style={{ margin:0 }}>Student Mode</h1>
          </div>
          <p className="page-subtitle">Smart budgeting for college life, {firstName}</p>
        </div>
        <button onClick={() => setShowSetup(true)} className="btn-secondary" style={{ fontSize:'0.8125rem' }}>
          ⚙️ Update Profile
        </button>
      </motion.div>

      {/* Setup prompt if no allowance */}
      {!studentProfile?.allowance && (
        <motion.div variants={it} style={{ padding:'20px 22px', borderRadius:14, background:'var(--brand-light)', border:'1.5px solid #D8D0FF', display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
          <GraduationCap size={20} color="var(--brand)"/>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:700, color:'var(--brand-dark)', fontSize:'0.9375rem', marginBottom:4 }}>Set up your student profile</p>
            <p style={{ fontSize:'0.8125rem', color:'var(--text-2)' }}>Enter your monthly allowance and college details to unlock personalised student insights.</p>
          </div>
          <button onClick={() => setShowSetup(true)} className="btn-primary" style={{ fontSize:'0.875rem' }}>
            <Plus size={14}/> Set Up Now
          </button>
        </motion.div>
      )}

      {/* Allowance tracker card */}
      {allowance > 0 && (
        <motion.div variants={it}>
          <div style={{ borderRadius:20, padding:'26px 28px', background:'linear-gradient(135deg,#0D0B26 0%,#1A1040 50%,#0F2318 100%)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'rgba(124,92,252,0.18)', filter:'blur(50px)', pointerEvents:'none' }}/>
            <div style={{ position:'relative' }}>
              <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Monthly Allowance Tracker</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:14, marginBottom:20 }}>
                {[
                  { label:'Total Allowance',   value:`₹${allowance.toLocaleString()}`,         color:'#C084FC' },
                  { label:'Spent So Far',       value:`₹${totalSpent.toLocaleString()}`,        color:'#F87171' },
                  { label:'Remaining',          value:`₹${remaining.toLocaleString()}`,         color: remaining<allowance*0.2?'#F87171':'#34D399' },
                  { label:'Days Left',          value:`${daysLeft} days`,                       color: willRunOut?'#F87171':'#60A5FA' },
                ].map((s,i)=>(
                  <div key={i} style={{ padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize:'1.25rem', fontWeight:800, color:s.color, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>{s.value}</p>
                    <p style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                  <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', fontWeight:600 }}>Allowance used</span>
                  <span style={{ fontSize:'0.78rem', fontWeight:800, color: burnRate>80?'#F87171':burnRate>60?'#FFD93D':'#34D399' }}>{burnRate}%</span>
                </div>
                <div style={{ height:8, borderRadius:99, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(burnRate,100)}%` }} transition={{ duration:1.2, ease:'easeOut' }}
                    style={{ height:'100%', borderRadius:99, background: burnRate>80?'linear-gradient(90deg,#F87171,#EF4444)':burnRate>60?'linear-gradient(90deg,#FFD93D,#F59E0B)':'linear-gradient(90deg,#34D399,#10B981)' }}/>
                </div>
              </div>

              {/* Burn rate warning */}
              {willRunOut && (
                <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.3)' }}>
                  <p style={{ fontSize:'0.8125rem', color:'#FCA5A5', fontWeight:600 }}>
                    ⚠️ At ₹{Math.round(dailyBurn).toLocaleString()}/day burn rate, your allowance runs out in {projectedEnd} days — {daysLeft-projectedEnd} days short!
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Metric cards */}
      {allowance > 0 && (
        <motion.div variants={it} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
          {[
            { label:'Daily Burn Rate',     value:`₹${Math.round(dailyBurn).toLocaleString()}/day`,    icon:<TrendingDown size={17}/>, color:'#FF4757', bg:'#FFE8EA', border:'#FFCCD3' },
            { label:'Food Spending',       value:`₹${foodSpent(catTotals)}`,                          icon:<Coffee size={17}/>,       color:'#FF7043', bg:'#FFF3EF', border:'#FFD0B5' },
            { label:'Hostel/Rent',         value:`₹${hostelTotal.toLocaleString()}`,                  icon:<Home size={17}/>,         color:'#2196F3', bg:'#E3F2FD', border:'#BBDEFB' },
            { label:'Education Spend',     value:`₹${(catTotals['Education']||0).toLocaleString()}`,  icon:<BookOpen size={17}/>,     color:'#7C5CFC', bg:'var(--brand-light)', border:'#D8D0FF' },
          ].map((s,i)=>(
            <div key={i} className="stat-card" style={{ border:`1.5px solid ${s.border}`, background:s.bg }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <p style={{ fontSize:'0.78rem', color:'var(--text-3)', fontWeight:500 }}>{s.label}</p>
                <div style={{ width:30, height:30, borderRadius:8, background:'white', display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>
                  {s.icon}
                </div>
              </div>
              <p style={{ fontSize:'1.125rem', fontWeight:800, color:s.color, letterSpacing:'-0.01em' }}>{s.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* AI Student Insights */}
      <motion.div variants={it} className="card" style={{ padding:'20px 22px' }}>
        <h3 className="section-title" style={{ marginBottom:4 }}>Student Insights</h3>
        <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', marginBottom:16 }}>Personalised tips for your college budget</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {insights.map((ins,i)=>{
            const styles = {
              danger:  { bg:'#FEF2F2', border:'#FECACA', color:'#DC2626' },
              warning: { bg:'#FFFBEB', border:'#FDE68A', color:'#D97706' },
              success: { bg:'#ECFDF5', border:'#A7F3D0', color:'#059669' },
              info:    { bg:'var(--brand-light)', border:'#D8D0FF', color:'var(--brand-dark)' },
            }
            const s = styles[ins.type]||styles.info
            return (
              <div key={i} style={{ padding:'12px 16px', borderRadius:11, background:s.bg, border:`1.5px solid ${s.border}`, display:'flex', gap:10, alignItems:'flex-start' }}>
                <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{ins.icon}</span>
                <p style={{ fontSize:'0.8125rem', color:'var(--text-2)', lineHeight:1.6 }}>{ins.text}</p>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Student Challenges */}
      <motion.div variants={it}>
        <h3 className="section-title" style={{ marginBottom:4 }}>Savings Challenges</h3>
        <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', marginBottom:16 }}>Take on a challenge to build better habits</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
          {CHALLENGES.map(ch=>{
            const isActive = activeChallenge === ch.id
            return (
              <motion.div key={ch.id} whileHover={{ y:-3 }}
                style={{ background:'#FFFFFF', borderRadius:16, padding:18, border:`1.5px solid ${isActive?'var(--brand)':'var(--border)'}`, cursor:'pointer', transition:'all 0.2s', boxShadow:isActive?'var(--shadow-brand)':'var(--shadow-sm)' }}
                onClick={() => {
                  const next = isActive ? null : ch.id
                  setActiveChallenge(next)
                  updateStudentProfile({ activeChallenge: next })
                }}>
                <div style={{ fontSize:'1.75rem', marginBottom:10 }}>{ch.icon}</div>
                <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem', marginBottom:4 }}>{ch.title}</p>
                <p style={{ fontSize:'0.78rem', color:'var(--text-3)', marginBottom:10, lineHeight:1.5 }}>{ch.desc}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.75rem', fontWeight:700, color:'#059669', background:'#ECFDF5', padding:'3px 8px', borderRadius:99 }}>{ch.reward}</span>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{ch.days} days</span>
                </div>
                {isActive && (
                  <div style={{ marginTop:10, padding:'6px 10px', borderRadius:8, background:'var(--brand-light)', border:'1px solid #D8D0FF', display:'flex', alignItems:'center', gap:6 }}>
                    <CheckCircle size={13} color="var(--brand)"/>
                    <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--brand)' }}>Active Challenge</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Setup Modal */}
      <Modal isOpen={showSetup} onClose={() => setShowSetup(false)} title="🎓 Student Profile Setup">
        <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--brand-light)', border:'1px solid #D8D0FF', fontSize:'0.8125rem', color:'var(--brand-dark)', lineHeight:1.6 }}>
            Set up your student details to get personalised allowance tracking and college-specific insights.
          </div>
          <div>
            <label className="field-label">Institution / College Name</label>
            <input value={form.institution} onChange={e=>setForm(p=>({...p,institution:e.target.value}))} placeholder="e.g. IIT Madras, Anna University" className="input"/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label className="field-label">Monthly Allowance (₹)</label>
              <input type="number" value={form.allowance} onChange={e=>setForm(p=>({...p,allowance:e.target.value}))} placeholder="e.g. 8000" className="input"/>
            </div>
            <div>
              <label className="field-label">Hostel/Rent (₹)</label>
              <input type="number" value={form.hostelRent} onChange={e=>setForm(p=>({...p,hostelRent:e.target.value}))} placeholder="e.g. 3000" className="input"/>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label className="field-label">Semester</label>
              <select value={form.semester} onChange={e=>setForm(p=>({...p,semester:e.target.value}))} className="input">
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Semester End Date</label>
              <input type="date" value={form.semesterEnd} onChange={e=>setForm(p=>({...p,semesterEnd:e.target.value}))} className="input"/>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setShowSetup(false)} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
            <button onClick={handleSave} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>
              <GraduationCap size={15}/> Save Profile
            </button>
          </div>
        </div>
      </Modal>

    </motion.div>
  )
}

function foodSpent(catTotals) {
  return (catTotals['Food']||0).toLocaleString()
}
