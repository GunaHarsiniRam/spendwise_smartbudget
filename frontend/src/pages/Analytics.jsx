import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { useUserData } from '../context/UserDataContext'
import { formatCurrency } from '../utils/helpers'

const PIE_COLORS = ['#7C5CFC','#00C896','#FFB300','#FF4757','#2196F3','#E91E63','#FF7043','#3F51B5']

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', marginBottom:6 }}>{label}</p>
      {payload.map((e,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:e.color }}/>
          <span style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.75rem' }}>{e.name}:</span>
          <span style={{ color:'#fff', fontWeight:600, fontSize:'0.8125rem' }}>₹{e.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const stag = { hidden:{opacity:0}, show:{ opacity:1, transition:{ staggerChildren:0.07 } } }
const it   = { hidden:{opacity:0,y:14}, show:{ opacity:1, y:0, transition:{ duration:0.25 } } }

export default function Analytics() {
  const { monthlySpending, budgets, expenses, goals, aiInsights, totalDonated } = useUserData()
  const [range, setRange] = useState('6m')

  const totalSaved = monthlySpending.reduce((s,m)=>s+m.savings, 0)
  const avgSaved   = monthlySpending.length>0 ? Math.round(totalSaved/monthlySpending.length) : 0
  const hitRate    = budgets.length>0 ? Math.round((budgets.filter(b=>b.spent<=b.limit).length/budgets.length)*100) : 100
  const hasData    = monthlySpending.length > 0

  const catData = Object.entries(
    expenses.reduce((acc,e)=>{ acc[e.category]=(acc[e.category]||0)+e.amount; return acc }, {})
  ).map(([name,value])=>({ name, value })).sort((a,b)=>b.value-a.value)

  const KPIS = [
    { label:'Total Saved',     value:formatCurrency(totalSaved),  icon:TrendingUp,    color:'#00C896', bg:'var(--accent-light)', sub:'From tracked expenses' },
    { label:'Monthly Average', value:formatCurrency(avgSaved),    icon:TrendingUp,    color:'#7C5CFC', bg:'var(--brand-light)', sub:'Average monthly savings' },
    { label:'Budget Hit Rate', value:`${hitRate}%`,               icon:CheckCircle2,  color:'#FFB300', bg:'var(--warning-light)', sub:'Budgets kept on track' },
    { label:'Total Donated',   value:formatCurrency(totalDonated),icon:TrendingDown,  color:'#E91E63', bg:'#FCE4EC', sub:'Via accountability' },
  ]

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <motion.div variants={it} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle">Your personalised financial analytics and recommendations</p>
        </div>
        <div style={{ display:'flex', gap:4, background:'#FFFFFF', border:'1.5px solid var(--border)', borderRadius:12, padding:4 }}>
          {['1m','3m','6m','1y'].map(r=>(
            <button key={r} onClick={()=>setRange(r)}
              style={{ padding:'6px 14px', borderRadius:9, fontSize:'0.8125rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.15s',
                background:range===r?'var(--brand)':'transparent', color:range===r?'white':'var(--text-3)',
                boxShadow:range===r?'0 3px 10px rgba(124,92,252,0.35)':'none' }}>
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div variants={it} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(165px,1fr))', gap:14 }}>
        {KPIS.map((k,i)=>(
          <div key={i} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', fontWeight:500 }}>{k.label}</p>
              <div style={{ width:34, height:34, borderRadius:9, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <k.icon size={17} color={k.color} strokeWidth={2}/>
              </div>
            </div>
            <p style={{ fontSize:'1.5rem', fontWeight:800, color:k.color, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>{k.value}</p>
            <p style={{ fontSize:'0.75rem', color:'var(--text-4)' }}>{k.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Empty state */}
      {!hasData && (
        <motion.div variants={it} style={{ background:'#FFFFFF', border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)', padding:'52px 32px', textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'var(--brand-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
            <TrendingUp size={24} color="var(--brand)" strokeWidth={1.5}/>
          </div>
          <h3 style={{ fontSize:'1.0625rem', fontWeight:700, color:'var(--text-1)', marginBottom:8 }}>No data yet</h3>
          <p style={{ color:'var(--text-3)', fontSize:'0.9rem', lineHeight:1.6 }}>
            Add transactions and create budgets to see your personalised analytics here.
          </p>
        </motion.div>
      )}

      {/* Spending Trend */}
      {hasData && (
        <motion.div variants={it} className="card" style={{ padding:'22px 24px' }}>
          <h3 className="section-title" style={{ marginBottom:4 }}>Spending vs Savings</h3>
          <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', marginBottom:22 }}>Monthly comparison over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlySpending} margin={{ top:4, right:4, bottom:0, left:0 }}>
              <defs>
                <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C5CFC" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gSave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00C896" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#00C896" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:12, fill:'var(--text-4)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:12, fill:'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}K`}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="spending" name="Spending" stroke="#7C5CFC" strokeWidth={2.5} fill="url(#gSpend)" dot={false} activeDot={{ r:5, fill:'#7C5CFC', strokeWidth:0 }}/>
              <Area type="monotone" dataKey="savings"  name="Savings"  stroke="#00C896" strokeWidth={2.5} fill="url(#gSave)"  dot={false} activeDot={{ r:5, fill:'#00C896', strokeWidth:0 }}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:20, marginTop:12 }}>
            {[{c:'#7C5CFC',l:'Spending'},{c:'#00C896',l:'Savings'}].map((leg,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:16, height:3, background:leg.c, borderRadius:2 }}/>
                <span style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>{leg.l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Budget vs Actual + Category Pie */}
      {hasData && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
          {budgets.length > 0 && (
            <motion.div variants={it} className="card" style={{ padding:'22px 24px' }}>
              <h3 className="section-title" style={{ marginBottom:4 }}>Budget vs Actual</h3>
              <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', marginBottom:22 }}>Spending against limits</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={budgets.map(b=>({ name:b.category.slice(0,5), budget:b.limit, spent:b.spent }))} barGap={4} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--text-4)' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'var(--text-4)' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}K`}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Bar dataKey="budget" name="Budget" fill="#EDE9FF" radius={[5,5,0,0]}/>
                  <Bar dataKey="spent"  name="Spent"  radius={[5,5,0,0]}>
                    {budgets.map((b,i)=>(
                      <Cell key={i} fill={b.spent>b.limit?'#FF4757':'#7C5CFC'}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:14, marginTop:10, flexWrap:'wrap' }}>
                {[{c:'#EDE9FF',l:'Budget'},{c:'#7C5CFC',l:'Within'},{c:'#FF4757',l:'Exceeded'}].map((leg,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:leg.c }}/>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{leg.l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {catData.length > 0 && (
            <motion.div variants={it} className="card" style={{ padding:'22px 24px' }}>
              <h3 className="section-title" style={{ marginBottom:4 }}>Spending by Category</h3>
              <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', marginBottom:16 }}>Where your money goes</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={2} dataKey="value">
                    {catData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={v=>[`₹${v.toLocaleString()}`,'']} contentStyle={{ background:'#13122B', border:'none', borderRadius:10, fontSize:12, color:'#fff' }}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                {catData.slice(0,4).map((d,i)=>(
                  <div key={d.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }}/>
                      <span style={{ fontSize:'0.8125rem', color:'var(--text-2)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--text-1)' }}>₹{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Goals progress */}
      {goals.length > 0 && (
        <motion.div variants={it} className="card" style={{ padding:'22px 24px' }}>
          <h3 className="section-title" style={{ marginBottom:20 }}>Goals Progress</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {goals.map(g=>{
              const pct = Math.min(Math.round((g.currentAmount/g.targetAmount)*100), 100)
              const c   = g.color || '#7C5CFC'
              return (
                <div key={g._id}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-1)' }}>{g.name}</span>
                    <span style={{ fontSize:'0.875rem', fontWeight:700, color:c }}>{pct}%</span>
                  </div>
                  <div className="progress-bar" style={{ height:8 }}>
                    <motion.div className="progress-fill" initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1.1, ease:'easeOut' }}
                      style={{ background:`linear-gradient(90deg,${c}BB,${c})` }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>₹{g.currentAmount.toLocaleString()} saved</span>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>₹{g.targetAmount.toLocaleString()} target</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* AI Recommendations */}
      {aiInsights.length > 0 && (
        <motion.div variants={it} className="card" style={{ padding:'22px 24px' }}>
          <h3 className="section-title" style={{ marginBottom:4 }}>Smart Recommendations</h3>
          <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', marginBottom:20 }}>Personalised tips based on your spending patterns</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {aiInsights.map((ins,i)=>{
              const styles = {
                warning: { border:'#FFE082', bg:'var(--warning-light)', icon:<AlertCircle size={16} color="#FFB300"/>, textC:'#92400E' },
                success: { border:'#A7F3D0', bg:'var(--accent-light)',  icon:<CheckCircle2 size={16} color="#00C896"/>, textC:'#00A87D' },
                info:    { border:'#BBDEFB', bg:'#E3F2FD',              icon:<TrendingUp size={16} color="#2196F3"/>,   textC:'#1565C0' },
              }
              const s = styles[ins.type] || styles.info
              return (
                <div key={ins.id||i} style={{ padding:'14px 16px', borderRadius:12, background:s.bg, border:`1.5px solid ${s.border}`, display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{ flexShrink:0, marginTop:1 }}>{s.icon}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.875rem', marginBottom:3 }}>{ins.title}</p>
                    <p style={{ fontSize:'0.8125rem', color:'var(--text-2)', lineHeight:1.55 }}>{ins.message}</p>
                    {ins.saving>0 && <p style={{ fontSize:'0.8125rem', fontWeight:700, color:s.textC, marginTop:6 }}>Potential saving: ₹{ins.saving.toLocaleString()}/month</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

    </motion.div>
  )
}
