import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, TrendingUp, TrendingDown, Target, Heart, Award, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { useUserData } from '../context/UserDataContext'
import { useAuth } from '../context/AuthContext'

const stag = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.08 } } }
const it   = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0, transition:{ duration:0.28 } } }

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

/* Generate a financial story for a given month's data */
function generateStory(monthIdx, year, expenses, budgets, goals, donations, profile) {
  const monthExpenses = expenses.filter(e => {
    try { const d=new Date(e.date); return d.getMonth()===monthIdx && d.getFullYear()===year }
    catch { return false }
  })
  if (monthExpenses.length === 0) return null

  const totalSpent = monthExpenses.reduce((s,e)=>s+e.amount, 0)
  const income     = profile?.monthlyIncome || 0
  const saved      = Math.max(0, income - totalSpent)
  const saveRate   = income > 0 ? Math.round((saved/income)*100) : 0

  // Category breakdown
  const catTotals = {}
  monthExpenses.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0) + e.amount })
  const topCat = Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0]

  // Budget violations
  const violations = budgets.filter(b => b.spent > b.limit)

  // Monthly donations
  const monthDonations = donations.filter(d => {
    try { const d2=new Date(d.date); return d2.getMonth()===monthIdx && d2.getFullYear()===year }
    catch { return false }
  })
  const donationTotal = monthDonations.reduce((s,d)=>s+d.amount, 0)

  // Goals progress
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount)

  // Overall rating
  const rating = saveRate >= 30 ? 'Excellent' : saveRate >= 20 ? 'Good' : saveRate >= 10 ? 'Average' : 'Needs Improvement'
  const ratingColor = saveRate >= 30 ? '#059669' : saveRate >= 20 ? '#2196F3' : saveRate >= 10 ? '#D97706' : '#DC2626'
  const ratingEmoji = saveRate >= 30 ? '🏆' : saveRate >= 20 ? '👍' : saveRate >= 10 ? '📈' : '⚠️'

  // Story chapters
  const chapters = []

  chapters.push({
    icon: <TrendingDown size={16}/>,
    color: '#FF4757',
    title: 'Spending',
    content: `You spent ₹${totalSpent.toLocaleString()} this month across ${monthExpenses.length} transactions.${topCat ? ` Your biggest category was ${topCat[0]} at ₹${topCat[1].toLocaleString()}.` : ''}`
  })

  if (income > 0) {
    chapters.push({
      icon: <TrendingUp size={16}/>,
      color: '#00C896',
      title: 'Savings',
      content: `You saved ₹${saved.toLocaleString()} — a savings rate of ${saveRate}%.${saveRate >= 20 ? ' Great discipline!' : saveRate >= 10 ? ' Room to improve — aim for 20%.' : ' Try to cut back on non-essentials.'}`
    })
  }

  if (violations.length > 0) {
    chapters.push({
      icon: <Zap size={16}/>,
      color: '#FFB300',
      title: 'Budget Alerts',
      content: `${violations.length} budget${violations.length>1?'s were':' was'} exceeded: ${violations.map(v=>v.category).join(', ')}. Accountability penalties were donated to charity automatically.`
    })
  } else if (budgets.length > 0) {
    chapters.push({
      icon: <Award size={16}/>,
      color: '#7C5CFC',
      title: 'Budget Discipline',
      content: `You stayed within all ${budgets.length} budget categories this month. Excellent financial discipline!`
    })
  }

  if (goals.length > 0) {
    const topGoal = goals.reduce((a,b) => ((b.currentAmount/b.targetAmount) > (a.currentAmount/a.targetAmount) ? b : a))
    const pct = Math.round((topGoal.currentAmount/topGoal.targetAmount)*100)
    chapters.push({
      icon: <Target size={16}/>,
      color: '#2196F3',
      title: 'Goals Progress',
      content: `Your top goal "${topGoal.name}" is ${pct}% complete.${completedGoals.length > 0 ? ` You completed ${completedGoals.length} goal${completedGoals.length>1?'s':''}!` : ` Keep contributing ₹${topGoal.monthlyContribution?.toLocaleString()||'more'}/month to reach it faster.`}`
    })
  }

  if (donationTotal > 0) {
    chapters.push({
      icon: <Heart size={16}/>,
      color: '#E91E63',
      title: 'Social Impact',
      content: `₹${donationTotal} was donated to charity this month through your accountability penalties. You made a real difference!`
    })
  }

  return {
    month:        MONTHS[monthIdx],
    monthIdx,
    year,
    totalSpent,
    saved,
    saveRate,
    income,
    txCount:      monthExpenses.length,
    topCategory:  topCat?.[0],
    violations:   violations.length,
    donationTotal,
    rating,
    ratingColor,
    ratingEmoji,
    chapters,
    monthKey:     `${year}-${monthIdx}`,
  }
}

