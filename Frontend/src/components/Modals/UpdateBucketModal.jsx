import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { FiX, FiPlus } from 'react-icons/fi'
import { updateBucket, fetchBuckets } from '../../store/slices/storageSlice'
import toast from 'react-hot-toast'

const UpdateBucketModal = ({ bucket, onClose }) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    readAccess: 'private',
    writeAccess: 'private',
    allowedFileTypes: [],
    maxFileSize: 10 * 1024 * 1024,
  })
  const [fileTypeInput, setFileTypeInput] = useState('')

  useEffect(() => {
    if (bucket) {
      setFormData({
        name: bucket.name || '',
        description: bucket.description || '',
        readAccess: bucket.readAccess || 'private',
        writeAccess: bucket.writeAccess || 'private',
        allowedFileTypes: bucket.allowedFileTypes || [],
        maxFileSize: bucket.maxFileSize || 10 * 1024 * 1024,
      })
    }
  }, [bucket])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await dispatch(updateBucket({ bucketId: bucket.id, data: formData })).unwrap()
      toast.success('Bucket updated successfully!')
      dispatch(fetchBuckets())
      onClose()
    } catch (error) {
      toast.error(error || 'Failed to update bucket')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const addFileType = () => {
    if (fileTypeInput.trim() && !formData.allowedFileTypes.includes(fileTypeInput.trim())) {
      setFormData({
        ...formData,
        allowedFileTypes: [...formData.allowedFileTypes, fileTypeInput.trim()],
      })
      setFileTypeInput('')
    }
  }

  const removeFileType = (type) => {
    setFormData({
      ...formData,
      allowedFileTypes: formData.allowedFileTypes.filter((t) => t !== type),
    })
  }

  const formatFileSize = (bytes) => {
    const mb = bytes / (1024 * 1024)
    return `${mb} MB`
  }

  if (!bucket) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
        className="relative w-full max-w-2xl bg-dark-surface border border-dark-border rounded-xl shadow-2xl my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-dark-text">Update Bucket</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-card transition-colors"
          >
            <FiX className="w-5 h-5 text-dark-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Bucket Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="My Bucket"
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

          {/* Access Controls */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Max File Size */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Max File Size (MB)
            </label>
            <input
              type="number"
              name="maxFileSize"
              value={formData.maxFileSize / (1024 * 1024)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxFileSize: parseInt(e.target.value) * 1024 * 1024,
                })
              }
              min="1"
              className="input"
            />
            <p className="text-xs text-dark-text-muted mt-1">
              Current: {formatFileSize(formData.maxFileSize)}
            </p>
          </div>

          {/* Allowed File Types */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Allowed File Types (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={fileTypeInput}
                onChange={(e) => setFileTypeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFileType()
                  }
                }}
                placeholder="e.g., jpg, png, pdf"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addFileType}
                className="btn btn-secondary flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add
              </button>
            </div>
            {formData.allowedFileTypes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.allowedFileTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-sm"
                  >
                    {type}
                    <button
                      type="button"
                      onClick={() => removeFileType(type)}
                      className="hover:text-red-400"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-dark-text-muted mt-1">
              Leave empty to allow all file types
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-dark-border">
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
                'Update Bucket'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default UpdateBucketModal

