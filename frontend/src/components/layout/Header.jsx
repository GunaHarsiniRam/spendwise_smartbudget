import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, Bell, Sun, Moon, Search, LogOut, User, Settings,
  ChevronDown, Sparkles, Check, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { mockNotifications } from '../../utils/mockData'
import { timeAgo, getAvatarGradient } from '../../utils/helpers'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your financial overview' },
  '/expenses': { title: 'Expenses', subtitle: 'Track your spending' },
  '/budgets': { title: 'Budget Setup', subtitle: 'Manage category limits' },
  '/goals': { title: 'Savings Goals', subtitle: 'Track your targets' },
  '/wallet': { title: 'Accountability Wallet', subtitle: 'Your commitment fund' },
  '/analytics': { title: 'Analytics', subtitle: 'Deep financial insights' },
  '/social-impact': { title: 'Social Impact', subtitle: 'Your contribution to society' },
  '/ai-coach': { title: 'AI Financial Coach', subtitle: 'Personalized guidance' },
  '/profile': { title: 'Profile', subtitle: 'Account settings' },
  '/admin': { title: 'Admin Panel', subtitle: 'Platform management' },
}

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'SpendWise', subtitle: '' }
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const notifTypeStyles = {
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    danger: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    info: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  }

  const notifIcons = {
    warning: '⚠️', danger: '🔴', success: '✅', info: '💡'
  }

  return (
    <header className="h-16 bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-dark-700 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-tight font-display">{pageInfo.title}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{pageInfo.subtitle}</p>
      </div>

      {/* Search - desktop only */}
      <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-dark-700 rounded-xl px-3 py-2 w-56">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          className="bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="notification-dot flex items-center justify-center text-white text-[9px] font-bold w-4 h-4">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notif => (
                    <div
                      key={notif._id}
                      className={`p-4 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors ${!notif.read ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">{notifIcons[notif.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{notif.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{timeAgo(notif.time)}</p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-violet-500 rounded-full mt-1.5 flex-shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(prev => !prev)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(user?.name || 'A')} flex items-center justify-center text-white font-bold text-sm`}>
              {(user?.name || 'A').charAt(0)}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name || 'Arjun Sharma'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'arjun@example.com'}</p>
                </div>
                <div className="p-1.5">
                  <button onClick={() => { navigate('/profile'); setShowUserMenu(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button onClick={() => { navigate('/admin'); setShowUserMenu(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </button>
                </div>
                <div className="p-1.5 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
