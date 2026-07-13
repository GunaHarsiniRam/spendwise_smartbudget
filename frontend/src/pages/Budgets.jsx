import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, AlertTriangle, CheckCircle2, Info, PieChart } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/ui/Modal'
import { useUserData } from '../context/UserDataContext'
import { calcPercentage, CATEGORIES } from '../utils/helpers'

const CAT_COLORS = { Food:'#FF7043', Grocery:'#00C896', Shopping:'#7C5CFC', Entertainment:'#E91E63', Travel:'#2196F3', Healthcare:'#FF4757', Bills:'#607D8B', Education:'#3F51B5', Others:'#9C27B0' }
const CAT_BG    = { Food:'#FFF3EF', Grocery:'#E6FFF8', Shopping:'#EDE9FF', Entertainment:'#FCE4EC', Travel:'#E3F2FD', Healthcare:'#FFE8EA', Bills:'#ECEFF1', Education:'#E8EAF6', Others:'#F3E5F5' }

const stag = { hidden:{opacity:0}, show:{ opacity:1, transition:{ staggerChildren:0.07 } } }
const it   = { hidden:{opacity:0,y:14}, show:{ opacity:1, y:0, transition:{ duration:0.25 } } }

export default function Budgets() {
  const { budgets, addBudget, deleteBudget } = useUserData()
  const [showAdd, setShowAdd]         = useState(false)
  const [showPenalty, setShowPenalty] = useState(false)
  const [penaltyRules, setPR]         = useState({ rule1:1, rule2:5, rule3:10 })
  const [form, setForm]               = useState({ category:'Food', limit:'' })

  const totalBudget = budgets.reduce((s,b)=>s+b.limit,0)
  const totalSpent  = budgets.reduce((s,b)=>s+b.spent,0)
  const over        = budgets.filter(b=>b.spent>b.limit)
  const onTrack     = budgets.filter(b=>b.spent<=b.limit)

  const handleAdd = e => {
    e.preventDefault()
    if (budgets.find(b=>b.category===form.category)) { toast.error('Budget for this category already exists'); return }
    addBudget({ category:form.category, limit:parseFloat(form.limit), spent:0, enabled:true })
    toast.success('Budget created!'); setShowAdd(false); setForm({category:'Food',limit:''})
  }

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <motion.div variants={it} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set monthly spending limits and track your discipline</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={()=>setShowPenalty(true)} className="btn-secondary"><Info size={15}/> Penalty Rules</button>
          <button onClick={()=>setShowAdd(true)} className="btn-primary"><Plus size={15}/> Add Budget</button>
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div variants={it} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14 }}>
        {[
          { label:'Total Budget',   value:`₹${totalBudget.toLocaleString()}`,  sub:`${budgets.length} categories`,           icon:'💰', color:'#7C5CFC', bg:'var(--brand-light)' },
          { label:'Total Spent',    value:`₹${totalSpent.toLocaleString()}`,   sub:`${Math.round(totalBudget>0?(totalSpent/totalBudget)*100:0)}% used`, icon:'💸', color:'#FF4757', bg:'#FFE8EA' },
          { label:'Over Budget',    value:over.length,                          sub:over.length?'Need attention':'All clear!',  icon:over.length?'⚠️':'✅', color:over.length?'#FF4757':'#00C896', bg:over.length?'#FFE8EA':'var(--accent-light)' },
          { label:'On Track',       value:onTrack.length,                       sub:`of ${budgets.length} budgets`,            icon:'🎯', color:'#00C896', bg:'var(--accent-light)' },
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontSize:'1.4rem' }}>{s.icon}</span>
              <span style={{ fontSize:'0.72rem', fontWeight:700, color:s.color, background:s.bg, padding:'3px 10px', borderRadius:99 }}>{s.sub}</span>
            </div>
            <p style={{ fontSize:'1.625rem', fontWeight:800, color:s.color, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>{s.value}</p>
            <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', fontWeight:500 }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Alert */}
      {over.length > 0 && (
        <motion.div variants={it} style={{ background:'#FFE8EA', border:'1.5px solid #FFCCD3', borderRadius:'var(--radius)', padding:'14px 18px', display:'flex', alignItems:'center', gap:10 }}>
          <AlertTriangle size={18} color="#FF4757" strokeWidth={2}/>
          <span style={{ fontSize:'0.875rem', color:'#CC1D2C', fontWeight:700 }}>
            {over.length} budget{over.length>1?'s':''} exceeded: {over.map(b=>b.category).join(', ')} — penalties are being donated to charity.
          </span>
        </motion.div>
      )}

      {/* Empty state */}
      {budgets.length === 0 && (
        <motion.div variants={it} style={{ background:'#FFFFFF', border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)', padding:'52px 32px', textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'var(--brand-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
            <PieChart size={24} color="var(--brand)" strokeWidth={1.5}/>
          </div>
          <h3 style={{ fontSize:'1.0625rem', fontWeight:700, color:'var(--text-1)', marginBottom:8 }}>No budgets created yet</h3>
          <p style={{ color:'var(--text-3)', fontSize:'0.9rem', marginBottom:22, lineHeight:1.6 }}>Create budgets to control your monthly spending by category.</p>
          <button onClick={()=>setShowAdd(true)} className="btn-primary"><Plus size={15}/> Create First Budget</button>
        </motion.div>
      )}

      {/* Budget cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {budgets.map((b,i)=>{
          const cat    = CATEGORIES[b.category]||CATEGORIES.Others
          const pct    = calcPercentage(b.spent, b.limit)
          const isOver = b.spent > b.limit
          const near   = pct >= 80 && !isOver
          const color  = isOver ? '#FF4757' : near ? '#FFB300' : CAT_COLORS[b.category]||'#7C5CFC'
          const bg     = isOver ? '#FFE8EA' : near ? 'var(--warning-light)' : CAT_BG[b.category]||'var(--brand-light)'
          const statusLabel = isOver ? 'Exceeded' : near ? 'Near Limit' : 'On Track'
          const statusColor = isOver ? '#CC1D2C' : near ? '#B07D00' : '#00A87D'
          const statusBg    = isOver ? '#FFE8EA' : near ? 'var(--warning-light)' : 'var(--accent-light)'

          return (
            <motion.div key={b._id} variants={it} whileHover={{ y:-3 }}
              style={{ background:'#FFFFFF', borderRadius:'var(--radius-lg)', border:`1.5px solid ${isOver?'#FFCCD3':near?'#FFE082':'var(--border)'}`, padding:22, boxShadow:isOver?'0 4px 20px rgba(255,71,87,0.12)':near?'0 4px 20px rgba(255,179,0,0.12)':'var(--shadow-sm)', position:'relative', overflow:'hidden' }}>

              {/* Top colour strip */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:color, borderRadius:'var(--radius-lg) var(--radius-lg) 0 0' }}/>

              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, paddingTop:4 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{cat.icon}</div>
                  <div>
                    <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem' }}>{b.category}</p>
                    <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:1 }}>Monthly limit</p>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.75rem', fontWeight:700, background:statusBg, color:statusColor }}>{statusLabel}</span>
                  <button onClick={()=>{ deleteBudget(b._id); toast.success('Budget removed') }}
                    className="btn-ghost" style={{ padding:'4px 6px', color:'var(--text-4)' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='#FFE8EA'; e.currentTarget.style.color='#FF4757' }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-4)' }}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:'0.8125rem', color:'var(--text-3)' }}>Spent</span>
                <span style={{ fontSize:'0.8125rem', fontWeight:700, color }}>₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()}</span>
              </div>
              <div className="progress-bar" style={{ marginBottom:10 }}>
                <motion.div className="progress-fill" initial={{ width:0 }} animate={{ width:`${Math.min(pct,100)}%` }} transition={{ duration:0.9, ease:'easeOut' }}
                  style={{ background:color }}/>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>{pct}% used</span>
                {isOver
                  ? <span style={{ fontSize:'0.78rem', color:'#FF4757', fontWeight:700 }}>₹{(b.spent-b.limit).toLocaleString()} over</span>
                  : <span style={{ fontSize:'0.78rem', color:'#00A87D', fontWeight:700 }}>₹{(b.limit-b.spent).toLocaleString()} left</span>
                }
              </div>
              {isOver && (
                <div style={{ marginTop:12, padding:'8px 12px', borderRadius:9, background:'#FFE8EA', border:'1px solid #FFCCD3', fontSize:'0.75rem', color:'#CC1D2C', fontWeight:600, lineHeight:1.5 }}>
                  Penalty automatically donated to your chosen charity
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Add Budget Modal */}
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="Create Budget">
        <form onSubmit={handleAdd} style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label className="field-label">Category</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:4 }}>
              {Object.keys(CATEGORIES).map(c=>{
                const color = CAT_COLORS[c]||'#7C5CFC'
                const bg    = CAT_BG[c]||'var(--brand-light)'
                return (
                  <button key={c} type="button" onClick={()=>setForm(p=>({...p,category:c}))}
                    style={{ padding:'10px 6px', borderRadius:10, fontSize:'0.8125rem', fontWeight:600, cursor:'pointer', border:`1.5px solid`, textAlign:'center', transition:'all 0.15s',
                      background:form.category===c?color:bg, color:form.category===c?'white':color, borderColor:form.category===c?color:`${color}30` }}>
                    {CATEGORIES[c].icon} {c}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="field-label">Monthly Limit (₹)</label>
            <input type="number" value={form.limit} onChange={e=>setForm(p=>({...p,limit:e.target.value}))} placeholder="e.g. 5000" required min="1" className="input"/>
          </div>
          <div style={{ padding:'11px 14px', borderRadius:10, background:'var(--brand-light)', border:'1px solid #D8D0FF', fontSize:'0.8125rem', color:'var(--brand-dark)', lineHeight:1.6 }}>
            If you exceed this limit, a small penalty will be donated to your selected charity.
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={()=>setShowAdd(false)} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex:1, justifyContent:'center' }}>Create Budget</button>
          </div>
        </form>
      </Modal>

      {/* Penalty Rules Modal */}
      <Modal isOpen={showPenalty} onClose={()=>setShowPenalty(false)} title="Penalty Rules">
        <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:14 }}>
          <p style={{ fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.6 }}>Configure how much gets donated to charity when budgets are exceeded.</p>
          {[
            { l:'5–10% over budget',  k:'rule1', desc:'Minor overspend',       color:'var(--warning)' },
            { l:'10–20% over budget', k:'rule2', desc:'Moderate overspend',    color:'#FF7043' },
            { l:'20%+ over budget',   k:'rule3', desc:'Significant overspend', color:'var(--danger)' },
          ].map(r=>(
            <div key={r.k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', borderRadius:11, background:'var(--surface)', border:'1.5px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.875rem' }}>{r.l}</p>
                <p style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{r.desc}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'var(--text-3)', fontWeight:600 }}>₹</span>
                <input type="number" value={penaltyRules[r.k]} onChange={e=>setPR(p=>({...p,[r.k]:parseInt(e.target.value)||0}))}
                  className="input" style={{ width:72, textAlign:'center', fontWeight:700, color:r.color, padding:'8px' }} min="0"/>
              </div>
            </div>
          ))}
          <button onClick={()=>{ setShowPenalty(false); toast.success('Rules saved!') }} className="btn-primary" style={{ width:'100%', justifyContent:'center' }}>Save Rules</button>
        </div>
      </Modal>
    </motion.div>
  )
}
