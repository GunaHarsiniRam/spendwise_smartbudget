import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ChevronDown, Flame } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useUserData } from '../../context/UserDataContext'
import { timeAgo } from '../../utils/helpers'

const PAGE_NAMES = {
  '/dashboard':    { name: 'My Journey',     emoji: '🗺️' },
  '/expenses':     { name: 'Spending Log',   emoji: '💳' },
  '/budgets':      { name: 'Budget Planets', emoji: '🪐' },
  '/goals':        { name: 'My Goals',       emoji: '🎯' },
  '/wallet':       { name: 'Wallet',         emoji: '👛' },
  '/analytics':    { name: 'Growth Story',   emoji: '📈' },
  '/social-impact':{ name: 'My Impact',      emoji: '❤️' },
  '/ai-coach':     { name: 'AI Coach',       emoji: '🧠' },
  '/profile':      { name: 'Profile',        emoji: '✨' },
  '/admin':        { name: 'Admin',          emoji: '🛡️' },
}

export default function TopBar() {
  const { user, logout }                                   = useAuth()
  const { notifications, markNotificationsRead, profile }  = useUserData()
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const [showUser,  setShowUser]  = useState(false)

  const allNotifs   = notifications || []
  const unread      = allNotifs.filter(n => !n.read).length
  const streak      = profile?.streak || 0
  const page        = PAGE_NAMES[location.pathname] || { name: 'SpendWise', emoji: '✨' }
  const displayName = user?.name || profile?.name || 'You'

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: 70,
      background: 'rgba(255,248,240,0.97)',
      backdropFilter: 'blur(20px)',
      borderBottom: '2px solid #FFE8D6',
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      boxShadow: '0 4px 24px rgba(255,107,107,0.08)',
    }}>

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <motion.div whileHover={{ rotate:20, scale:1.15 }} transition={{ type:'spring', stiffness:300 }}
          style={{ width:40, height:40, borderRadius:13, background:'linear-gradient(135deg,#FF6B6B,#A855F7)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(255,107,107,0.4)', fontSize:'1.3rem' }}>
          ✦
        </motion.div>
        <div>
          <div style={{ fontWeight:900, color:'#2D1B69', fontSize:'1.15rem', fontFamily:'Nunito, sans-serif', lineHeight:1.1 }}>SpendWise</div>
          <div style={{ fontSize:'0.65rem', color:'#B8A0D8', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>Finance Journey</div>
        </div>
      </div>

      {/* Page name — center */}
      <div style={{ flex:1, textAlign:'center' }}>
        <span style={{ fontSize:'1rem', fontWeight:800, color:'#7C3AED', fontFamily:'Nunito, sans-serif' }}>
          {page.emoji}&nbsp;&nbsp;{page.name}
        </span>
      </div>

      {/* Right actions */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>

        {/* Streak badge */}
        {streak > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:99,
            background:'linear-gradient(135deg,#FF6B6B,#FF8E53)', color:'white',
            fontSize:'0.9rem', fontWeight:800, boxShadow:'0 3px 12px rgba(255,107,107,0.35)' }}>
            <Flame size={14}/> {streak}
          </div>
        )}

        {/* Bell */}
        <div style={{ position:'relative' }}>
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
            onClick={() => { setShowNotif(p => !p); setShowUser(false) }}
            style={{ width:42, height:42, borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center',
              background:'#F3EEFF', border:'2px solid #DDD6FE', cursor:'pointer', position:'relative', fontSize:'1.2rem' }}>
            🔔
            {unread > 0 && (
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                style={{ position:'absolute', top:-5, right:-5, width:20, height:20, borderRadius:10,
                  background:'#FF6B6B', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.65rem', fontWeight:900, color:'white', boxShadow:'0 2px 8px rgba(255,107,107,0.5)' }}>
                {unread}
              </motion.div>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotif && (
              <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.95 }}
                style={{ position:'absolute', right:0, top:'calc(100% + 12px)', width:340,
                  borderRadius:20, background:'white', border:'2px solid #EDE0FF',
                  boxShadow:'0 16px 60px rgba(139,90,246,0.18)', zIndex:100, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'2px solid #F3EEFF', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:900, color:'#2D1B69', fontSize:'1rem', fontFamily:'Nunito, sans-serif' }}>Notifications 🔔</span>
                  {unread > 0 && (
                    <button onClick={markNotificationsRead}
                      style={{ fontSize:'0.85rem', color:'#A855F7', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight:320, overflowY:'auto' }}>
                  {allNotifs.length === 0 ? (
                    <div style={{ padding:'28px', textAlign:'center', color:'#B8A0D8', fontSize:'0.95rem', fontWeight:600 }}>
                      No notifications yet
                    </div>
                  ) : allNotifs.map((n, i) => (
                    <div key={n._id || i} style={{ padding:'14px 20px', borderBottom:'1px solid #FFF0F8', background:!n.read ? '#FDF8FF' : 'white' }}>
                      <div style={{ fontWeight:700, color:'#2D1B69', fontSize:'0.95rem' }}>{n.title}</div>
                      <div style={{ color:'#9580B8', fontSize:'0.85rem', marginTop:3 }}>{n.message}</div>
                      <div style={{ color:'#C4B5D9', fontSize:'0.78rem', marginTop:5 }}>{timeAgo(n.time)}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div style={{ position:'relative' }}>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => { setShowUser(p => !p); setShowNotif(false) }}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 14px 6px 6px',
              borderRadius:14, background:'#F3EEFF', border:'2px solid #DDD6FE', cursor:'pointer' }}>
            <div style={{ width:34, height:34, borderRadius:10,
              background:'linear-gradient(135deg,#A855F7,#FF6B6B)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontWeight:900, fontSize:'1rem', fontFamily:'Nunito, sans-serif' }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize:'0.95rem', fontWeight:800, color:'#7C3AED', fontFamily:'Nunito, sans-serif' }}>
              {displayName.split(' ')[0]}
            </span>
            <ChevronDown size={14} color="#B8A0D8"/>
          </motion.button>

          <AnimatePresence>
            {showUser && (
              <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.95 }}
                style={{ position:'absolute', right:0, top:'calc(100% + 12px)', width:220,
                  borderRadius:18, background:'white', border:'2px solid #EDE0FF',
                  boxShadow:'0 16px 48px rgba(139,90,246,0.18)', zIndex:100, overflow:'hidden', padding:8 }}>
                <div style={{ padding:'12px 16px 14px', borderBottom:'2px solid #F3EEFF', marginBottom:6 }}>
                  <div style={{ fontWeight:900, color:'#2D1B69', fontSize:'1rem', fontFamily:'Nunito, sans-serif' }}>{displayName}</div>
                  <div style={{ color:'#B8A0D8', fontSize:'0.82rem', marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email || ''}</div>
                </div>
                {[
                  { emoji:'👤', label:'Profile', action:() => { navigate('/profile'); setShowUser(false) }, color:'#7C3AED' },
                  { emoji:'🚪', label:'Log out',  action:() => { logout(); setShowUser(false) },            color:'#FF6B6B' },
                ].map((item, i) => (
                  <button key={i} onClick={item.action}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                      borderRadius:12, background:'none', border:'none', color:item.color,
                      fontSize:'0.95rem', fontWeight:800, cursor:'pointer', textAlign:'left',
                      fontFamily:'Nunito, sans-serif', transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F3EEFF'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <span style={{ fontSize:'1.1rem' }}>{item.emoji}</span> {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  )
}
