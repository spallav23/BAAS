import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { logout } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { sidebarOpen } = useSelector((state) => state.ui)

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error(error || 'Failed to logout')
    }
  }

  const handleNotificationClick = () => {
    // TODO: Implement notification dropdown or navigate to notifications page
    toast.info('Notifications feature coming soon!')
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border"
    >
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-card transition-colors"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-5 h-5 text-dark-text" />
          </button>
          <h1 
            onClick={handleLogoClick}
            className="text-xl font-bold gradient-text hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
          >
            BaaS Platform
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button 
            onClick={handleNotificationClick}
            className="p-2 rounded-lg hover:bg-dark-card transition-colors relative"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5 text-dark-text" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-pink rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Profile Button */}
            <button
              onClick={handleProfileClick}
              className="md:hidden p-2 rounded-lg hover:bg-dark-card transition-colors"
              aria-label="Profile"
            >
              <FiUser className="w-5 h-5 text-dark-text" />
            </button>

            {/* Desktop Profile Section */}
            <div 
              onClick={handleProfileClick}
              className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-dark-card cursor-pointer hover:bg-dark-card/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-dark-text">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-dark-text-muted">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header

