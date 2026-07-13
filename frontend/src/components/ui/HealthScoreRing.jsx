import React from 'react'
import { motion } from 'framer-motion'

const getMeta = (s) => {
  if (s >= 80) return { label:'Excellent', color:'#10B981' }
  if (s >= 60) return { label:'Good',      color:'#A855F7' }
  if (s >= 40) return { label:'Fair',      color:'#F59E0B' }
  return             { label:'Needs Work', color:'#FF6B6B' }
}

export default function HealthScoreRing({ score=74, size=140, stroke=10 }) {
  const meta = getMeta(score)
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const off  = circ - (score / 100) * circ

  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)', filter:`drop-shadow(0 0 10px ${meta.color}50)` }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0E6FF" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={meta.color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset:circ }}
          animate={{ strokeDashoffset:off }}
          transition={{ duration:1.8, ease:'easeOut', delay:0.3 }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <motion.span initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.9, type:'spring' }}
          style={{ fontSize:size*0.24, fontWeight:900, color:meta.color, lineHeight:1, fontFamily:'Nunito, sans-serif' }}>
          {score}
        </motion.span>
        <span style={{ fontSize:size*0.09, color:meta.color, fontWeight:700, marginTop:2 }}>{meta.label}</span>
      </div>
    </div>
  )
}
