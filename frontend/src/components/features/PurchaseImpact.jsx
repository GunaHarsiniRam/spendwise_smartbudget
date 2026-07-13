import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, TrendingDown, AlertTriangle, CheckCircle, Clock, Target, Zap } from 'lucide-react'
import { useUserData } from '../../context/UserDataContext'
import { CATEGORIES } from '../../utils/helpers'

/* ── Calculate purchase impact ── */
function calcImpact(cost, budgets, goals, profile, expenses) {
  const income     = profile?.monthlyIncome || 0
  const healthScore= profile?.financialHealthScore || 0

  // This month spending
  const now = new Date()
  const thisMonthSpend = expenses
    .filter(e => { try { const d=new Date(e.date); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear() } catch { return false } })
    .reduce((s,e)=>s+e.amount,0)
  const remainingBudget = income - thisMonthSpend
  const budgetImpactPct = income > 0 ? Math.round((cost/income)*100) : 0

  // Goal impact
  const goalImpacts = goals.map(g => {
    const rem = g.targetAmount - g.currentAmount
    if (rem <= 0) return null
    const monthly = g.monthlyContribution || 0
    if (monthly <= 0) return null
    const daysDelayed = Math.round((cost / monthly) * 30)
    return { name:g.name, daysDelayed, icon:g.icon||'🎯', color:g.color||'#7C5CFC' }
  }).filter(Boolean)

  // Budget impact
  const overBudgets = budgets.filter(b => b.spent > b.limit)

  // Health score impact
  const newHealthScore = Math.max(0, healthScore - Math.round(budgetImpactPct * 0.5))

  // Savings impact
  const savingsImpact = income > 0 ? Math.round((cost/income)*100) : 0

  // Recommendation
  let recommendation = ''
  let recommendationLevel = 'good' // good | caution | warning | danger

  if (cost > income * 0.3) {
    recommendation = `This purchase is ${Math.round((cost/income)*100)}% of your monthly income. Consider spreading the cost or waiting for a salary credit.`
    recommendationLevel = 'danger'
  } else if (cost > income * 0.1) {
    recommendation = `This is a significant purchase. Ensure it aligns with your savings goals before proceeding.`
    recommendationLevel = 'warning'
  } else if (overBudgets.length > 0) {
    recommendation = `You already have ${overBudgets.length} budget${overBudgets.length>1?'s':''} exceeded this month. Consider postponing non-essential purchases.`
    recommendationLevel = 'caution'
  } else if (goalImpacts.length > 0 && goalImpacts[0].daysDelayed > 7) {
    recommendation = `This will delay your ${goalImpacts[0].name} goal by ${goalImpacts[0].daysDelayed} days. Consider if the purchase is worth that trade-off.`
    recommendationLevel = 'caution'
  } else {
    recommendation = `This purchase looks manageable. It represents ${budgetImpactPct}% of your monthly income and won't significantly impact your goals.`
    recommendationLevel = 'good'
  }

  // Impact score (0–100, lower = more impact)
  const impactScore = Math.max(0, 100 - budgetImpactPct * 2 - (overBudgets.length * 10))

  return {
    impactScore,
    budgetImpactPct,
    newHealthScore,
    healthDrop: healthScore - newHealthScore,
    savingsImpact,
    remainingBudget,
    goalImpacts: goalImpacts.slice(0,3),
    recommendation,
    recommendationLevel,
    canAfford: cost <= remainingBudget,
  }
}

/* ── Floating "Should I Buy?" button ── */
export function ShouldIBuyButton({ onClick }) {
  return (
    <motion.button
      whileHover={{ scale:1.06, y:-2 }}
      whileTap={{ scale:0.95 }}
      onClick={onClick}
      style={{
        position:'fixed', bottom:100, right:24, zIndex:90,
        display:'flex', alignItems:'center', gap:8,
        padding:'12px 18px', borderRadius:99,
        background:'linear-gradient(135deg,#7C5CFC,#9B7BFF)',
        color:'white', fontWeight:700, fontSize:'0.875rem',
        border:'none', cursor:'pointer',
        boxShadow:'0 8px 28px rgba(124,92,252,0.45)',
        fontFamily:'Inter, sans-serif',
      }}>
      <ShoppingCart size={17}/>
      Should I Buy?
    </motion.button>
  )
}