export default function FinancialJourney() {
  const { user }   = useAuth()
  const { expenses, budgets, goals, donations, profile, monthlyStories, saveMonthlyStory } = useUserData()
  const [expandedMonth, setExpandedMonth] = useState(null)

  const firstName = (user?.name || profile?.name || 'You').split(' ')[0]
  const now = new Date()

  // Generate stories for all months that have data
  const stories = []
  for (let y = now.getFullYear(); y >= now.getFullYear() - 1; y--) {
    for (let m = 11; m >= 0; m--) {
      if (y === now.getFullYear() && m > now.getMonth()) continue
      const story = generateStory(m, y, expenses, budgets, goals, donations, profile)
      if (story) stories.push(story)
    }
  }

  const currentMonthStory = stories[0]

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <motion.div variants={it}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="page-title">Financial Journey</h1>
            <p className="page-subtitle">Your personalised money story, month by month</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:99, background:'var(--brand-light)', border:'1px solid #D8D0FF' }}>
            <BookOpen size={15} color="var(--brand)"/>
            <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--brand)' }}>{stories.length} chapter{stories.length!==1?'s':''}</span>
          </div>
        </div>
      </motion.div>

      {/* No data */}
      {stories.length === 0 && (
        <motion.div variants={it} style={{ background:'#FFFFFF', border:'2px dashed var(--border)', borderRadius:16, padding:'52px 32px', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:14 }}>📖</div>
          <h3 style={{ fontSize:'1.0625rem', fontWeight:700, color:'var(--text-1)', marginBottom:8 }}>Your story hasn't started yet</h3>
          <p style={{ color:'var(--text-3)', fontSize:'0.9rem', lineHeight:1.6, maxWidth:380, margin:'0 auto' }}>
            Start logging expenses to see your personalised monthly financial story here. Each month becomes a chapter in your financial journey.
          </p>
        </motion.div>
      )}

      {/* Current month highlight */}
      {currentMonthStory && (
        <motion.div variants={it}>
          <div style={{ borderRadius:20, padding:'28px 30px', background:'linear-gradient(135deg,#0D0B26 0%,#1A1040 50%,#0F2318 100%)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:'rgba(124,92,252,0.15)', filter:'blur(50px)', pointerEvents:'none' }}/>
            <div style={{ position:'relative' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:20 }}>
                <div>
                  <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
                    This Month · {currentMonthStory.month} {currentMonthStory.year}
                  </p>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'white', letterSpacing:'-0.02em', marginBottom:4 }}>
                    {firstName}'s Story {currentMonthStory.ratingEmoji}
                  </h2>
                  <span style={{ padding:'4px 12px', borderRadius:99, fontSize:'0.75rem', fontWeight:700, background:`${currentMonthStory.ratingColor}25`, color:currentMonthStory.ratingColor, border:`1px solid ${currentMonthStory.ratingColor}40` }}>
                    {currentMonthStory.rating}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
                  {[
                    { label:'Spent',      value:`₹${currentMonthStory.totalSpent.toLocaleString()}`, color:'#F87171' },
                    { label:'Saved',      value:`₹${currentMonthStory.saved.toLocaleString()}`,      color:'#34D399' },
                    { label:'Save Rate',  value:`${currentMonthStory.saveRate}%`,                   color:'#60A5FA' },
                    { label:'Transactions',value:currentMonthStory.txCount,                         color:'#C084FC' },
                  ].map((s,i)=>(
                    <div key={i} style={{ padding:'10px 14px', borderRadius:11, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', textAlign:'center' }}>
                      <p style={{ fontSize:'1.125rem', fontWeight:800, color:s.color, letterSpacing:'-0.01em', lineHeight:1 }}>{s.value}</p>
                      <p style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.4)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Story chapters */}
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {currentMonthStory.chapters.map((ch,i)=>(
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'12px 16px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width:30, height:30, borderRadius:9, background:`${ch.color}25`, border:`1px solid ${ch.color}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:ch.color }}>
                      {ch.icon}
                    </div>
                    <div>
                      <p style={{ fontSize:'0.78rem', fontWeight:700, color:ch.color, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.06em' }}>{ch.title}</p>
                      <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.7)', lineHeight:1.6 }}>{ch.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Past months timeline */}
      {stories.length > 1 && (
        <motion.div variants={it}>
          <h3 className="section-title" style={{ marginBottom:16 }}>Past Chapters</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {stories.slice(1).map((story, i) => (
              <motion.div key={story.monthKey} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                style={{ background:'#FFFFFF', borderRadius:16, border:'1.5px solid var(--border)', overflow:'hidden' }}>

                {/* Month header - always visible */}
                <button onClick={() => setExpandedMonth(expandedMonth===story.monthKey ? null : story.monthKey)}
                  style={{ width:'100%', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:'var(--surface)', border:'1.5px solid var(--border)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                      <p style={{ fontSize:'0.6rem', color:'var(--text-4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', lineHeight:1 }}>{story.month.slice(0,3)}</p>
                      <p style={{ fontSize:'0.875rem', fontWeight:800, color:'var(--text-1)', lineHeight:1.2 }}>{story.year}</p>
                    </div>
                    <div>
                      <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem', marginBottom:2 }}>{story.month} {story.year}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>₹{story.totalSpent.toLocaleString()} spent</span>
                        {story.saved > 0 && <span style={{ fontSize:'0.75rem', color:'#059669', fontWeight:600 }}>· ₹{story.saved.toLocaleString()} saved</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, background:`${story.ratingColor}15`, color:story.ratingColor }}>
                      {story.ratingEmoji} {story.rating}
                    </span>
                    {expandedMonth===story.monthKey ? <ChevronUp size={16} color="var(--text-3)"/> : <ChevronDown size={16} color="var(--text-3)"/>}
                  </div>
                </button>

                {/* Expanded chapters */}
                {expandedMonth === story.monthKey && (
                  <div style={{ padding:'0 20px 16px', borderTop:'1px solid var(--border)' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginTop:14, marginBottom:14 }}>
                      {[
                        { label:'Spent',       value:`₹${story.totalSpent.toLocaleString()}`, color:'#FF4757' },
                        { label:'Saved',       value:`₹${story.saved.toLocaleString()}`,      color:'#00C896' },
                        { label:'Save Rate',   value:`${story.saveRate}%`,                    color:'#7C5CFC' },
                        { label:'Transactions',value:story.txCount,                           color:'#FFB300' },
                      ].map((s,i)=>(
                        <div key={i} style={{ padding:'10px 12px', borderRadius:10, background:'var(--surface)', border:'1px solid var(--border)', textAlign:'center' }}>
                          <p style={{ fontSize:'1rem', fontWeight:800, color:s.color, letterSpacing:'-0.01em' }}>{s.value}</p>
                          <p style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:3 }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {story.chapters.map((ch,i)=>(
                        <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'10px 14px', borderRadius:10, background:'var(--surface)', border:'1px solid var(--border)' }}>
                          <span style={{ color:ch.color, flexShrink:0 }}>{ch.icon}</span>
                          <div>
                            <p style={{ fontSize:'0.72rem', fontWeight:700, color:ch.color, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{ch.title}</p>
                            <p style={{ fontSize:'0.8125rem', color:'var(--text-2)', lineHeight:1.6 }}>{ch.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

    </motion.div>
  )
}
