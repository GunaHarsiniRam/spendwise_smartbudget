import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Clock, X, CheckCircle, Zap } from 'lucide-react'

const RISK_STYLES = {
  Low:      { color:'#D97706', bg:'#FFFBEB', border:'#FDE68A', label:'Low Risk',      emoji:'🟡' },
  Medium:   { color:'#D97706', bg:'#FEF3C7', border:'#FDE68A', label:'Medium Risk',   emoji:'🟠' },
  High:     { color:'#DC2626', bg:'#FEF2F2', border:'#FECACA', label:'High Risk',     emoji:'🔴' },
  Critical: { color:'#DC2626', bg:'#FFF1F2', border:'#FDA4AF', label:'Critical Risk', emoji:'🚨' },
}

export default function ImpulseAlert({ detection, expense, onDismiss, onProceed }) {
  const [countdown, setCountdown] = useState(null)

  if (!detection || !detection.level) return null
  const s = RISK_STYLES[detection.level] || RISK_STYLES.Medium

  const startCooldown = () => {
    setCountdown(5)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); setCountdown(null); return null }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        style={{ position:'fixed', inset:0, zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(13,11,38,0.65)', backdropFilter:'blur(6px)' }}>
        <motion.div initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:20 }}
          style={{ width:'100%', maxWidth:440, borderRadius:20, background:'#FFFFFF', border:`2px solid ${s.border}`, boxShadow:'0 24px 80px rgba(0,0,0,0.2)', overflow:'hidden' }}>

          {/* Top bar */}
          <div style={{ padding:'16px 20px', background:s.bg, borderBottom:`1px solid ${s.border}`, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:s.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <AlertTriangle size={20} color="white"/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:800, color:s.color, fontSize:'0.9375rem', marginBottom:2 }}>
                {s.emoji} Possible Impulse Purchase
              </p>
              <p style={{ fontSize:'0.75rem', color:'var(--text-2)', fontWeight:500 }}>
                Risk Score: <strong style={{ color:s.color }}>{detection.score}%</strong> · {s.label}
              </p>
            </div>
            <button onClick={onDismiss} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:4 }}>
              <X size={16}/>
            </button>
          </div>

          <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:16 }}>
            {/* Expense info */}
            <div style={{ padding:'12px 16px', borderRadius:11, background:'var(--surface)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem' }}>{expense?.merchant}</p>
                  <p style={{ fontSize:'0.78rem', color:'var(--text-3)', marginTop:2 }}>{expense?.category}</p>
                </div>
                <p style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--danger)', letterSpacing:'-0.02em' }}>
                  ₹{expense?.amount?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Risk factors */}
            {detection.factors?.length > 0 && (
              <div>
                <p style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-2)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Why this was flagged:</p>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {detection.factors.map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:9, background:s.bg, border:`1px solid ${s.border}` }}>
                      <Zap size={13} color={s.color}/>
                      <span style={{ fontSize:'0.8125rem', color:'var(--text-2)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cooling period suggestion */}
            <div style={{ padding:'12px 16px', borderRadius:11, background:'#EFF6FF', border:'1px solid #BFDBFE', display:'flex', gap:10, alignItems:'flex-start' }}>
              <Clock size={16} color="#2563EB" style={{ flexShrink:0, marginTop:1 }}/>
              <div>
                <p style={{ fontWeight:700, color:'#1D4ED8', fontSize:'0.875rem', marginBottom:3 }}>24-Hour Cooling Period Suggested</p>
                <p style={{ fontSize:'0.8125rem', color:'#1E40AF', lineHeight:1.6 }}>
                  Research shows waiting 24 hours eliminates 80% of impulse purchases. If you still want it tomorrow, it's probably worth it.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onDismiss} className="btn-secondary" style={{ flex:1, justifyContent:'center' }}>
                <Clock size={14}/> Wait 24 Hours
              </button>
              <button
                onClick={countdown === null ? startCooldown : onProceed}
                style={{ flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
                  padding:'11px 20px', borderRadius:'var(--radius)', border:'none', cursor:'pointer',
                  background: countdown ? `rgba(220,38,38,0.1)` : '#DC2626',
                  color: countdown ? '#DC2626' : 'white',
                  fontWeight:700, fontSize:'0.875rem', transition:'all 0.2s',
                  fontFamily:'Inter, sans-serif' }}>
                {countdown !== null
                  ? `Confirm in ${countdown}s`
                  : <><CheckCircle size={14}/> Proceed Anyway</>}
              </button>
            </div>

            <p style={{ textAlign:'center', fontSize:'0.72rem', color:'var(--text-3)' }}>
              This alert is saved to your impulse control report
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Impulse Control Score Widget (for Dashboard) ── */
export function ImpulseScoreWidget({ impulseRecords }) {
  const total    = impulseRecords?.length || 0
  const avoided  = impulseRecords?.filter(r => r.action === 'avoided')?.length || 0
  const score    = total > 0 ? Math.round((avoided / total) * 100) : 100
  const color    = score >= 70 ? '#00C896' : score >= 40 ? '#FFB300' : '#FF4757'

  return (
    <div style={{ padding:'18px 20px', borderRadius:14, background:'#FFFFFF', border:'1.5px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
      <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
        Impulse Control
      </p>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        {/* Circular score */}
        <div style={{ position:'relative', width:60, height:60, flexShrink:0 }}>
          <svg width={60} height={60} style={{ transform:'rotate(-90deg)' }}>
            <circle cx={30} cy={30} r={24} fill="none" stroke="var(--surface)" strokeWidth={6}/>
            <motion.circle cx={30} cy={30} r={24} fill="none" stroke={color} strokeWidth={6}
              strokeLinecap="round" strokeDasharray={150.8}
              initial={{ strokeDashoffset:150.8 }}
              animate={{ strokeDashoffset: 150.8 - (score/100)*150.8 }}
              transition={{ duration:1.2, ease:'easeOut' }}/>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'0.9rem', fontWeight:800, color }}>{score}</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize:'1.0625rem', fontWeight:800, color:'var(--text-1)', letterSpacing:'-0.01em', marginBottom:3 }}>
            {score >= 70 ? 'Strong Control' : score >= 40 ? 'Improving' : 'Needs Work'}
          </p>
          <p style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>
            {avoided} of {total} impulses avoided
          </p>
        </div>
      </div>
    </div>
  )
}
