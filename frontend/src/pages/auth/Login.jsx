import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, TrendingUp, ArrowRight, CheckCircle, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]         = useState({ email:'', password:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setLoading(true)
    try {
      await login('demo@spendwise.in', 'demo123')
      toast.success('Signed in as demo user')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#0D0B26' }}>
      {/* LEFT — branding */}
      <div style={{ width:'50%', display:'none', flexDirection:'column', justifyContent:'space-between', padding:'52px 56px', position:'relative', overflow:'hidden', background:'linear-gradient(145deg,#0D0B26 0%,#1A1040 40%,#0D0B26 100%)' }} className="login-left">
        <style>{`.login-left{display:none}@media(min-width:900px){.login-left{display:flex!important}}`}</style>

        {/* Orbs */}
        <div style={{ position:'absolute', top:-100, right:-80, width:400, height:400, borderRadius:'50%', background:'rgba(124,92,252,0.15)', filter:'blur(80px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-100, left:-60, width:320, height:320, borderRadius:'50%', background:'rgba(0,200,150,0.1)', filter:'blur(70px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'40%', left:'40%', width:200, height:200, borderRadius:'50%', background:'rgba(255,71,87,0.08)', filter:'blur(60px)', pointerEvents:'none' }}/>

        {/* Logo */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:60 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#7C5CFC,#9B7BFF)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 28px rgba(124,92,252,0.5)' }}>
              <TrendingUp size={22} color="white" strokeWidth={2.5}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:'1.2rem', color:'#FFFFFF', letterSpacing:'-0.02em' }}>SpendWise</div>
              <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', fontWeight:500 }}>Personal Finance Dashboard</div>
            </div>
          </div>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            <p style={{ color:'rgba(124,92,252,0.8)', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14 }}>Smart Finance</p>
            <h2 style={{ fontSize:'2.6rem', fontWeight:900, color:'#FFFFFF', letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:16 }}>
              Take control of<br/>
              <span style={{ background:'linear-gradient(90deg,#7C5CFC,#00C896)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                your money.
              </span>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'1rem', lineHeight:1.7, maxWidth:380, marginBottom:40 }}>
              The personal finance dashboard that grows with your habits and helps you hit every goal.
            </p>
          </motion.div>

          {/* Feature list */}
          {[
            { icon:'💸', label:'Smart Expense Tracking',    desc:'Auto-categorise every spend instantly' },
            { icon:'🎯', label:'Goal-Based Savings',         desc:'Set targets and track daily progress' },
            { icon:'🤖', label:'AI Financial Coach',         desc:'Personalised insights just for you' },
            { icon:'❤️', label:'Charity Accountability',    desc:'Over-spending funds causes you love' },
          ].map((f,i) => (
            <motion.div key={i} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4+i*0.1 }}
              style={{ display:'flex', gap:14, marginBottom:20, alignItems:'center' }}>
              <div style={{ width:44, height:44, borderRadius:13, background:'rgba(124,92,252,0.12)', border:'1px solid rgba(124,92,252,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{f.icon}</div>
              <div>
                <div style={{ color:'rgba(255,255,255,0.9)', fontWeight:700, fontSize:'0.9375rem', marginBottom:2 }}>{f.label}</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.8125rem' }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
          style={{ position:'relative', zIndex:1, display:'flex', gap:40, paddingTop:32, borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          {[{val:'50K+',lbl:'Users'},{val:'₹2.4Cr',lbl:'Saved'},{val:'₹18L',lbl:'Donated'}].map((s,i) => (
            <div key={i}>
              <div style={{ fontSize:'1.6rem', fontWeight:900, color:'#FFFFFF', letterSpacing:'-0.02em' }}>{s.val}</div>
              <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.4)', marginTop:3, fontWeight:500 }}>{s.lbl}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'var(--surface)', overflowY:'auto' }}>
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ width:'100%', maxWidth:420 }}>

          {/* Mobile logo */}
          <div className="login-logo-mobile" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36 }}>
            <style>{`.login-logo-mobile{display:flex}@media(min-width:900px){.login-logo-mobile{display:none}}`}</style>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#7C5CFC,#9B7BFF)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(124,92,252,0.4)' }}>
              <TrendingUp size={20} color="white" strokeWidth={2.5}/>
            </div>
            <span style={{ fontWeight:800, fontSize:'1.125rem', color:'var(--text-1)', letterSpacing:'-0.02em' }}>SpendWise</span>
          </div>

          <h2 style={{ fontSize:'1.875rem', fontWeight:800, color:'var(--text-1)', letterSpacing:'-0.03em', marginBottom:8 }}>Welcome back</h2>
          <p style={{ color:'var(--text-3)', fontSize:'0.9375rem', marginBottom:28 }}>Sign in to your finance dashboard</p>

          {/* Demo CTA */}
          <motion.button onClick={handleDemo} disabled={loading} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            style={{ width:'100%', padding:'13px 20px', borderRadius:14, background:'linear-gradient(135deg,#7C5CFC,#9B7BFF)', border:'none', color:'white', fontWeight:700, fontSize:'0.9375rem', cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:9, boxShadow:'0 8px 28px rgba(124,92,252,0.4)', transition:'all 0.2s', opacity:loading?0.7:1 }}>
            {loading ? <div className="animate-spin" style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white' }}/> : <><Zap size={16} strokeWidth={2.5}/> Continue as Demo User</>}
          </motion.button>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
            <span style={{ color:'var(--text-4)', fontSize:'0.8125rem', fontWeight:500 }}>or sign in with email</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label className="field-label">Email address</label>
              <input type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="you@example.com" className="input"/>
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <label className="field-label" style={{ margin:0 }}>Password</label>
                <button type="button" style={{ fontSize:'0.8125rem', color:'var(--brand)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Forgot?</button>
              </div>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} placeholder="Your password" className="input" style={{ paddingRight:44 }}/>
                <button type="button" onClick={() => setShowPass(p=>!p)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)' }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
              className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'0.9375rem', opacity:loading?0.7:1 }}>
              {loading ? <div className="animate-spin" style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white' }}/> : <>Sign In <ArrowRight size={16}/></>}
            </motion.button>
          </form>

          <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:8 }}>
            {['No setup required for demo','All features unlocked instantly','Real expense data pre-loaded'].map((t,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <CheckCircle size={14} color="var(--accent)"/>
                <span style={{ fontSize:'0.8125rem', color:'var(--text-3)' }}>{t}</span>
              </div>
            ))}
          </div>

          <p style={{ textAlign:'center', color:'var(--text-3)', fontSize:'0.875rem', marginTop:28 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--brand)', fontWeight:700, textDecoration:'none' }}>Create account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
