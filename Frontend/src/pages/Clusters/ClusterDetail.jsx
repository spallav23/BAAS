import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { clusterAPI, dataAPI } from '../../services/api'
import toast from 'react-hot-toast'
import DocumentCreateModal from '../../components/Modals/DocumentCreateModal'
import DocumentEditModal from '../../components/Modals/DocumentEditModal'

const ClusterDetail = () => {
  const { clusterId } = useParams()
  const [cluster, setCluster] = useState(null)
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

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
      setDocuments(response.data.documents || [])
    } catch (error) {
      toast.error('Failed to load documents')
      setDocuments([])
    }
  }

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    setDeletingId(documentId)
    try {
      await dataAPI.deleteDocument(clusterId, documentId)
      toast.success('Document deleted successfully')
      fetchDocuments()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (doc) => {
    setSelectedDocument(doc)
    setShowEditModal(true)
  }

  const handleView = (doc) => {
    setSelectedDocument(doc)
    setShowViewModal(true)
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
            <code className="text-sm bg-dark-surface px-3 py-2 rounded block text-accent-blue break-all">
              {cluster.apiEndpoint}
            </code>
          </div>
          <div>
            <p className="text-sm text-dark-text-muted mb-1">Document Count</p>
            <p className="text-2xl font-bold text-dark-text">
              {cluster.documentCount || documents.length || 0}
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
          <span className="text-sm text-dark-text-muted">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </span>
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
                key={doc._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-dark-surface border border-dark-border hover:border-accent-blue/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-dark-text truncate">
                      {doc.name || doc.title || `Document ${index + 1}`}
                    </p>
                    <span className="text-xs text-dark-text-muted">
                      ({Object.keys(doc).filter(k => !k.startsWith('_')).length} fields)
                    </span>
                  </div>
                  <p className="text-sm text-dark-text-muted truncate">
                    ID: {doc._id}
                  </p>
                  {doc.createdAt && (
                    <p className="text-xs text-dark-text-muted mt-1">
                      Created: {new Date(doc.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleView(doc)}
                    className="p-2 rounded-lg hover:bg-dark-card transition-colors"
                    title="View"
                  >
                    <FiEye className="w-4 h-4 text-dark-text-muted hover:text-accent-blue" />
                  </button>
                  <button
                    onClick={() => handleEdit(doc)}
                    className="p-2 rounded-lg hover:bg-dark-card transition-colors"
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4 text-dark-text-muted hover:text-accent-blue" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc._id)}
                    disabled={deletingId === doc._id}
                    className="p-2 rounded-lg hover:bg-red-600/20 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === doc._id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiTrash2 className="w-4 h-4 text-dark-text-muted hover:text-red-400" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Document Modal */}
      {showCreateModal && (
        <DocumentCreateModal
          cluster={cluster}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchDocuments}
        />
      )}

      {/* Edit Document Modal */}
      {showEditModal && selectedDocument && (
        <DocumentEditModal
          cluster={cluster}
          document={selectedDocument}
          onClose={() => {
            setShowEditModal(false)
            setSelectedDocument(null)
          }}
          onSuccess={fetchDocuments}
        />
      )}

      {/* View Document Modal */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowViewModal(false)
              setSelectedDocument(null)
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl bg-dark-surface border border-dark-border rounded-xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="text-xl font-bold text-dark-text">Document Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedDocument(null)
                }}
                className="p-2 rounded-lg hover:bg-dark-card transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-dark-text-muted" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <pre className="text-sm text-dark-text bg-dark-card p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(selectedDocument, null, 2)}
              </pre>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ClusterDetail
