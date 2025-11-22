import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiUpload, FiFile } from 'react-icons/fi'
import { storageAPI } from '../../services/api'
import toast from 'react-hot-toast'

const FileUploadModal = ({ bucket, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [metadata, setMetadata] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size
    if (file.size > bucket.maxFileSize) {
      toast.error(`File size exceeds maximum allowed size of ${(bucket.maxFileSize / (1024 * 1024)).toFixed(2)} MB`)
      return
    }

    // Check file type if restrictions exist
    if (bucket.allowedFileTypes && bucket.allowedFileTypes.length > 0) {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const isAllowed = bucket.allowedFileTypes.some(
        (type) => type.toLowerCase() === fileExt
      )
      if (!isAllowed) {
        toast.error(`File type not allowed. Allowed types: ${bucket.allowedFileTypes.join(', ')}`)
        return
      }
    }

    setSelectedFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (metadata.trim()) {
        try {
          JSON.parse(metadata) // Validate JSON
          formData.append('metadata', metadata)
        } catch {
          toast.error('Invalid JSON in metadata field')
          setIsLoading(false)
          return
        }
      }

      await storageAPI.uploadFile(bucket.id, formData)
      toast.success('File uploaded successfully!')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload file')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

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
          <h2 className="text-xl font-bold text-dark-text">Upload File</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-card transition-colors"
          >
            <FiX className="w-5 h-5 text-dark-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Select File *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center cursor-pointer hover:border-accent-purple transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <FiFile className="w-12 h-12 text-accent-purple mx-auto" />
                  <p className="font-medium text-dark-text">{selectedFile.name}</p>
                  <p className="text-sm text-dark-text-muted">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FiUpload className="w-12 h-12 text-dark-text-muted mx-auto" />
                  <p className="text-dark-text">Click to select a file</p>
                  <p className="text-sm text-dark-text-muted">
                    Max size: {formatFileSize(bucket.maxFileSize)}
                  </p>
                  {bucket.allowedFileTypes && bucket.allowedFileTypes.length > 0 && (
                    <p className="text-xs text-dark-text-muted">
                      Allowed: {bucket.allowedFileTypes.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metadata (Optional) */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Metadata (Optional JSON)
            </label>
            <textarea
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              rows={3}
              className="input font-mono text-sm"
              placeholder='{"key": "value"}'
            />
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
              disabled={isLoading || !selectedFile}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </span>
              ) : (
                <>
                  <FiUpload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default FileUploadModal

