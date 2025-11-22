import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { dataAPI } from '../../services/api'
import toast from 'react-hot-toast'

const DocumentEditModal = ({ cluster, document, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({})
  const [jsonInput, setJsonInput] = useState('')
  const [useJson, setUseJson] = useState(false)

  useEffect(() => {
    if (document) {
      const { _id, createdAt, updatedAt, ...data } = document
      setFormData(data)
      setJsonInput(JSON.stringify(data, null, 2))
    }
  }, [document])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let data
      if (useJson) {
        try {
          data = JSON.parse(jsonInput)
        } catch (error) {
          toast.error('Invalid JSON format')
          setIsLoading(false)
          return
        }
      } else {
        data = formData
      }

      await dataAPI.updateDocument(cluster.id, document._id, data)
      toast.success('Document updated successfully!')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update document')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    })
  }

  const addField = () => {
    const newKey = `field_${Date.now()}`
    setFormData({
      ...formData,
      [newKey]: '',
    })
  }

  const removeField = (key) => {
    const newData = { ...formData }
    delete newData[key]
    setFormData(newData)
  }

  if (!document) return null

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
          <h2 className="text-xl font-bold text-dark-text">Edit Document</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-card transition-colors"
          >
            <FiX className="w-5 h-5 text-dark-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Toggle JSON/Form */}
          <div className="flex items-center gap-4 pb-4 border-b border-dark-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useJson}
                onChange={() => setUseJson(false)}
                className="w-4 h-4"
              />
              <span className="text-sm text-dark-text">Form Mode</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useJson}
                onChange={() => setUseJson(true)}
                className="w-4 h-4"
              />
              <span className="text-sm text-dark-text">JSON Mode</span>
            </label>
          </div>

          {useJson ? (
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Document Data (JSON)
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={12}
                className="input font-mono text-sm"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(formData).map(([key, value], index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newData = { ...formData }
                      delete newData[key]
                      newData[e.target.value] = value
                      setFormData(newData)
                    }}
                    placeholder="Field name"
                    className="input flex-1"
                  />
                  <input
                    type="text"
                    value={typeof value === 'object' ? JSON.stringify(value) : value}
                    onChange={(e) => {
                      let parsedValue = e.target.value
                      try {
                        parsedValue = JSON.parse(e.target.value)
                      } catch {
                        // Keep as string if not valid JSON
                      }
                      handleFieldChange(key, parsedValue)
                    }}
                    placeholder="Value"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeField(key)}
                    className="btn btn-danger px-3"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addField}
                className="btn btn-secondary w-full"
              >
                Add Field
              </button>
            </div>
          )}

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
                'Update Document'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default DocumentEditModal

