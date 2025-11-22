import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { clusterAPI, dataAPI } from '../../services/api'
import toast from 'react-hot-toast'

const ClusterDetail = () => {
  const { clusterId } = useParams()
  const [cluster, setCluster] = useState(null)
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchCluster()
    fetchDocuments()
  }, [clusterId])

  const fetchCluster = async () => {
    try {
      const response = await clusterAPI.getCluster(clusterId)
      setCluster(response.data.cluster)
    } catch (error) {
      toast.error('Failed to load cluster')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await dataAPI.getDocuments(clusterId)
      setDocuments(response.data.documents)
    } catch (error) {
      toast.error('Failed to load documents')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!cluster) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-text-muted">Cluster not found</p>
        <Link to="/clusters" className="btn btn-primary mt-4">
          Back to Clusters
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4"
      >
        <Link to="/clusters">
          <button className="p-2 rounded-lg hover:bg-dark-card transition-colors">
            <FiArrowLeft className="w-5 h-5 text-dark-text" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-dark-text">{cluster.name}</h1>
          {cluster.description && (
            <p className="text-dark-text-muted mt-1">{cluster.description}</p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Document
        </motion.button>
      </motion.div>

      {/* Cluster Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card"
      >
        <h2 className="text-xl font-bold text-dark-text mb-4">Cluster Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-dark-text-muted mb-1">API Endpoint</p>
            <code className="text-sm bg-dark-surface px-3 py-2 rounded block text-accent-blue">
              {cluster.apiEndpoint}
            </code>
          </div>
          <div>
            <p className="text-sm text-dark-text-muted mb-1">Document Count</p>
            <p className="text-2xl font-bold text-dark-text">
              {cluster.documentCount || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-dark-text-muted mb-1">Read Access</p>
            <span className="px-3 py-1 rounded-full bg-accent-blue/20 text-accent-blue text-sm font-medium">
              {cluster.readAccess}
            </span>
          </div>
          <div>
            <p className="text-sm text-dark-text-muted mb-1">Write Access</p>
            <span className="px-3 py-1 rounded-full bg-accent-green/20 text-accent-green text-sm font-medium">
              {cluster.writeAccess}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Documents */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-text">Documents</h2>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-text-muted mb-4">No documents yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create First Document
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-dark-surface border border-dark-border hover:border-accent-blue/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-dark-text">
                    Document {index + 1}
                  </p>
                  <p className="text-sm text-dark-text-muted">
                    ID: {doc._id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-dark-card">
                    <FiEdit className="w-4 h-4 text-dark-text-muted" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-600/20">
                    <FiTrash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ClusterDetail

