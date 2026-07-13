import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Heart, BarChart3, Shield, Eye, Trash2, CheckCircle, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { mockCharities } from '../utils/mockData'

const USERS = [
  { id:1, name:'Arjun Sharma',  email:'arjun@example.com',  joined:'2024-01-15', score:74, donated:47,  status:'active' },
  { id:2, name:'Priya Mehta',   email:'priya@example.com',  joined:'2024-02-10', score:88, donated:120, status:'active' },
  { id:3, name:'Rahul Kumar',   email:'rahul@example.com',  joined:'2024-03-05', score:52, donated:25,  status:'active' },
  { id:4, name:'Sneha Patel',   email:'sneha@example.com',  joined:'2024-03-20', score:91, donated:200, status:'active' },
  { id:5, name:'Vikram Singh',  email:'vikram@example.com', joined:'2024-04-01', score:63, donated:15,  status:'inactive' },
]

const PLATFORM = [
  { month:'Jan', users:1200,  donations:1800 },
  { month:'Feb', users:2800,  donations:3200 },
  { month:'Mar', users:5200,  donations:6800 },
  { month:'Apr', users:8900,  donations:11200 },
  { month:'May', users:14000, donations:18500 },
  { month:'Jun', users:21000, donations:27000 },
]

const ACTIVITY = [
  { time:'2 min ago',  text:'Priya exceeded Shopping by 22%',         type:'violation', badge:'₹10 donated' },
  { time:'8 min ago',  text:'New user registered: Vikram Singh',       type:'signup',    badge:null },
  { time:'15 min ago', text:'Rahul completed Emergency Fund goal! 🎉',  type:'goal',      badge:null },
  { time:'32 min ago', text:'Donation batch sent to Akshaya Patra',    type:'donation',  badge:'₹245 total' },
  { time:'1 hr ago',   text:'Arjun deposited ₹500 to wallet',          type:'wallet',    badge:null },
]

