import React, { useState } from 'react'
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CreditCard, PieChart, Target,
  TrendingUp, User, Shield, Bell, Menu, X,
  LogOut, ChevronRight, Wallet, Heart, Bot,
  BookOpen, GraduationCap
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useUserData } from '../../context/UserDataContext'

const NAV_ITEMS = [
  { path:'/dashboard',     icon:LayoutDashboard, label:'Dashboard',    color:'#7C5CFC' },
  { path:'/expenses',      icon:CreditCard,       label:'Transactions', color:'#FF4757' },
  { path:'/budgets',       icon:PieChart,         label:'Budgets',      color:'#FFB300' },
  { path:'/goals',         icon:Target,           label:'Goals',        color:'#00C896' },
  { path:'/analytics',     icon:TrendingUp,       label:'Insights',     color:'#2196F3' },
  { path:'/wallet',        icon:Wallet,           label:'Wallet',       color:'#FF7043' },
  { path:'/social-impact', icon:Heart,            label:'Social Impact',color:'#E91E63' },
  { path:'/ai-coach',      icon:Bot,              label:'AI Coach',     color:'#9C27B0' },
  { path:'/journey',       icon:BookOpen,         label:'My Journey',   color:'#F59E0B' },
  { path:'/student',       icon:GraduationCap,    label:'Student Mode', color:'#059669' },
  { path:'/profile',       icon:User,             label:'Profile',      color:'#607D8B' },
  { path:'/admin',         icon:Shield,           label:'Admin',        color:'#795548' },
]

