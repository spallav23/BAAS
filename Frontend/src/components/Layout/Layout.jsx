import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useSelector, useDispatch } from 'react-redux'
import { setSidebarOpen } from '../../store/slices/uiSlice'

const Layout = () => {
  const dispatch = useDispatch()
  const { sidebarOpen } = useSelector((state) => state.ui)

  // Handle window resize to manage sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On desktop, sidebar should be open by default
        dispatch(setSidebarOpen(true))
      } else {
        // On mobile, sidebar should be closed by default
        dispatch(setSidebarOpen(false))
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [dispatch])

  return (
    <div className="min-h-screen bg-dark-bg flex relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      {/* <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300"> */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default Layout