const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'white', border:'2px solid #F0E6FF', borderRadius:14, padding:'10px 14px', fontSize:"0.92rem", boxShadow:'0 8px 28px rgba(139,90,246,0.15)' }}>
      <div style={{ color:'#9580B8', marginBottom:6, fontWeight:700 }}>{label}</div>
      {payload.map((e,i)=>(
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'2px 0' }}>
          <div style={{ width:8, height:8, borderRadius:2, background:e.color }} />
          <span style={{ fontWeight:900, color:e.color, fontFamily:'Nunito, sans-serif' }}>{e.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const stagger = { hidden:{opacity:0}, show:{ opacity:1, transition:{ staggerChildren:0.07 } } }
const item    = { hidden:{opacity:0, y:18}, show:{ opacity:1, y:0, transition:{ type:'spring', stiffness:260, damping:22 } } }

export default function AdminPanel() {
  const [tab, setTab]     = useState('overview')
  const [users, setUsers] = useState(USERS)

  const KPIS = [
    { emoji:'👥', label:'Total Users',     value:'21,000+', sub:'+18% this month', color:'#7C3AED', bg:'#F3EEFF', border:'#E0CCFF' },
    { emoji:'💳', label:'Transactions',    value:'78K+',    sub:'+23% this month', color:'#0EA5E9', bg:'#EFF6FF', border:'#BFDBFE' },
    { emoji:'❤️', label:'Total Donated',  value:'₹27L',    sub:'+31% this month', color:'#FF6B6B', bg:'#FFF0F0', border:'#FECDD3' },
    { emoji:'💪', label:'Avg Health Score',value:'72/100',  sub:'+4 pts this month',color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
  ]

  const TABS = [
    { id:'overview',  label:'Overview',   emoji:'📊' },
    { id:'users',     label:'Users',      emoji:'👥' },
    { id:'charities', label:'Charities',  emoji:'❤️' },
    { id:'donations', label:'Donations',  emoji:'💝' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Header */}
      <motion.div variants={item} style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:52, height:52, borderRadius:18, background:'linear-gradient(135deg,#FF6B6B,#E11D48)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:"1.6rem", boxShadow:'0 6px 20px rgba(244,63,94,0.4)' }}>🛡️</div>
        <div>
          <span className="section-label" style={{ marginBottom:4, color:'#FF6B6B' }}>Admin Panel</span>
          <h1 style={{ fontSize:"1.5rem", fontWeight:900, color:'#2D1B69', fontFamily:'Nunito, sans-serif', margin:0 }}>Platform Management</h1>
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div variants={item} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
        {KPIS.map((k,i) => (
          <motion.div key={i} whileHover={{ y:-4 }}
            style={{ padding:'18px 16px', borderRadius:20, background:k.bg, border:`2px solid ${k.border}`, textAlign:'center' }}>
            <div style={{ fontSize:"1.75rem" }}>{k.emoji}</div>
            <div style={{ fontSize:"1.5rem", fontWeight:900, color:k.color, fontFamily:'Nunito, sans-serif', margin:'6px 0 3px' }}>{k.value}</div>
            <div style={{ fontSize:"0.88rem", color:'#6B5A8A', fontWeight:700 }}>{k.label}</div>
            <div style={{ fontSize:"0.82rem", color:'#9580B8', fontWeight:600, marginTop:2 }}>{k.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <div style={{ display:'flex', gap:6, padding:'6px', borderRadius:18, background:'white', border:'2px solid #F0E6FF', width:'fit-content', flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ padding:'9px 16px', borderRadius:12, fontSize:"0.97rem", fontWeight:800, cursor:'pointer', fontFamily:'Nunito, sans-serif', transition:'all 0.2s', border:'none',
                background: tab===t.id ? 'linear-gradient(135deg,#FF6B6B,#F43F5E)' : 'transparent',
                color: tab===t.id ? 'white' : '#9580B8',
                boxShadow: tab===t.id ? '0 4px 14px rgba(244,63,94,0.35)' : 'none',
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Overview */}
      {tab==='overview' && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
            <div style={{ background:'white', borderRadius:22, padding:'22px 24px', border:'2px solid #F0E6FF' }}>
              <h3 style={{ fontSize:"1.05rem", fontWeight:900, color:'#2D1B69', fontFamily:'Nunito, sans-serif', margin:'0 0 16px' }}>👥 User Growth</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={PLATFORM}>
                  <defs><linearGradient id="gU" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F9F5FF" />
                  <XAxis dataKey="month" tick={{ fontSize:"0.88rem", fill:'#9580B8', fontWeight:700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:"0.88rem", fill:'#9580B8', fontWeight:700 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip/>} />
                  <Area type="monotone" dataKey="users" name="Users" stroke="#7C3AED" strokeWidth={2.5} fill="url(#gU)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background:'white', borderRadius:22, padding:'22px 24px', border:'2px solid #FFE8D6' }}>
              <h3 style={{ fontSize:"1.05rem", fontWeight:900, color:'#2D1B69', fontFamily:'Nunito, sans-serif', margin:'0 0 16px' }}>❤️ Donation Flow</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={PLATFORM} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFF5F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:"0.88rem", fill:'#9580B8', fontWeight:700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:"0.88rem", fill:'#9580B8', fontWeight:700 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip/>} />
                  <Bar dataKey="donations" name="Donations" fill="#FF6B6B" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background:'white', borderRadius:22, padding:'22px 24px', border:'2px solid #F0E6FF' }}>
            <h3 style={{ fontSize:"1.05rem", fontWeight:900, color:'#2D1B69', fontFamily:'Nunito, sans-serif', margin:'0 0 14px' }}>⚡ Live Activity</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {ACTIVITY.map((a,i) => {
                const colors = { violation:'#FF6B6B', donation:'#10B981', goal:'#F59E0B', signup:'#A855F7', wallet:'#6366F1' }
                const bgs    = { violation:'#FFF0F0', donation:'#ECFDF5', goal:'#FFFBEB', signup:'#F3EEFF', wallet:'#EEEEFF' }
                return (
                  <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:14, background:bgs[a.type]||'#FAFAFA', border:`2px solid ${colors[a.type]||'#E8DAFF'}20` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:colors[a.type]||'#A855F7', flexShrink:0 }} />
                    <div style={{ fontSize:"0.92rem", color:'#2D1B69', fontWeight:600, flex:1 }}>{a.text}</div>
                    {a.badge && <span style={{ fontSize:"0.88rem", fontWeight:800, color:colors[a.type], fontFamily:'Nunito, sans-serif', flexShrink:0 }}>{a.badge}</span>}
                    <span style={{ fontSize:"0.82rem", color:'#B8A0D8', fontWeight:600, flexShrink:0 }}>{a.time}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Users */}
      {tab==='users' && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          style={{ background:'white', borderRadius:22, border:'2px solid #F0E6FF', overflow:'hidden' }}>
          <div style={{ padding:'14px 22px', borderBottom:'2px solid #F9F5FF', background:'#FDFAFF' }}>
            <div style={{ fontSize:"1rem", fontWeight:900, color:'#2D1B69', fontFamily:'Nunito, sans-serif' }}>Registered Users ({users.length})</div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'2px solid #F9F5FF' }}>
                  {['User','Email','Joined','Health','Donated','Status','Actions'].map(h=>(
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:"0.82rem", fontWeight:900, color:'#B8A0D8', textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'Nunito, sans-serif', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u,i)=>(
                  <motion.tr key={u.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.05 }}
                    style={{ borderBottom:'1px solid #FBF8FF', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#FDFAFF'}
                    onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:11, background:'linear-gradient(135deg,#7C3AED,#A855F7)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:"1rem", fontFamily:'Nunito, sans-serif' }}>{u.name.charAt(0)}</div>
                        <span style={{ fontSize:"0.97rem", fontWeight:700, color:'#2D1B69' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:"0.92rem", color:'#9580B8', fontWeight:600 }}>{u.email}</td>
                    <td style={{ padding:'12px 16px', fontSize:"0.92rem", color:'#9580B8', fontWeight:600 }}>{u.joined}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ height:6, width:56, borderRadius:99, background:'#F0E6FF', overflow:'hidden' }}>
                          <div style={{ height:'100%', borderRadius:99, width:`${u.score}%`, background:'linear-gradient(90deg,#7C3AED,#A855F7)' }} />
                        </div>
                        <span style={{ fontSize:"0.92rem", fontWeight:900, color:'#7C3AED', fontFamily:'Nunito, sans-serif' }}>{u.score}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:"0.97rem", fontWeight:900, color:'#FF6B6B', fontFamily:'Nunito, sans-serif' }}>₹{u.donated}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ padding:'4px 10px', borderRadius:99, fontSize:"0.82rem", fontWeight:900, fontFamily:'Nunito, sans-serif',
                        background: u.status==='active'?'#ECFDF5':'#FFF0F0',
                        color: u.status==='active'?'#10B981':'#FF6B6B',
                        border: `2px solid ${u.status==='active'?'#A7F3D0':'#FCA5A5'}`,
                      }}>{u.status}</span>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button style={{ width:28, height:28, borderRadius:9, border:'2px solid #E0CCFF', background:'#F9F5FF', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Eye size={12} color="#7C3AED"/></button>
                        <button onClick={()=>setUsers(p=>p.filter(x=>x.id!==u.id))} style={{ width:28, height:28, borderRadius:9, border:'2px solid #FECDD3', background:'#FFF5F7', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Trash2 size={12} color="#FF6B6B"/></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Charities */}
      {tab==='charities' && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {mockCharities.map((c,i)=>(
            <motion.div key={c._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              style={{ background:'white', borderRadius:20, padding:'16px 22px', border:'2px solid #FFE8D6', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:16, background:'#FFF0F3', border:'2px solid #FECDD3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:"1.5rem", flexShrink:0 }}>{c.logo}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:"1rem", fontWeight:900, color:'#2D1B69', fontFamily:'Nunito, sans-serif' }}>{c.name}</span>
                  {c.verified && <CheckCircle size={14} color="#10B981" />}
                </div>
                <div style={{ fontSize:"0.88rem", color:'#9580B8', fontWeight:600, marginTop:2 }}>{c.description}</div>
                <span style={{ fontSize:"0.82rem", fontWeight:800, color:'#FF6B6B', fontFamily:'Nunito, sans-serif' }}>{c.cause}</span>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:"1.05rem", fontWeight:900, color:'#2D1B69', fontFamily:'Nunito, sans-serif' }}>₹{Math.floor(Math.random()*5000+1000).toLocaleString()}</div>
                <div style={{ fontSize:"0.82rem", color:'#B8A0D8', fontWeight:600 }}>Received</div>
              </div>
              <button className="btn-ghost" style={{ fontSize:"0.92rem", padding:'8px 14px', flexShrink:0 }}>Edit</button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Donations */}
      {tab==='donations' && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          style={{ background:'white', borderRadius:22, border:'2px solid #F0E6FF', overflow:'hidden' }}>
          <div style={{ padding:'14px 22px', borderBottom:'2px solid #F9F5FF' }}>
            <div style={{ fontSize:"1rem", fontWeight:900, color:'#2D1B69', fontFamily:'Nunito, sans-serif' }}>Donation Distribution Log</div>
          </div>
          {[
            { user:'Arjun Sharma',  charity:'Akshaya Patra',       cause:'Food',       amount:10, date:'2024-06-01', status:'sent' },
            { user:'Priya Mehta',   charity:'WWF India',            cause:'Environment',amount:25, date:'2024-06-02', status:'sent' },
            { user:'Rahul Kumar',   charity:'CRY India',            cause:'Education',  amount:5,  date:'2024-06-03', status:'pending' },
            { user:'Sneha Patel',   charity:'Animal Welfare Board', cause:'Animals',    amount:10, date:'2024-06-04', status:'sent' },
            { user:'Vikram Singh',  charity:'iCall India',          cause:'Healthcare', amount:1,  date:'2024-06-05', status:'sent' },
          ].map((d,i)=>(
            <motion.div key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.06 }}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 22px', borderBottom:'1px solid #FBF8FF', transition:'background 0.15s', flexWrap:'wrap' }}
              onMouseEnter={e=>e.currentTarget.style.background='#FDFAFF'}
              onMouseLeave={e=>e.currentTarget.style.background='white'}>
              <span style={{ fontSize:"0.97rem", fontWeight:800, color:'#2D1B69', fontFamily:'Nunito, sans-serif', minWidth:110 }}>{d.user}</span>
              <span style={{ fontSize:"0.92rem", color:'#6B5A8A', fontWeight:600, flex:1 }}>{d.charity}</span>
              <span style={{ fontSize:"0.88rem", color:'#A855F7', fontWeight:700, minWidth:80 }}>{d.cause}</span>
              <span style={{ fontSize:"0.88rem", color:'#B8A0D8', fontWeight:600, minWidth:80 }}>{d.date}</span>
              <span style={{ fontSize:"1rem", fontWeight:900, color:'#FF6B6B', fontFamily:'Nunito, sans-serif', minWidth:40 }}>₹{d.amount}</span>
              <span style={{ padding:'4px 10px', borderRadius:99, fontSize:"0.82rem", fontWeight:900, fontFamily:'Nunito, sans-serif',
                background: d.status==='sent'?'#ECFDF5':'#FFFBEB',
                color: d.status==='sent'?'#10B981':'#F59E0B',
                border: `2px solid ${d.status==='sent'?'#A7F3D0':'#FDE68A'}`,
              }}>{d.status}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
