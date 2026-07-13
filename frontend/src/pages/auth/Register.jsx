import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, TrendingUp, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm]         = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Please fill required fields'); return }
    if (form.password !== form.confirmPassword)       { toast.error('Passwords do not match'); return }
    if (form.password.length < 6)                    { toast.error('Password must be 6+ characters'); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to SpendWise.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface)', padding:'32px 16px' }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        style={{ width:'100%', maxWidth:460 }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
          <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,#7C5CFC,#9B7BFF)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(124,92,252,0.4)' }}>
            <TrendingUp size={21} color="white" strokeWidth={2.5}/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--text-1)', letterSpacing:'-0.02em', lineHeight:1.1 }}>SpendWise</div>
            <div style={{ fontSize:'0.68rem', color:'var(--text-4)', fontWeight:500 }}>Personal Finance Dashboard</div>
          </div>
        </div>

        <h2 style={{ fontSize:'1.875rem', fontWeight:800, color:'var(--text-1)', letterSpacing:'-0.03em', marginBottom:8 }}>Create your account</h2>
        <p style={{ color:'var(--text-3)', fontSize:'0.9375rem', marginBottom:28 }}>Free forever. No credit card required.</p>

        {/* Card */}
        <div style={{ background:'#FFFFFF', border:'1.5px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'28px 28px', boxShadow:'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div>
                <label className="field-label">Full Name *</label>
                <input type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Dhanishka" required className="input"/>
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+91 98765 43210" className="input"/>
              </div>
            </div>

            <div>
              <label className="field-label">Email Address *</label>
              <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="you@example.com" required className="input"/>
            </div>

            <div>
              <label className="field-label">Password *</label>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="Minimum 6 characters" required className="input" style={{ paddingRight:44 }}/>
                <button type="button" onClick={()=>setShowPass(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)' }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <div>
              <label className="field-label">Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={e=>setForm(p=>({...p,confirmPassword:e.target.value}))} placeholder="Repeat password" required className="input"/>
            </div>

            <p style={{ fontSize:'0.78rem', color:'var(--text-3)', lineHeight:1.5 }}>
              By creating an account you agree to our{' '}
              <span style={{ color:'var(--brand)', cursor:'pointer', fontWeight:600 }}>Terms</span> and{' '}
              <span style={{ color:'var(--brand)', cursor:'pointer', fontWeight:600 }}>Privacy Policy</span>.
            </p>

            <motion.button type="submit" disabled={loading} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
              className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'0.9375rem', opacity:loading?0.7:1 }}>
              {loading
                ? <div className="animate-spin" style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white' }}/>
                : <>Create Account <ArrowRight size={16}/></>}
            </motion.button>
          </form>
        </div>

        <p style={{ textAlign:'center', color:'var(--text-3)', fontSize:'0.875rem', marginTop:22 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--brand)', fontWeight:700, textDecoration:'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
