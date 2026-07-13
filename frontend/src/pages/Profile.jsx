import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Lock, Bell, User, Mail, Phone, Shield, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useUserData } from '../context/UserDataContext'

const stag = { hidden:{opacity:0}, show:{ opacity:1, transition:{ staggerChildren:0.07 } } }
const it   = { hidden:{opacity:0,y:12}, show:{ opacity:1, y:0, transition:{ duration:0.22 } } }

const TABS = [
  { id:'profile',       label:'Profile',       icon:User },
  { id:'security',      label:'Security',      icon:Lock },
  { id:'notifications', label:'Notifications', icon:Bell },
  { id:'achievements',  label:'Achievements',  icon:Shield },
]

const LEVELS = [
  { name:'Beginner',    min:0,  max:20, color:'#9E9E9E' },
  { name:'Explorer',    min:20, max:40, color:'#2196F3' },
  { name:'Smart',       min:40, max:60, color:'#00C896' },
  { name:'Builder',     min:60, max:80, color:'#7C5CFC' },
  { name:'Master',      min:80, max:101,color:'#FFB300' },
]
const getLevel = s => LEVELS.find(l=>s>=l.min&&s<l.max)||LEVELS[4]

export default function Profile() {
  const { user } = useAuth()
  const { profile, badges, updateProfile, walletBalance, totalDonated } = useUserData()

  const [tab, setTab]     = useState('profile')
  const [saving, setSaving] = useState(false)
  const [form, setForm]   = useState({
    name:         profile?.name  || user?.name  || '',
    email:        profile?.email || user?.email || '',
    phone:        profile?.phone || user?.phone || '',
    monthlyIncome:profile?.monthlyIncome || '',
  })
  const [notifs, setNotifs] = useState(profile?.notifications || {
    budgetAlert:true, goalMilestone:true, donation:true, aiInsights:true, weeklyReport:true, monthlyReview:false,
  })

  const score   = profile?.financialHealthScore || 0
  const streak  = profile?.streak || 0
  const earned  = (badges||[]).filter(b=>b.earned)
  const locked  = (badges||[]).filter(b=>!b.earned)
  const level   = getLevel(score)
  const levelIdx= LEVELS.indexOf(level)
  const levelPct= ((score-level.min)/(level.max-level.min))*100

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r=>setTimeout(r,600))
    updateProfile({ ...form, monthlyIncome: parseFloat(form.monthlyIncome) || 0 })
    setSaving(false)
    toast.success('Profile updated!')
  }

  const STAT_ROW = [
    { label:'Financial Score', value:`${score}/100`, color:'#7C5CFC' },
    { label:'Day Streak',      value:`${streak}d`,   color:'#FFB300' },
    { label:'Donated',         value:`₹${totalDonated}`, color:'#E91E63' },
    { label:'Wallet',          value:`₹${walletBalance}`, color:'#00C896' },
    { label:'Badges',          value:earned.length,  color:'#FF7043' },
  ]

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Hero card */}
      <motion.div variants={it}>
        <div style={{ background:'linear-gradient(135deg,#0D0B26 0%,#1A1040 40%,#0F2318 100%)', borderRadius:'var(--radius-xl)', padding:'28px 32px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(124,92,252,0.15)', filter:'blur(50px)', pointerEvents:'none' }}/>
          <div style={{ position:'relative', display:'flex', flexWrap:'wrap', gap:24, alignItems:'flex-start' }}>

            {/* Avatar */}
            <div style={{ width:72, height:72, borderRadius:18, background:'linear-gradient(135deg,#7C5CFC,#00C896)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'1.75rem', flexShrink:0, boxShadow:'0 8px 28px rgba(124,92,252,0.5)', letterSpacing:'-0.02em' }}>
              {(form.name||user?.name||'U').charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:200 }}>
              <h2 style={{ fontSize:'1.375rem', fontWeight:800, color:'white', letterSpacing:'-0.02em', marginBottom:4 }}>{form.name||user?.name||'User'}</h2>
              <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.45)', marginBottom:16 }}>{form.email||user?.email||''}</p>

              {/* Level */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <span style={{ padding:'3px 12px', borderRadius:99, fontSize:'0.75rem', fontWeight:700, background:`${level.color}20`, color:level.color, border:`1px solid ${level.color}40` }}>
                  Level {levelIdx+1} · {level.name}
                </span>
              </div>
              <div style={{ maxWidth:280 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', fontWeight:600 }}>Level progress</span>
                  <span style={{ fontSize:'0.72rem', color:level.color, fontWeight:700 }}>{Math.round(levelPct)}%</span>
                </div>
                <div style={{ height:6, borderRadius:99, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${levelPct}%` }} transition={{ duration:1.2, ease:'easeOut' }}
                    style={{ height:'100%', borderRadius:99, background:level.color, boxShadow:`0 0 8px ${level.color}80` }}/>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, width:'100%', paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.08)', marginTop:4 }}>
              {STAT_ROW.map((s,i)=>(
                <div key={i} style={{ textAlign:'center', padding:'10px 6px', borderRadius:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize:'1.1rem', fontWeight:800, color:s.color, letterSpacing:'-0.01em', marginBottom:4 }}>{s.value}</p>
                  <p style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.35)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={it}>
        <div style={{ display:'flex', gap:4, background:'#FFFFFF', border:'1.5px solid var(--border)', borderRadius:12, padding:4, width:'fit-content', flexWrap:'wrap' }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, fontSize:'0.875rem', fontWeight:tab===t.id?700:500, cursor:'pointer', border:'none', transition:'all 0.15s',
                background:tab===t.id?'var(--brand)':'transparent', color:tab===t.id?'white':'var(--text-3)',
                boxShadow:tab===t.id?'0 3px 10px rgba(124,92,252,0.35)':'none' }}>
              <t.icon size={15}/> {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Profile tab */}
      {tab==='profile' && (
        <motion.div variants={it} className="card" style={{ padding:'24px 26px', display:'flex', flexDirection:'column', gap:18 }}>
          <h3 className="section-title">Personal Information</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:16 }}>
            {[
              { label:'Full Name',           key:'name',          type:'text',   ph:'Your name' },
              { label:'Email Address',       key:'email',         type:'email',  ph:'you@example.com' },
              { label:'Phone Number',        key:'phone',         type:'tel',    ph:'+91 98765 43210' },
              { label:'Monthly Income (₹)',  key:'monthlyIncome', type:'number', ph:'30000' },
            ].map(f=>(
              <div key={f.key}>
                <label className="field-label">{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} className="input"/>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ width:'fit-content' }}>
            {saving ? <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin 0.7s linear infinite' }}/> : <Save size={15}/>}
            {saving?'Saving…':'Save Changes'}
          </button>
        </motion.div>
      )}

      {/* Security tab */}
      {tab==='security' && (
        <motion.div variants={it} className="card" style={{ padding:'24px 26px', display:'flex', flexDirection:'column', gap:16 }}>
          <h3 className="section-title">Change Password</h3>
          {['Current Password','New Password','Confirm New Password'].map((l,i)=>(
            <div key={i}><label className="field-label">{l}</label><input type="password" placeholder="••••••••" className="input"/></div>
          ))}
          <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--brand-light)', border:'1.5px solid #D8D0FF', fontSize:'0.8125rem', color:'var(--brand-dark)', lineHeight:1.6 }}>
            Use at least 8 characters including uppercase, lowercase, numbers and symbols for a strong password.
          </div>
          <button onClick={()=>toast.success('Password updated!')} className="btn-primary" style={{ width:'fit-content' }}>
            <Lock size={15}/> Update Password
          </button>
        </motion.div>
      )}

      {/* Notifications tab */}
      {tab==='notifications' && (
        <motion.div variants={it} className="card" style={{ padding:'24px 26px', display:'flex', flexDirection:'column', gap:10 }}>
          <h3 className="section-title" style={{ marginBottom:6 }}>Notification Preferences</h3>
          {[
            { k:'budgetAlert',   l:'Budget Alerts',      d:'Notify when 80% of a budget is used' },
            { k:'goalMilestone', l:'Goal Milestones',    d:'Celebrate progress on savings goals' },
            { k:'donation',      l:'Donation Receipts',  d:'Confirm when charity donations are sent' },
            { k:'aiInsights',    l:'AI Coach Tips',      d:'Daily personalised financial insights' },
            { k:'weeklyReport',  l:'Weekly Summary',     d:'Financial overview every Sunday' },
            { k:'monthlyReview', l:'Monthly Report',     d:'Detailed analysis at month end' },
          ].map(n=>(
            <div key={n.k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', borderRadius:11, background:'var(--surface)', border:'1.5px solid var(--border)', transition:'all 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--brand-light)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--surface)'}>
              <div>
                <p style={{ fontWeight:600, color:'var(--text-1)', fontSize:'0.875rem' }}>{n.l}</p>
                <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:2 }}>{n.d}</p>
              </div>
              <motion.button onClick={()=>setNotifs(p=>({...p,[n.k]:!p[n.k]}))}
                style={{ width:46, height:24, borderRadius:99, background:notifs[n.k]?'var(--brand)':'var(--border)', border:'none', cursor:'pointer', position:'relative', transition:'background 0.22s', flexShrink:0 }}>
                <motion.div animate={{ x:notifs[n.k]?22:2 }} transition={{ type:'spring', stiffness:400, damping:24 }}
                  style={{ width:19, height:19, background:'white', borderRadius:'50%', position:'absolute', top:2.5, boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }}/>
              </motion.button>
            </div>
          ))}
          <button onClick={()=>{ updateProfile({notifications:notifs}); toast.success('Preferences saved!') }}
            className="btn-primary" style={{ width:'fit-content', marginTop:4 }}>
            <Bell size={15}/> Save Preferences
          </button>
        </motion.div>
      )}

      {/* Achievements tab */}
      {tab==='achievements' && (
        <motion.div variants={it} style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card" style={{ padding:'22px 24px' }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Earned ({earned.length})</h3>
            {earned.length===0 ? (
              <div style={{ textAlign:'center', padding:'32px', color:'var(--text-3)' }}>
                <Shield size={32} color="var(--text-4)" style={{ margin:'0 auto 12px', display:'block' }}/>
                <p style={{ fontWeight:600, marginBottom:6, color:'var(--text-2)' }}>No achievements yet</p>
                <p style={{ fontSize:'0.875rem' }}>Log expenses, create budgets and hit goals to unlock achievements</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
                {earned.map((b,i)=>(
                  <motion.div key={b.id} whileHover={{ scale:1.04, y:-3 }}
                    style={{ padding:'18px 14px', borderRadius:12, border:'1.5px solid var(--border)', textAlign:'center', background:'#FFFFFF', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--brand),#9B7BFF)' }}/>
                    <div style={{ fontSize:'2rem', marginBottom:8 }}>{b.icon}</div>
                    <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.8125rem', marginBottom:4 }}>{b.name}</p>
                    <p style={{ fontSize:'0.72rem', color:'var(--text-3)', lineHeight:1.4 }}>{b.description}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          {locked.length > 0 && (
            <div className="card" style={{ padding:'22px 24px' }}>
              <h3 className="section-title" style={{ marginBottom:16, color:'var(--text-3)' }}>Locked ({locked.length})</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
                {locked.map(b=>(
                  <div key={b.id} style={{ padding:'18px 14px', borderRadius:12, border:'1.5px dashed var(--border)', textAlign:'center', background:'var(--surface)', opacity:0.55 }}>
                    <div style={{ fontSize:'2rem', marginBottom:8, filter:'grayscale(1)' }}>🔒</div>
                    <p style={{ fontWeight:600, color:'var(--text-2)', fontSize:'0.8125rem', marginBottom:4 }}>{b.name}</p>
                    <p style={{ fontSize:'0.72rem', color:'var(--text-3)', lineHeight:1.4 }}>{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  )
}