function Sidebar({ mobile=false, onClose }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout }   = useAuth()
  const { profile }        = useUserData()
  const displayName        = user?.name || profile?.name || 'User'
  const email              = user?.email || profile?.email || ''
  const income             = profile?.monthlyIncome || 0
  const streak             = profile?.streak || 0

  return (
    <div style={{
      width:248, height:'100%',
      background:'#0D0B26',
      display:'flex', flexDirection:'column',
      borderRight:'1px solid rgba(124,92,252,0.15)',
    }}>
      {/* Logo */}
      <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:38, height:38, borderRadius:12,
              background:'linear-gradient(135deg,#7C5CFC,#9B7BFF)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 6px 20px rgba(124,92,252,0.45)',
            }}>
              <TrendingUp size={19} color="white" strokeWidth={2.5}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:'1rem', color:'#FFFFFF', letterSpacing:'-0.02em', lineHeight:1.1 }}>SpendWise</div>
              <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.35)', fontWeight:500, marginTop:2 }}>Finance Dashboard</div>
            </div>
          </div>
          {mobile && (
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.6)', padding:6, borderRadius:8 }}>
              <X size={18}/>
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
        <p style={{ fontSize:'0.6375rem', fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 10px', marginBottom:8 }}>Menu</p>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path
          return (
            <NavLink key={item.path} to={item.path} onClick={onClose} style={{ textDecoration:'none', display:'block', marginBottom:2 }}>
              <div style={{
                display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:12,
                background: active ? `${item.color}22` : 'transparent',
                color: active ? item.color : 'rgba(255,255,255,0.5)',
                fontWeight: active ? 700 : 500,
                fontSize:'0.875rem',
                transition:'all 0.15s ease',
                cursor:'pointer',
                letterSpacing:'-0.01em',
                border: active ? `1px solid ${item.color}35` : '1px solid transparent',
              }}
              onMouseEnter={e => { if(!active){ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.85)' } }}
              onMouseLeave={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.5)' } }}>
                <item.icon size={16} strokeWidth={active?2.5:2} color={active?item.color:'currentColor'}/>
                {item.label}
                {active && <ChevronRight size={13} style={{ marginLeft:'auto', color:item.color }}/>}
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* User card */}
      <div style={{ padding:'12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        {streak > 0 && (
          <div style={{ padding:'8px 12px', borderRadius:10, background:'rgba(255,179,0,0.12)', border:'1px solid rgba(255,179,0,0.25)', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:'0.85rem' }}>🔥</span>
            <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#FFB300' }}>{streak}-day streak — keep it up!</span>
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            width:34, height:34, borderRadius:10,
            background:'linear-gradient(135deg,#7C5CFC,#00C896)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontWeight:800, fontSize:'0.9rem', flexShrink:0,
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'0.8125rem', fontWeight:700, color:'rgba(255,255,255,0.9)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{displayName}</div>
            <div style={{ fontSize:'0.6875rem', color:'rgba(255,255,255,0.35)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{email}</div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} title="Log out"
            style={{ background:'rgba(255,71,87,0.12)', border:'1px solid rgba(255,71,87,0.2)', cursor:'pointer', color:'#FF4757', padding:6, borderRadius:8, transition:'all 0.15s', flexShrink:0 }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,71,87,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,71,87,0.12)' }}>
            <LogOut size={14}/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const location  = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { notifications, markNotificationsRead } = useUserData()
  const { user } = useAuth()
  const [showNotif, setShowNotif] = useState(false)
  const allNotifs = notifications || []
  const unread    = allNotifs.filter(n => !n.read).length

  const PAGE_TITLES = {
    '/dashboard':    'Dashboard',    '/expenses':     'Transactions',
    '/budgets':      'Budgets',      '/goals':        'Goals',
    '/analytics':    'Insights',     '/social-impact':'Social Impact',
    '/ai-coach':     'AI Coach',     '/profile':      'Profile',
    '/admin':        'Admin Panel',  '/wallet':       'Wallet',
    '/journey':      'My Financial Journey',
    '/student':      'Student Mode',
  }
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard'
  const activeItem = NAV_ITEMS.find(n => n.path === location.pathname)
  const accentColor = activeItem?.color || '#7C5CFC'

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--surface)', overflow:'hidden' }}>

      {/* Desktop sidebar */}
      <div className="desktop-sidebar" style={{ flexShrink:0 }}>
        <Sidebar onClose={() => {}}/>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position:'fixed', inset:0, background:'rgba(13,11,38,0.7)', zIndex:40, backdropFilter:'blur(4px)' }}/>
            <motion.div initial={{ x:-248 }} animate={{ x:0 }} exit={{ x:-248 }} transition={{ type:'spring', stiffness:300, damping:30 }}
              style={{ position:'fixed', left:0, top:0, bottom:0, zIndex:50 }}>
              <Sidebar mobile onClose={() => setSidebarOpen(false)}/>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Topbar */}
        <header style={{
          height:62, flexShrink:0,
          background:'rgba(255,255,255,0.85)',
          backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center',
          padding:'0 22px', gap:14,
        }}>
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn"
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-2)', padding:4, borderRadius:8, display:'none' }}>
            <Menu size={20}/>
          </button>

          {/* Page title with color accent */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:4, height:22, borderRadius:99, background:accentColor }}/>
            <h1 style={{ fontSize:'1.0625rem', fontWeight:700, color:'var(--text-1)', letterSpacing:'-0.02em' }}>{pageTitle}</h1>
          </div>

          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            {/* Bell */}
            <div style={{ position:'relative' }}>
              <button onClick={() => setShowNotif(p => !p)}
                style={{ position:'relative', width:38, height:38, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface)', border:'1.5px solid var(--border)', cursor:'pointer', color:'var(--text-2)', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--brand-light)'; e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.color='var(--brand)' }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)' }}>
                <Bell size={16}/>
                {unread > 0 && (
                  <span style={{ position:'absolute', top:-3, right:-3, width:17, height:17, borderRadius:9, background:'var(--danger)', color:'white', fontSize:'0.6rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white' }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotif && (
                  <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.95 }} transition={{ duration:0.16 }}
                    style={{ position:'absolute', right:0, top:'calc(100% + 10px)', width:340, borderRadius:16, background:'#FFFFFF', border:'1.5px solid var(--border)', boxShadow:'0 16px 60px rgba(100,80,200,0.18)', zIndex:100, overflow:'hidden' }}>
                    <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--surface)' }}>
                      <span style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem' }}>Notifications</span>
                      {unread > 0 && <button onClick={markNotificationsRead} style={{ fontSize:'0.78rem', color:'var(--brand)', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Mark all read</button>}
                    </div>
                    <div style={{ maxHeight:300, overflowY:'auto' }}>
                      {allNotifs.length === 0 ? (
                        <div style={{ padding:'28px', textAlign:'center', color:'var(--text-3)', fontSize:'0.875rem' }}>No notifications yet</div>
                      ) : allNotifs.slice(0,8).map((n,i) => (
                        <div key={n._id||i} style={{ padding:'13px 18px', borderBottom:'1px solid #F8F6FF', background:!n.read?'#FDFAFF':'white', transition:'background 0.15s' }}>
                          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:!n.read?'var(--brand)':'transparent', flexShrink:0, marginTop:5 }}/>
                            <div>
                              <div style={{ fontWeight:600, color:'var(--text-1)', fontSize:'0.875rem' }}>{n.title}</div>
                              <div style={{ color:'var(--text-3)', fontSize:'0.78rem', marginTop:2 }}>{n.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div style={{
              width:36, height:36, borderRadius:11,
              background:'linear-gradient(135deg,#7C5CFC,#00C896)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontWeight:800, fontSize:'0.9rem', cursor:'pointer',
              boxShadow:'0 4px 14px rgba(124,92,252,0.35)',
            }}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto', padding:'22px 24px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              transition={{ duration:0.22, ease:[.22,1,.36,1] }}>
              <Outlet/>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        @media(min-width:768px){ .desktop-sidebar{display:flex!important} .mobile-menu-btn{display:none!important} }
        @media(max-width:767px){ .desktop-sidebar{display:none!important} .mobile-menu-btn{display:flex!important} }
      `}</style>
    </div>
  )
}


