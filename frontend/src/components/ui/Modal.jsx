import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const WIDTHS = { sm:400, md:480, lg:580, xl:680 }

export default function Modal({ isOpen, onClose, title, children, size='md' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          onClick={onClose}
          style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(13,11,38,0.6)', backdropFilter:'blur(6px)' }}>
          <motion.div
            initial={{ opacity:0, scale:0.94, y:16 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.94, y:16 }}
            transition={{ duration:0.2, ease:[.22,1,.36,1] }}
            onClick={e=>e.stopPropagation()}
            style={{ width:'100%', maxWidth:WIDTHS[size]||480, maxHeight:'90vh', overflowY:'auto', borderRadius:'var(--radius-xl)', background:'#FFFFFF', border:'1.5px solid var(--border)', boxShadow:'0 24px 80px rgba(100,80,200,0.2)' }}>
            {title && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 22px', borderBottom:'1px solid var(--border)', background:'var(--surface)', borderRadius:'var(--radius-xl) var(--radius-xl) 0 0' }}>
                <span style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem', letterSpacing:'-0.01em' }}>{title}</span>
                <button onClick={onClose}
                  style={{ width:30, height:30, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='var(--brand-light)'; e.currentTarget.style.color='var(--brand)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-3)' }}>
                  <X size={16}/>
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
