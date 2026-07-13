import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, CreditCard, Target, Wallet, BarChart3,
  Heart, Brain, User, Settings, ChevronRight, X,
  Sparkles, Shield, TrendingUp, DollarSign
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getAvatarGradient, formatCurrency } from '../../utils/helpers'
import { mockUser } from '../../utils/mockData'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', color: 'text-violet-500' },
  { label: 'Expenses', icon: CreditCard, path: '/expenses', color: 'text-primary-500' },
  { label: 'Budgets', icon: DollarSign, path: '/budgets', color: 'text-amber-500' },
  { label: 'Goals', icon: Target, path: '/goals', color: 'text-emerald-500' },
  { label: 'Wallet', icon: Wallet, path: '/wallet', color: 'text-indigo-500' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', color: 'text-cyan-500' },
  { label: 'Social Impact', icon: Heart, path: '/social-impact', color: 'text-rose-500' },
  { label: 'AI Coach', icon: Brain, path: '/ai-coach', color: 'text-purple-500' },
]

const bottomItems = [
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Admin Panel', icon: Shield, path: '/admin' },
]

export default function Sidebar({ onClose }) {
  const { user } = useAuth()
  const location = useLocation()
  const displayUser = user || mockUser

  return (
    <div className="w-64 h-full bg-white dark:bg-dark-900 border-r border-gray-100 dark:border-dark-700 flex flex-col">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-primary-600 flex items-center justify-center shadow-neon">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg font-display text-gray-900 dark:text-white">SpendWise</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 -mt-0.5">AI Finance Platform</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User Card */}
      <div className="mx-3 mb-4 p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-primary-50 dark:from-violet-900/20 dark:to-primary-900/20 border border-violet-100 dark:border-violet-800/30">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(displayUser.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {displayUser.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{displayUser.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayUser.email}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-violet-100 dark:border-violet-800/30 flex items-center justify-between text-xs">
          <div className="text-center">
            <p className="font-bold text-violet-600 dark:text-violet-400">{displayUser.financialHealthScore || 74}</p>
            <p className="text-gray-500 dark:text-gray-500">Health Score</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-emerald-600 dark:text-emerald-400">{displayUser.streak || 23}🔥</p>
            <p className="text-gray-500 dark:text-gray-500">Day Streak</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(displayUser.walletBalance || 850)}</p>
            <p className="text-gray-500 dark:text-gray-500">Wallet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto hide-scrollbar">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 mb-2">Main Menu</p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item group ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : item.color}`} size={18} />
                  <span className="flex-1 text-sm">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-6 mb-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 mb-2">Account</p>
          <div className="space-y-1">
            {bottomItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item group ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-4 h-4 flex-shrink-0" size={18} />
                    <span className="flex-1 text-sm">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom CTA */}
      <div className="p-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-primary-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <p className="font-semibold text-sm">Savings Forecast</p>
          </div>
          <p className="text-xs opacity-80 mb-2">At current rate, you'll save</p>
          <p className="text-2xl font-bold">₹48,000</p>
          <p className="text-xs opacity-70">this year</p>
        </div>
      </div>
    </div>
  )
}
