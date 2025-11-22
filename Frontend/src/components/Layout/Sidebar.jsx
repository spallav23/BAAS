import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import {
  FiHome,
  FiDatabase,
  FiServer,
  FiX,
  FiChevronRight,
  FiBook,
  FiUser,
} from 'react-icons/fi'
import { setSidebarOpen } from '../../store/slices/uiSlice'

const menuItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/clusters', icon: FiDatabase, label: 'Clusters' },
  { path: '/documents', icon: FiBook, label: 'Documents' },
  { path: '/profile', icon: FiUser, label: 'Profile' },
  { path: '/storage', icon: FiServer, label: 'Storage', comingSoon: true },
]

const Sidebar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { sidebarOpen } = useSelector((state) => state.ui)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024
      setIsDesktop(desktop)
      // On desktop, always keep sidebar open
      if (desktop) {
        dispatch(setSidebarOpen(true))
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [dispatch])

  const closeSidebar = () => {
    if (!isDesktop) {
      dispatch(setSidebarOpen(false))
    }
  }

  // Close sidebar when clicking nav link on mobile
  const handleNavClick = () => {
    if (!isDesktop) {
      dispatch(setSidebarOpen(false))
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : sidebarOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-screen w-64 bg-dark-surface border-r border-dark-border z-50 lg:translate-x-0 lg:static lg:z-auto"
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            <h2 className="text-xl font-bold gradient-text">BaaS</h2>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-1 rounded-lg hover:bg-dark-card"
            >
              <FiX className="w-5 h-5 text-dark-text" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (item.comingSoon) {
                      e.preventDefault()
                    } else {
                      handleNavClick()
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                        : 'text-dark-text-muted hover:bg-dark-card hover:text-dark-text'
                    } ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.comingSoon && (
                    <span className="text-xs px-2 py-1 bg-dark-card rounded text-dark-text-muted">
                      Soon
                    </span>
                  )}
                  <FiChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }`}
                  />
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-dark-border">
            <div className="px-4 py-3 rounded-lg bg-dark-card">
              <p className="text-xs text-dark-text-muted text-center">
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar

