import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { updateCluster, fetchClusters } from '../../store/slices/clusterSlice'
import toast from 'react-hot-toast'

const UpdateClusterModal = ({ cluster, onClose }) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    readAccess: 'private',
    writeAccess: 'private',
  })

  useEffect(() => {
    if (cluster) {
      setFormData({
        name: cluster.name || '',
        description: cluster.description || '',
        readAccess: cluster.readAccess || 'private',
        writeAccess: cluster.writeAccess || 'private',
      })
    }
  }, [cluster])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await dispatch(updateCluster({ clusterId: cluster.id, data: formData })).unwrap()
      toast.success('Cluster updated successfully!')
      dispatch(fetchClusters())
      onClose()
    } catch (error) {
      toast.error(error || 'Failed to update cluster')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!cluster) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-dark-surface border border-dark-border rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-dark-text">Update Cluster</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-card transition-colors"
          >
            <FiX className="w-5 h-5 text-dark-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Cluster Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="My Cluster"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input resize-none"
              placeholder="Optional description..."
            />
          </div>

          {/* Read Access */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Read Access
            </label>
            <select
              name="readAccess"
              value={formData.readAccess}
              onChange={handleChange}
              className="input"
            >
              <option value="private">Private</option>
              <option value="authenticated">Authenticated</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* Write Access */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Write Access
            </label>
            <select
              name="writeAccess"
              value={formData.writeAccess}
              onChange={handleChange}
              className="input"
            >
              <option value="private">Private</option>
              <option value="authenticated">Authenticated</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </span>
              ) : (
                'Update Cluster'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default UpdateClusterModal

