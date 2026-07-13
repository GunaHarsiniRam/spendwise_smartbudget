import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NAV = [
  { path:'/dashboard',     emoji:'🗺️', label:'Journey',  color:'#7C3AED', bg:'#F3EEFF' },
  { path:'/expenses',      emoji:'💳', label:'Expenses', color:'#FF6B6B', bg:'#FFF0F0' },
  { path:'/budgets',       emoji:'🪐', label:'Budgets',  color:'#F59E0B', bg:'#FFFBEB' },
  { path:'/goals',         emoji:'🎯', label:'Goals',    color:'#10B981', bg:'#ECFDF5' },
  { path:'/wallet',        emoji:'👛', label:'Wallet',   color:'#6366F1', bg:'#EEF2FF' },
  { path:'/analytics',     emoji:'📈', label:'Story',    color:'#0EA5E9', bg:'#EFF6FF' },
  { path:'/social-impact', emoji:'❤️', label:'Impact',  color:'#F43F5E', bg:'#FFF0F3' },
  { path:'/ai-coach',      emoji:'🧠', label:'Coach',    color:'#A855F7', bg:'#F8EEFF' },
  { path:'/profile',       emoji:'✨', label:'Profile',  color:'#7C3AED', bg:'#F3EEFF' },
  { path:'/admin',         emoji:'🛡️', label:'Admin',   color:'#EF4444', bg:'#FFF0F0' },
]

export default function FloatingDock() {
  const location = useLocation()
  const [hovered, setHovered] = useState(null)

  return (
    <motion.div
      initial={{ y:100, opacity:0 }}
      animate={{ y:0, opacity:1 }}
      transition={{ delay:0.3, type:'spring', stiffness:280, damping:24 }}
      style={{
        position:'fixed', bottom:18, left:'50%', transform:'translateX(-50%)',
        zIndex:100, display:'flex', alignItems:'center', gap:4, padding:'8px 14px',
        background:'rgba(255,255,255,0.97)',
        backdropFilter:'blur(24px)',
        border:'2px solid #EDE0FF',
        borderRadius:9999,
        boxShadow:'0 8px 40px rgba(139,90,246,0.18), 0 2px 0 rgba(255,255,255,0.8) inset',
      }}>
      {NAV.map(item => {
        const active  = location.pathname === item.path
        const isHover = hovered === item.path
        return (
          <NavLink key={item.path} to={item.path} style={{ textDecoration:'none' }}>
            <div onMouseEnter={() => setHovered(item.path)} onMouseLeave={() => setHovered(null)}
              style={{ position:'relative' }}>

              {/* Tooltip */}
              <AnimatePresence>
                {isHover && (
                  <motion.div
                    initial={{ opacity:0, y:6, scale:0.85 }}
                    animate={{ opacity:1, y:0, scale:1 }}
                    exit={{ opacity:0, y:6, scale:0.85 }}
                    transition={{ duration:0.15 }}
                    style={{
                      position:'absolute', bottom:'calc(100% + 10px)', left:'50%', transform:'translateX(-50%)',
                      background:item.color, color:'white',
                      fontSize:'0.8rem', fontWeight:800,
                      padding:'6px 12px', borderRadius:10,
                      whiteSpace:'nowrap', pointerEvents:'none',
                      fontFamily:'Nunito, sans-serif',
                      boxShadow:`0 4px 14px ${item.color}60`, zIndex:200,
                    }}>
                    {item.emoji}&nbsp;{item.label}
                    <div style={{
                      position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)',
                      width:0, height:0,
                      borderLeft:'5px solid transparent', borderRight:'5px solid transparent',
                      borderTop:`5px solid ${item.color}`,
                    }}/>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                animate={{
                  scale: active ? 1.15 : isHover ? 1.18 : 1,
                  y:     active ? -3   : isHover ? -6   : 0,
                }}
                transition={{ type:'spring', stiffness:400, damping:18 }}
                style={{
                  width:46, height:46, borderRadius:14,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', fontSize:'1.35rem',
                  background: active ? item.bg : isHover ? item.bg : 'transparent',
                  border: active ? `2px solid ${item.color}40` : '2px solid transparent',
                  boxShadow: active ? `0 4px 14px ${item.color}30` : 'none',
                  transition:'background 0.2s, border 0.2s',
                }}>
                {item.emoji}
              </motion.div>

              {active && (
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                  style={{
                    position:'absolute', bottom:-6, left:'50%', transform:'translateX(-50%)',
                    width:5, height:5, borderRadius:'50%',
                    background:item.color, boxShadow:`0 0 6px ${item.color}`,
                  }}/>
              )}
            </div>
          </NavLink>
        )
      })}
    </motion.div>
  )
}
