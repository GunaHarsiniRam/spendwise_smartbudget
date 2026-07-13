import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Heart } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useUserData } from '../context/UserDataContext'
import { useAuth } from '../context/AuthContext'
import { ALL_CHARITIES } from '../context/UserDataContext'
import { formatDate } from '../utils/helpers'

const CAUSE_STYLES = {
  'Food Donation':  { color:'#FF7043', bg:'#FFF3EF', border:'#FFCCBC' },
  'Environment':    { color:'#00C896', bg:'var(--accent-light)', border:'#A7F3D0' },
  'Education':      { color:'#3F51B5', bg:'#E8EAF6', border:'#C5CAE9' },
  'Animal Welfare': { color:'#7C5CFC', bg:'var(--brand-light)', border:'#D8D0FF' },
  'Healthcare':     { color:'#E91E63', bg:'#FCE4EC', border:'#F48FB1' },
}
const PIE_COLORS = ['#7C5CFC','#00C896','#FFB300','#FF4757','#2196F3']

const stag = { hidden:{opacity:0}, show:{ opacity:1, transition:{ staggerChildren:0.07 } } }
const it   = { hidden:{opacity:0,y:14}, show:{ opacity:1, y:0, transition:{ duration:0.25 } } }

export default function SocialImpact() {
  const { user }   = useAuth()
  const { donations, totalDonated, updateProfile, profile } = useUserData()
  const [activeTab, setActiveTab]   = useState('overview')
  const [selCharity, setSelCharity] = useState(profile?.selectedCharity || null)

  const firstName    = (user?.name||profile?.name||'You').split(' ')[0]
  const selectCharity = id => { setSelCharity(id); updateProfile({ selectedCharity:id }) }

  const pieData = donations.reduce((acc,d)=>{
    const x=acc.find(a=>a.name===d.cause)
    if(x) x.value+=d.amount; else acc.push({name:d.cause,value:d.amount})
    return acc
  },[])

  // Real impact calculations
  const mealsSponsored   = Math.floor(totalDonated / 4)
  const treesSupported   = Math.floor(totalDonated / 15)
  const animalsHelped    = Math.floor(totalDonated / 6)
  const studentsAided    = Math.floor(totalDonated / 25)

  const impactStats = [
    { label:'Total Donated',    value:`₹${totalDonated.toLocaleString()}`, color:'#7C5CFC', bg:'var(--brand-light)' },
    { label:'Donations Made',   value:donations.length,                    color:'#00C896', bg:'var(--accent-light)' },
    { label:'Causes Supported', value:pieData.length,                      color:'#FFB300', bg:'var(--warning-light)' },
    { label:'Selected Charity', value:ALL_CHARITIES.find(c=>c._id===selCharity)?.name||'None', color:'#E91E63', bg:'#FCE4EC', small:true },
  ]

  const realImpact = [
    { icon:'🍛', label:'Meals Sponsored',    value:mealsSponsored,  color:'#FF7043', bg:'#FFF3EF' },
    { icon:'🌳', label:'Trees Supported',    value:treesSupported,  color:'#00C896', bg:'var(--accent-light)' },
    { icon:'🐾', label:'Animals Helped',     value:animalsHelped,   color:'#7C5CFC', bg:'var(--brand-light)' },
    { icon:'📚', label:'Students Aided',     value:studentsAided,   color:'#2196F3', bg:'#E3F2FD' },
  ]

  const TABS = ['overview','charities','history']

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <motion.div variants={it}>
        <h1 className="page-title">Social Impact</h1>
        <p className="page-subtitle">Your financial discipline funds real causes in the world</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={it} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(165px,1fr))', gap:14 }}>
        {impactStats.map((s,i)=>(
          <div key={i} className="stat-card">
            <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', fontWeight:500, marginBottom:10 }}>{s.label}</p>
            <p style={{ fontSize:s.small?'0.9375rem':'1.5rem', fontWeight:800, color:s.color, letterSpacing:s.small?'-0.01em':'-0.02em', lineHeight:1, marginBottom:4, wordBreak:'break-word' }}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Real World Impact */}
      {totalDonated > 0 && (
        <motion.div variants={it}>
          <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Your Real World Impact</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
            {realImpact.map((r,i)=>(
              <motion.div key={i} whileHover={{ y:-3 }}
                style={{ padding:'16px 14px', borderRadius:14, background:r.bg, border:`1.5px solid ${r.color}20`, textAlign:'center' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>{r.icon}</div>
                <p style={{ fontSize:'1.625rem', fontWeight:900, color:r.color, letterSpacing:'-0.03em', lineHeight:1, marginBottom:4 }}>{r.value}</p>
                <p style={{ fontSize:'0.75rem', color:'var(--text-2)', fontWeight:600 }}>{r.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={it}>
        <div style={{ display:'flex', gap:4, background:'#FFFFFF', border:'1.5px solid var(--border)', borderRadius:12, padding:4, width:'fit-content' }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{ padding:'7px 18px', borderRadius:9, fontSize:'0.875rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.15s', textTransform:'capitalize',
                background:activeTab===t?'var(--brand)':'transparent', color:activeTab===t?'white':'var(--text-3)',
                boxShadow:activeTab===t?'0 3px 10px rgba(124,92,252,0.35)':'none' }}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Overview */}
      <AnimatePresence mode="wait">
        {activeTab==='overview' && (
          <motion.div key="ov" initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {totalDonated === 0 ? (
              <div style={{ background:'#FFFFFF', border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)', padding:'52px 32px', textAlign:'center' }}>
                <div style={{ width:52, height:52, borderRadius:14, background:'#FCE4EC', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
                  <Heart size={24} color="#E91E63" strokeWidth={1.5}/>
                </div>
                <h3 style={{ fontSize:'1.0625rem', fontWeight:700, color:'var(--text-1)', marginBottom:8 }}>No impact recorded yet</h3>
                <p style={{ color:'var(--text-3)', fontSize:'0.9rem', marginBottom:22, lineHeight:1.6, maxWidth:380, margin:'0 auto 22px' }}>
                  Set up budgets and select a charity. When you overspend, a penalty is donated automatically.
                </p>
                <button onClick={()=>setActiveTab('charities')} className="btn-primary">Select a Charity</button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                {/* Pie */}
                {pieData.length > 0 && (
                  <div className="card" style={{ padding:'22px 24px' }}>
                    <h3 className="section-title" style={{ marginBottom:4 }}>Donation Breakdown</h3>
                    <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', marginBottom:16 }}>By cause category</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                          {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                        </Pie>
                        <Tooltip formatter={v=>[`₹${v}`,'']} contentStyle={{ background:'#13122B', border:'none', borderRadius:10, fontSize:12, color:'#fff' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:10 }}>
                      {pieData.map((d,i)=>(
                        <div key={d.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:8, height:8, borderRadius:2, background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }}/>
                            <span style={{ fontSize:'0.8125rem', color:'var(--text-2)' }}>{d.name}</span>
                          </div>
                          <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--text-1)' }}>₹{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent donations */}
                <div className="card" style={{ padding:'22px 24px' }}>
                  <h3 className="section-title" style={{ marginBottom:16 }}>Recent Donations</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {donations.slice(0,5).map((d,i)=>{
                      const cs = CAUSE_STYLES[d.cause]||CAUSE_STYLES['Healthcare']
                      return (
                        <div key={d._id||i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingBottom:12, borderBottom:i<Math.min(donations.length-1,4)?'1px solid var(--border)':'none' }}>
                          <div>
                            <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.875rem', marginBottom:2 }}>{d.charity}</p>
                            <span style={{ padding:'2px 9px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, background:cs.bg, color:cs.color, border:`1px solid ${cs.border}` }}>{d.cause}</span>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
                            <p style={{ fontWeight:800, color:'#E91E63', fontSize:'0.9375rem' }}>₹{d.amount}</p>
                            <p style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:2 }}>{formatDate(d.date)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Charities */}
        {activeTab==='charities' && (
          <motion.div key="ch" initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {ALL_CHARITIES.map((charity,i)=>{
              const cs  = CAUSE_STYLES[charity.cause]||CAUSE_STYLES['Healthcare']
              const isSel = selCharity===charity._id
              return (
                <motion.div key={charity._id} whileHover={{ y:-3 }}
                  style={{ background:'#FFFFFF', borderRadius:'var(--radius-lg)', padding:22, border:`1.5px solid ${isSel?cs.color:'var(--border)'}`, cursor:'pointer', transition:'all 0.2s', boxShadow:isSel?`0 6px 24px ${cs.color}25`:'var(--shadow-sm)' }}
                  onClick={()=>selectCharity(charity._id)}>
                  <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:14 }}>
                    <div style={{ width:46, height:46, borderRadius:12, background:cs.bg, border:`1.5px solid ${cs.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>{charity.logo}</div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem' }}>{charity.name}</p>
                        {charity.verified && <CheckCircle2 size={14} color="#00C896"/>}
                      </div>
                      <span style={{ padding:'2px 9px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, background:cs.bg, color:cs.color, border:`1px solid ${cs.border}` }}>{charity.cause}</span>
                    </div>
                    {isSel && (
                      <div style={{ marginLeft:'auto', width:22, height:22, borderRadius:'50%', background:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <CheckCircle2 size={13} color="white"/>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize:'0.8125rem', color:'var(--text-2)', lineHeight:1.55, marginBottom:14 }}>{charity.description}</p>
                  <button style={{ width:'100%', padding:'9px', borderRadius:10, fontSize:'0.8125rem', fontWeight:700, cursor:'pointer', border:`1.5px solid ${isSel?cs.color:'var(--border)'}`, background:isSel?cs.bg:'var(--surface)', color:isSel?cs.color:'var(--text-2)', transition:'all 0.15s' }}>
                    {isSel ? '✓ Selected for penalties' : 'Select for penalties'}
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* History */}
        {activeTab==='history' && (
          <motion.div key="hi" initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className="card" style={{ overflow:'hidden' }}>
            {donations.length===0 ? (
              <div style={{ padding:'48px', textAlign:'center' }}>
                <Heart size={32} color="var(--text-4)" style={{ margin:'0 auto 14px', display:'block' }}/>
                <p style={{ fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>No donation history</p>
                <p style={{ fontSize:'0.875rem', color:'var(--text-3)' }}>Donations are recorded when budgets are exceeded</p>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Charity</th><th>Cause</th><th>Reason</th><th>Date</th><th style={{ textAlign:'right' }}>Amount</th></tr></thead>
                <tbody>
                  {donations.map((d,i)=>{
                    const cs = CAUSE_STYLES[d.cause]||CAUSE_STYLES['Healthcare']
                    return (
                      <tr key={d._id||i}>
                        <td style={{ fontWeight:600, color:'var(--text-1)' }}>{d.charity}</td>
                        <td><span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, background:cs.bg, color:cs.color, border:`1px solid ${cs.border}` }}>{d.cause}</span></td>
                        <td style={{ color:'var(--text-3)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.trigger}</td>
                        <td style={{ color:'var(--text-3)', whiteSpace:'nowrap' }}>{formatDate(d.date)}</td>
                        <td style={{ textAlign:'right', fontWeight:700, color:'#E91E63' }}>₹{d.amount}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