/* ── Main Modal ── */
export default function PurchaseImpactModal({ isOpen, onClose }) {
  const { budgets, goals, profile, expenses } = useUserData()
  const [itemName, setItemName]   = useState('')
  const [itemCost, setItemCost]   = useState('')
  const [category, setCategory]   = useState('Shopping')
  const [result, setResult]       = useState(null)
  const [analysed, setAnalysed]   = useState(false)

  const analyse = () => {
    const cost = parseFloat(itemCost)
    if (!itemName || !cost || cost <= 0) return
    const impact = calcImpact(cost, budgets, goals, profile, expenses)
    setResult(impact)
    setAnalysed(true)
  }

  const reset = () => { setItemName(''); setItemCost(''); setCategory('Shopping'); setResult(null); setAnalysed(false) }

  const levelStyles = {
    good:    { bg:'#ECFDF5', border:'#A7F3D0', color:'#059669', icon:<CheckCircle size={16}/> },
    caution: { bg:'#FFFBEB', border:'#FDE68A', color:'#D97706', icon:<Clock size={16}/> },
    warning: { bg:'#FEF3C7', border:'#FDE68A', color:'#B45309', icon:<AlertTriangle size={16}/> },
    danger:  { bg:'#FEF2F2', border:'#FECACA', color:'#DC2626', icon:<AlertTriangle size={16}/> },
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose}
        style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(13,11,38,0.6)', backdropFilter:'blur(6px)' }}>
        <motion.div initial={{ opacity:0, scale:0.94, y:16 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94, y:16 }}
          onClick={e => e.stopPropagation()}
          style={{ width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', borderRadius:20, background:'#FFFFFF', border:'1.5px solid var(--border)', boxShadow:'0 24px 80px rgba(100,80,200,0.2)' }}>

          {/* Header */}
          <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', background:'var(--surface)', borderRadius:'20px 20px 0 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,var(--brand),#9B7BFF)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ShoppingCart size={18} color="white"/>
              </div>
              <div>
                <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem' }}>Should I Buy This?</p>
                <p style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>AI Purchase Impact Analyser</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:'var(--surface)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-3)' }}>
              <X size={15}/>
            </button>
          </div>

          <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
            {!analysed ? (
              /* Input form */
              <>
                <div>
                  <label className="field-label">What do you want to buy?</label>
                  <input value={itemName} onChange={e=>setItemName(e.target.value)} placeholder="e.g. AirPods, New Phone, Shoes" className="input"/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div>
                    <label className="field-label">Cost (₹)</label>
                    <input type="number" value={itemCost} onChange={e=>setItemCost(e.target.value)} placeholder="15000" className="input"/>
                  </div>
                  <div>
                    <label className="field-label">Category</label>
                    <select value={category} onChange={e=>setCategory(e.target.value)} className="input">
                      {Object.keys(CATEGORIES).map(c=><option key={c} value={c}>{CATEGORIES[c].icon} {c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Quick cost buttons */}
                <div>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-3)', fontWeight:600, marginBottom:8 }}>Quick amounts</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {['500','1000','5000','10000','15000','25000','50000'].map(v=>(
                      <button key={v} onClick={()=>setItemCost(v)}
                        style={{ padding:'5px 12px', borderRadius:99, fontSize:'0.78rem', fontWeight:600, cursor:'pointer', border:'1.5px solid',
                          background:itemCost===v?'var(--brand)':'var(--surface)', color:itemCost===v?'white':'var(--text-2)', borderColor:itemCost===v?'var(--brand)':'var(--border)' }}>
                        ₹{parseInt(v).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  onClick={analyse} disabled={!itemName||!itemCost}
                  className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', opacity:(!itemName||!itemCost)?0.5:1 }}>
                  <Zap size={16}/> Analyse Impact
                </motion.button>
              </>
            ) : result && (
              /* Results */
              <>
                <div style={{ textAlign:'center', padding:'8px 0' }}>
                  <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--text-1)', marginBottom:4 }}>{itemName}</p>
                  <p style={{ fontSize:'1.75rem', fontWeight:900, color:'var(--brand)', letterSpacing:'-0.03em' }}>₹{parseFloat(itemCost).toLocaleString()}</p>
                </div>

                {/* Impact score gauge */}
                <div style={{ padding:'16px 20px', borderRadius:14, background:'var(--surface)', border:'1.5px solid var(--border)', textAlign:'center' }}>
                  <p style={{ fontSize:'0.72rem', color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Purchase Impact Score</p>
                  <div style={{ position:'relative', width:120, height:60, margin:'0 auto 8px', overflow:'hidden' }}>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:120, borderRadius:'60px 60px 0 0', background:'#F3F4F6', overflow:'hidden' }}>
                      <motion.div initial={{ rotate:-90 }} animate={{ rotate:-90 + (result.impactScore/100)*180 }} transition={{ duration:1.2, ease:'easeOut' }}
                        style={{ position:'absolute', bottom:0, left:'50%', width:0, height:0, transformOrigin:'bottom center', borderLeft:'3px solid var(--brand)' }}>
                        <div style={{ position:'absolute', bottom:0, left:-1, width:2, height:54, background:'var(--brand)', borderRadius:1 }}/>
                      </motion.div>
                    </div>
                  </div>
                  <p style={{ fontSize:'2rem', fontWeight:900, color:result.impactScore>=70?'#059669':result.impactScore>=40?'#D97706':'#DC2626', letterSpacing:'-0.03em', lineHeight:1 }}>{result.impactScore}</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:4 }}>
                    {result.impactScore >= 70 ? 'Low Impact' : result.impactScore >= 40 ? 'Moderate Impact' : 'High Impact'}
                  </p>
                </div>

                {/* Impact cards grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { label:'Budget Impact', value:`${result.budgetImpactPct}% of income`, icon:'💸', color:result.budgetImpactPct>20?'#DC2626':'#059669', bg:result.budgetImpactPct>20?'#FEF2F2':'#ECFDF5' },
                    { label:'Health Score', value:`${profile?.financialHealthScore||0} → ${result.newHealthScore}`, icon:'📊', color:result.healthDrop>10?'#DC2626':'#D97706', bg:result.healthDrop>10?'#FEF2F2':'#FFFBEB' },
                    { label:'Can You Afford It?', value:result.canAfford?'Yes':'Review budget', icon:result.canAfford?'✅':'⚠️', color:result.canAfford?'#059669':'#DC2626', bg:result.canAfford?'#ECFDF5':'#FEF2F2' },
                    { label:'Savings Impact', value:`-${result.savingsImpact}% this month`, icon:'🏦', color:'#D97706', bg:'#FFFBEB' },
                  ].map((card,i)=>(
                    <div key={i} style={{ padding:'14px 12px', borderRadius:12, background:card.bg, textAlign:'center' }}>
                      <p style={{ fontSize:'1.3rem', marginBottom:6 }}>{card.icon}</p>
                      <p style={{ fontSize:'0.8125rem', fontWeight:700, color:card.color, marginBottom:2 }}>{card.value}</p>
                      <p style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{card.label}</p>
                    </div>
                  ))}
                </div>

                {/* Goal delays */}
                {result.goalImpacts.length > 0 && (
                  <div style={{ padding:'14px 16px', borderRadius:12, background:'#EEF2FF', border:'1px solid #C7D2FE' }}>
                    <p style={{ fontSize:'0.8125rem', fontWeight:700, color:'#4338CA', marginBottom:10 }}>Goal Delay Predictions</p>
                    {result.goalImpacts.map((g,i)=>(
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                        <span style={{ fontSize:'0.8125rem', color:'var(--text-2)' }}>{g.icon} {g.name}</span>
                        <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'#DC2626' }}>+{g.daysDelayed} days delay</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                {(() => {
                  const s = levelStyles[result.recommendationLevel] || levelStyles.good
                  return (
                    <div style={{ padding:'14px 16px', borderRadius:12, background:s.bg, border:`1.5px solid ${s.border}`, display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ color:s.color, flexShrink:0, marginTop:1 }}>{s.icon}</span>
                      <div>
                        <p style={{ fontSize:'0.8125rem', fontWeight:700, color:s.color, marginBottom:3 }}>
                          {result.recommendationLevel === 'good' ? 'Go ahead!' : result.recommendationLevel === 'caution' ? 'Think twice' : result.recommendationLevel === 'warning' ? 'Be careful' : 'Not recommended now'}
                        </p>
                        <p style={{ fontSize:'0.8125rem', color:'var(--text-2)', lineHeight:1.6 }}>{result.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Actions */}
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={reset} className="btn-secondary" style={{ flex:1 }}>Analyse Another</button>
                  <button onClick={onClose} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>Got it!</button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
