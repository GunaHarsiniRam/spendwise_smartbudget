import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, gradient, trend, trendValue, delay = 0 }) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const getTrendColor = (trend, inverted = false) => {
    if (trend === 'up') return inverted ? 'text-rose-400' : 'text-emerald-400'
    if (trend === 'down') return inverted ? 'text-emerald-400' : 'text-rose-400'
    return 'text-gray-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden rounded-2xl p-5 ${gradient} text-white shadow-lg`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full rounded-full bg-white translate-x-8 -translate-y-8" />
      </div>
      <div className="absolute bottom-0 left-0 w-20 h-20 opacity-5">
        <div className="w-full h-full rounded-full bg-white -translate-x-6 translate-y-6" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-white/80">{title}</p>
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-white font-display">{value}</p>
        <div className="mt-2 flex items-center justify-between">
          {subtitle && <p className="text-xs text-white/70">{subtitle}</p>}
          {trendValue && (
            <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor(trend)}`}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
