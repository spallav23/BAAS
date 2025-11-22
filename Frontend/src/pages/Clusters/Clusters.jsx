import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiPlus,
  FiDatabase,
  FiTrash2,
  FiEdit,
  FiSearch,
  FiX,
} from 'react-icons/fi'
import { fetchClusters, deleteCluster } from '../../store/slices/clusterSlice'
import toast from 'react-hot-toast'
import CreateClusterModal from '../../components/Modals/CreateClusterModal'
import UpdateClusterModal from '../../components/Modals/UpdateClusterModal'

const Clusters = () => {
  const dispatch = useDispatch()
  const { clusters, isLoading } = useSelector((state) => state.clusters)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    dispatch(fetchClusters())
  }, [dispatch])

  const handleDelete = async (clusterId) => {
    if (!window.confirm('Are you sure you want to delete this cluster?')) {
      return
    }

    setDeletingId(clusterId)
    try {
      await dispatch(deleteCluster(clusterId)).unwrap()
      toast.success('Cluster deleted successfully')
    } catch (error) {
      toast.error(error || 'Failed to delete cluster')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredClusters = clusters.filter((cluster) =>
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">Clusters</h1>
          <p className="text-dark-text-muted">
            Manage your database clusters and collections
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Create Cluster
        </motion.button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative"
      >
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search clusters..."
          className="input pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-dark-surface"
          >
            <FiX className="w-4 h-4 text-dark-text-muted" />
          </button>
        )}
      </motion.div>

      {/* Clusters Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredClusters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-20"
        >
          <FiDatabase className="w-20 h-20 text-dark-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-dark-text mb-2">
            {searchTerm ? 'No clusters found' : 'No clusters yet'}
          </h3>
          <p className="text-dark-text-muted mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Create your first cluster to get started'}
          </p>
          {!searchTerm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create Cluster
            </motion.button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredClusters.map((cluster, index) => (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="card group"
              >
                <Link to={`/clusters/${cluster.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-accent-blue/20 flex items-center justify-center group-hover:bg-accent-blue/30 transition-colors">
                      <FiDatabase className="w-6 h-6 text-accent-blue" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedCluster(cluster)
                          setShowUpdateModal(true)
                        }}
                        className="p-2 rounded-lg hover:bg-dark-surface transition-colors"
                      >
                        <FiEdit className="w-4 h-4 text-dark-text-muted hover:text-accent-blue" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(cluster.id)
                        }}
                        disabled={deletingId === cluster.id}
                        className="p-2 rounded-lg hover:bg-red-600/20 transition-colors disabled:opacity-50"
                      >
                        {deletingId === cluster.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiTrash2 className="w-4 h-4 text-dark-text-muted hover:text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-dark-text mb-2 group-hover:text-accent-blue transition-colors">
                    {cluster.name}
                  </h3>
                  {cluster.description && (
                    <p className="text-sm text-dark-text-muted mb-4 line-clamp-2">
                      {cluster.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                    <div>
                      <p className="text-xs text-dark-text-muted">Documents</p>
                      <p className="text-lg font-bold text-dark-text">
                        {cluster.documentCount || 0}
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-accent-green/20 text-accent-green text-xs font-medium">
                      Active
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Cluster Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateClusterModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>

      {/* Update Cluster Modal */}
      {showUpdateModal && selectedCluster && (
        <UpdateClusterModal
          cluster={selectedCluster}
          onClose={() => {
            setShowUpdateModal(false)
            setSelectedCluster(null)
          }}
        />
      )}
    </div>
  )
}

export default Clusters

