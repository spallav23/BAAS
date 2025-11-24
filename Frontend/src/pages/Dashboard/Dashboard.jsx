import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiDatabase,
  FiPlus,
  FiTrendingUp,
  FiActivity,
  FiArrowRight,
  FiServer,
} from 'react-icons/fi'
import { fetchClusters } from '../../store/slices/clusterSlice'
import { fetchBuckets } from '../../store/slices/storageSlice'
import { getCurrentUser } from '../../store/slices/authSlice'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { clusters, isLoading } = useSelector((state) => state.clusters)
  const { buckets, isLoading: bucketsLoading } = useSelector((state) => state.storage)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchClusters())
    dispatch(fetchBuckets())
    dispatch(getCurrentUser())
  }, [dispatch])

  const getColorClasses = (color) => {
    const colorMap = {
      'accent-blue': {
        bg: 'bg-accent-blue/20',
        text: 'text-accent-blue',
      },
      'accent-purple': {
        bg: 'bg-accent-purple/20',
        text: 'text-accent-purple',
      },
      'accent-green': {
        bg: 'bg-accent-green/20',
        text: 'text-accent-green',
      },
      'accent-pink': {
        bg: 'bg-accent-pink/20',
        text: 'text-accent-pink',
      },
      'accent-orange': {
        bg: 'bg-accent-orange/20',
        text: 'text-accent-orange',
      },
    }
    return colorMap[color] || colorMap['accent-blue']
  }

  const stats = [
    {
      label: 'Total Clusters',
      value: clusters.length,
      icon: FiDatabase,
      color: 'accent-blue',
      change: '+12%',
    },
    {
      label: 'Total Documents',
      value: clusters.reduce((sum, c) => sum + (c.documentCount || 0), 0),
      icon: FiActivity,
      color: 'accent-green',
      change: '+8%',
    },
    {
      label: 'Storage Buckets',
      value: buckets.length,
      icon: FiServer,
      color: 'accent-purple',
      change: '+5%',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-dark-text-muted">
            Manage your databases and clusters from one place
          </p>
        </div>
        <Link to="/clusters">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Create Cluster
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = getColorClasses(stat.color)
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-text-muted mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-dark-text">
                    {stat.value}
                  </p>
                  <p className="text-xs text-accent-green mt-2">
                    {stat.change} from last month
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg ${colorClasses.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Clusters */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-dark-text">Recent Clusters</h2>
          <Link
            to="/clusters"
            className="text-sm text-accent-blue hover:text-accent-blue/80 flex items-center gap-1 transition-colors"
          >
            View all
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : clusters.length === 0 ? (
          <div className="text-center py-12">
            <FiDatabase className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
            <p className="text-dark-text-muted mb-4">
              No clusters yet. Create your first cluster to get started!
            </p>
            <Link to="/clusters">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Create Cluster
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clusters.slice(0, 5).map((cluster, index) => (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-lg bg-dark-surface border border-dark-border hover:border-accent-blue/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                    <FiDatabase className="w-5 h-5 text-accent-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-text">
                      {cluster.name}
                    </h3>
                    <p className="text-sm text-dark-text-muted">
                      {cluster.documentCount || 0} documents
                    </p>
                  </div>
                </div>
                <Link to={`/clusters/${cluster.id}`}>
                  <FiArrowRight className="w-5 h-5 text-dark-text-muted hover:text-accent-blue transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard

