import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiPlus, FiTrash2, FiDownload, FiFile } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { storageAPI } from '../../services/api'
import toast from 'react-hot-toast'
import FileUploadModal from '../../components/Modals/FileUploadModal'

const BucketDetail = () => {
  const { bucketId } = useParams()
  const [bucket, setBucket] = useState(null)
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchBucket()
    fetchFiles()
  }, [bucketId])

  const fetchBucket = async () => {
    try {
      const response = await storageAPI.getBucket(bucketId)
      setBucket(response.data.bucket)
    } catch (error) {
      toast.error('Failed to load bucket')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFiles = async () => {
    try {
      const response = await storageAPI.getFiles(bucketId)
      setFiles(response.data.files || [])
    } catch (error) {
      toast.error('Failed to load files')
      setFiles([])
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return
    }

    setDeletingId(fileId)
    try {
      await storageAPI.deleteFile(bucketId, fileId)
      toast.success('File deleted successfully')
      fetchFiles()
      fetchBucket() // Refresh bucket stats
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete file')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (fileName, originalName) => {
    try {
      const response = await storageAPI.downloadFile(bucketId, fileName)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', originalName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('File downloaded successfully')
    } catch (error) {
      toast.error('Failed to download file')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!bucket) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-text-muted">Bucket not found</p>
        <Link to="/storage" className="btn btn-primary mt-4">
          Back to Buckets
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
        <Link to="/storage">
          <button className="p-2 rounded-lg hover:bg-dark-card transition-colors">
            <FiArrowLeft className="w-5 h-5 text-dark-text" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-dark-text">{bucket.name}</h1>
          {bucket.description && (
            <p className="text-dark-text-muted mt-1">{bucket.description}</p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Upload File
        </motion.button>
      </motion.div>

      {/* Bucket Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card"
      >
        <h2 className="text-xl font-bold text-dark-text mb-4">Bucket Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-dark-text-muted mb-1">API Endpoint</p>
            <code className="text-sm bg-dark-surface px-3 py-2 rounded block text-accent-blue break-all">
              {bucket.apiEndpoint}
            </code>
          </div>
          <div>
            <p className="text-sm text-dark-text-muted mb-1">File Count</p>
            <p className="text-2xl font-bold text-dark-text">
              {bucket.fileCount || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-dark-text-muted mb-1">Total Size</p>
            <p className="text-2xl font-bold text-dark-text">
              {formatFileSize(bucket.totalSize || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-dark-text-muted mb-1">Max File Size</p>
            <p className="text-lg font-bold text-dark-text">
              {formatFileSize(bucket.maxFileSize || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-dark-text-muted mb-1">Read Access</p>
            <span className="px-3 py-1 rounded-full bg-accent-blue/20 text-accent-blue text-sm font-medium">
              {bucket.readAccess}
            </span>
          </div>
          <div>
            <p className="text-sm text-dark-text-muted mb-1">Write Access</p>
            <span className="px-3 py-1 rounded-full bg-accent-green/20 text-accent-green text-sm font-medium">
              {bucket.writeAccess}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Files */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-text">Files</h2>
          <span className="text-sm text-dark-text-muted">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-12">
            <FiFile className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
            <p className="text-dark-text-muted mb-4">No files yet</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Upload First File
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-dark-surface border border-dark-border hover:border-accent-purple/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                    <FiFile className="w-5 h-5 text-accent-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-text truncate">
                      {file.originalName}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-dark-text-muted">
                        {formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-dark-text-muted">
                        {file.mimeType}
                      </p>
                      {file.createdAt && (
                        <p className="text-xs text-dark-text-muted">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(file.fileName, file.originalName)}
                    className="p-2 rounded-lg hover:bg-dark-card transition-colors"
                    title="Download"
                  >
                    <FiDownload className="w-4 h-4 text-dark-text-muted hover:text-accent-blue" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deletingId === file.id}
                    className="p-2 rounded-lg hover:bg-red-600/20 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === file.id ? (
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

      {/* Upload File Modal */}
      {showUploadModal && (
        <FileUploadModal
          bucket={bucket}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchFiles()
            fetchBucket()
          }}
        />
      )}
    </div>
  )
}

export default BucketDetail

