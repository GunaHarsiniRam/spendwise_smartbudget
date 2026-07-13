import React from 'react'
import { TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div style={{ position:'fixed', inset:0, background:'var(--surface)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:999 }}>
      {/* Ambient orb */}
      <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:400, height:400, borderRadius:'50%', background:'rgba(124,92,252,0.08)', filter:'blur(80px)', pointerEvents:'none' }}/>

      <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.4 }}>
        <div style={{ width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,#7C5CFC,#9B7BFF)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22, boxShadow:'0 12px 36px rgba(124,92,252,0.45)' }}>
          <TrendingUp size={30} color="white" strokeWidth={2.5}/>
        </div>
      </motion.div>

      <h1 style={{ color:'var(--text-1)', fontWeight:800, fontSize:'1.25rem', margin:'0 0 6px', letterSpacing:'-0.02em' }}>SpendWise</h1>
      <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:28 }}>Loading your dashboard…</p>

      {/* Animated dots */}
      <div style={{ display:'flex', gap:8 }}>
        {[0,1,2].map(i => (
          <motion.div key={i}
            animate={{ scale:[1,1.5,1], opacity:[0.3,1,0.3] }}
            transition={{ duration:0.9, repeat:Infinity, delay:i*0.2 }}
            style={{ width:8, height:8, borderRadius:'50%', background:i===0?'#7C5CFC':i===1?'#00C896':'#FF4757' }}/>
        ))}
      </div>
    </div>
  )
}
