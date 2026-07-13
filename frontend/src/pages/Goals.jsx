import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit3, Target, Calendar, TrendingUp } from 'lucide-react'
import { format, addMonths } from 'date-fns'
import toast from 'react-hot-toast'
import Modal from '../components/ui/Modal'
import { useUserData } from '../context/UserDataContext'
import { calcPercentage, formatCurrency } from '../utils/helpers'

const COLORS = ['#7C5CFC','#00C896','#FFB300','#FF4757','#2196F3','#E91E63','#FF7043','#3F51B5','#9C27B0']
const stag   = { hidden:{opacity:0}, show:{ opacity:1, transition:{ staggerChildren:0.07 } } }
const it     = { hidden:{opacity:0,y:14}, show:{ opacity:1, y:0, transition:{ duration:0.25 } } }

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useUserData()
  const [showModal, setShow] = useState(false)
  const [editGoal, setEdit]  = useState(null)
  const [form, setForm]      = useState({ name:'', color:'#7C5CFC', targetAmount:'', currentAmount:'', monthlyContribution:'', deadline:'' })

  const totalSaved   = goals.reduce((s,g)=>s+g.currentAmount, 0)
  const totalTarget  = goals.reduce((s,g)=>s+g.targetAmount, 0)
  const completed    = goals.filter(g=>g.currentAmount>=g.targetAmount).length
  const avgPct       = goals.length>0 ? Math.round(goals.reduce((s,g)=>s+calcPercentage(g.currentAmount,g.targetAmount),0)/goals.length) : 0

  const handleSave = e => {
    e.preventDefault()
    const g = { ...form, targetAmount:parseFloat(form.targetAmount), currentAmount:parseFloat(form.currentAmount)||0, monthlyContribution:parseFloat(form.monthlyContribution)||0 }
    if (editGoal) { updateGoal(editGoal._id, g); toast.success('Goal updated!') }
    else          { addGoal(g); toast.success('Goal created!') }
    setShow(false); setEdit(null)
    setForm({ name:'', color:'#7C5CFC', targetAmount:'', currentAmount:'', monthlyContribution:'', deadline:'' })
  }

  const openEdit = g => {
    setEdit(g)
    setForm({ name:g.name, color:g.color||'#7C5CFC', targetAmount:g.targetAmount.toString(), currentAmount:g.currentAmount.toString(), monthlyContribution:g.monthlyContribution?.toString()||'', deadline:g.deadline?.split('T')[0]||'' })
    setShow(true)
  }

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <motion.div variants={it} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Track your progress towards every financial milestone</p>
        </div>
        <button onClick={()=>{setEdit(null);setShow(true)}} className="btn-primary">
          <Plus size={15}/> Add Goal
        </button>
      </motion.div>

      {/* Summary */}
      <motion.div variants={it} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(165px,1fr))', gap:14 }}>
        {[
          { label:'Total Saved',     value:formatCurrency(totalSaved),  icon:'💰', color:'#7C5CFC', bg:'var(--brand-light)' },
          { label:'Total Target',    value:formatCurrency(totalTarget),  icon:'🎯', color:'#FF7043', bg:'#FFF3EF' },
          { label:'Completed',       value:`${completed}/${goals.length}`, icon:'🏆', color:'#00C896', bg:'var(--accent-light)' },
          { label:'Avg Progress',    value:`${avgPct}%`,                 icon:'📈', color:'#FFB300', bg:'var(--warning-light)' },
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontSize:'1.4rem' }}>{s.icon}</span>
            </div>
            <p style={{ fontSize:'1.5rem', fontWeight:800, color:s.color, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>{s.value}</p>
            <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', fontWeight:500 }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Empty state */}
      {goals.length === 0 && (
        <motion.div variants={it} style={{ background:'#FFFFFF', border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)', padding:'52px 32px', textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'var(--brand-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
            <Target size={24} color="var(--brand)" strokeWidth={1.5}/>
          </div>
          <h3 style={{ fontSize:'1.0625rem', fontWeight:700, color:'var(--text-1)', marginBottom:8 }}>No savings goals yet</h3>
          <p style={{ color:'var(--text-3)', fontSize:'0.9rem', marginBottom:22, lineHeight:1.6, maxWidth:380, margin:'0 auto 22px' }}>
            Set a goal like "Buy iPhone", "Emergency Fund" or "Goa Vacation" and track your daily progress.
          </p>
          <button onClick={()=>setShow(true)} className="btn-primary"><Plus size={15}/> Create First Goal</button>
        </motion.div>
      )}

      {/* Goal cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
        <AnimatePresence>
          {goals.map((goal,i)=>{
            const pct  = calcPercentage(goal.currentAmount, goal.targetAmount)
            const done = goal.currentAmount >= goal.targetAmount
            const rem  = goal.targetAmount - goal.currentAmount
            const mos  = goal.monthlyContribution>0 ? Math.ceil(rem/goal.monthlyContribution) : null
            const eta  = mos ? format(addMonths(new Date(), mos), 'MMM yyyy') : null
            const c    = goal.color || '#7C5CFC'

            return (
              <motion.div key={goal._id} layout variants={it} whileHover={{ y:-4, boxShadow:'0 16px 48px rgba(0,0,0,0.1)' }}
                style={{ background:'#FFFFFF', borderRadius:'var(--radius-lg)', border:'1.5px solid var(--border)', padding:24, position:'relative', overflow:'hidden', transition:'all 0.22s' }}>

                {/* Accent bar */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${c},${c}88)`, borderRadius:'var(--radius-lg) var(--radius-lg) 0 0' }}/>

                {done && (
                  <div style={{ position:'absolute', top:14, right:14, padding:'3px 10px', borderRadius:99, background:'var(--accent-light)', border:'1px solid #00E0A8', fontSize:'0.72rem', fontWeight:800, color:'#00A87D' }}>
                    Achieved ✓
                  </div>
                )}

                {/* Top */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18, paddingTop:4 }}>
                  <div>
                    <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--text-1)', letterSpacing:'-0.01em', marginBottom:4 }}>{goal.name}</p>
                    <p style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>
                      {goal.monthlyContribution>0 ? `₹${goal.monthlyContribution.toLocaleString()}/month` : 'No monthly target set'}
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:4, marginLeft:8, flexShrink:0 }}>
                    <button onClick={()=>openEdit(goal)} className="btn-ghost" style={{ padding:'5px 7px' }}><Edit3 size={14}/></button>
                    <button onClick={()=>{ deleteGoal(goal._id); toast.success('Goal removed') }}
                      className="btn-ghost" style={{ padding:'5px 7px', color:'var(--text-4)' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='#FFE8EA'; e.currentTarget.style.color='#FF4757' }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-4)' }}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:14 }}>
                  <div>
                    <p style={{ fontSize:'1.625rem', fontWeight:800, color:c, letterSpacing:'-0.03em', lineHeight:1, marginBottom:3 }}>
                      ₹{goal.currentAmount.toLocaleString()}
                    </p>
                    <p style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>of ₹{goal.targetAmount.toLocaleString()} target</p>
                  </div>
                  <span style={{ fontSize:'1.5rem', fontWeight:800, color:c }}>{pct}%</span>
                </div>

                {/* Progress bar */}
                <div className="progress-bar" style={{ marginBottom:10, height:8 }}>
                  <motion.div className="progress-fill" initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1.2, ease:'easeOut', delay:0.1+i*0.08 }}
                    style={{ background:`linear-gradient(90deg,${c}CC,${c})` }}/>
                </div>

                {/* Milestone dots */}
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                  {[25,50,75,100].map(m=>(
                    <div key={m} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:pct>=m?c:'var(--border)', boxShadow:pct>=m?`0 0 6px ${c}80`:'none', transition:'all 0.4s' }}/>
                      <span style={{ fontSize:'0.625rem', color:pct>=m?c:'var(--text-4)', fontWeight:700 }}>{m}%</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div style={{ padding:'10px 12px', borderRadius:10, background:'var(--surface)', border:'1px solid var(--border)' }}>
                    <p style={{ fontSize:'0.6875rem', color:'var(--text-3)', fontWeight:600, marginBottom:3, display:'flex', alignItems:'center', gap:4 }}><Calendar size={10}/> ETA</p>
                    <p style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--text-1)' }}>{eta || '—'}</p>
                  </div>
                  <div style={{ padding:'10px 12px', borderRadius:10, background:'var(--surface)', border:'1px solid var(--border)' }}>
                    <p style={{ fontSize:'0.6875rem', color:'var(--text-3)', fontWeight:600, marginBottom:3, display:'flex', alignItems:'center', gap:4 }}><TrendingUp size={10}/> Remaining</p>
                    <p style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--text-1)' }}>₹{Math.max(0,rem).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={showModal} onClose={()=>setShow(false)} title={editGoal?'Edit Goal':'New Savings Goal'} size="md">
        <form onSubmit={handleSave} style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>

          {/* Color picker */}
          <div>
            <label className="field-label">Goal Colour</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {COLORS.map(c=>(
                <button key={c} type="button" onClick={()=>setForm(p=>({...p,color:c}))}
                  style={{ width:30, height:30, borderRadius:'50%', background:c, border:form.color===c?`3px solid var(--text-1)`:'2px solid transparent', cursor:'pointer', transition:'all 0.15s', boxShadow:form.color===c?`0 0 0 2px white, 0 0 0 4px ${c}`:'none' }}/>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Goal Name</label>
            <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Emergency Fund, Buy iPhone" required className="input"/>
            {/* Quick suggestions */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
              {['Emergency Fund','Buy iPhone','Goa Vacation','New Laptop','Home Down Payment'].map(s=>(
                <button key={s} type="button" onClick={()=>setForm(p=>({...p,name:s}))}
                  style={{ padding:'4px 10px', borderRadius:99, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', border:'1px solid var(--border)', background:form.name===s?'var(--brand)':'var(--surface)', color:form.name===s?'white':'var(--text-2)', transition:'all 0.15s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label className="field-label">Target Amount (₹)</label>
              <input type="number" value={form.targetAmount} onChange={e=>setForm(p=>({...p,targetAmount:e.target.value}))} placeholder="50000" required className="input"/>
            </div>
            <div>
              <label className="field-label">Already Saved (₹)</label>
              <input type="number" value={form.currentAmount} onChange={e=>setForm(p=>({...p,currentAmount:e.target.value}))} placeholder="0" className="input"/>
            </div>
            <div>
              <label className="field-label">Monthly (₹)</label>
              <input type="number" value={form.monthlyContribution} onChange={e=>setForm(p=>({...p,monthlyContribution:e.target.value}))} placeholder="5000" className="input"/>
            </div>
            <div>
              <label className="field-label">Target Date</label>
              <input type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} className="input"/>
            </div>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={()=>setShow(false)} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex:1, justifyContent:'center' }}>{editGoal?'Update Goal':'Create Goal'}</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
