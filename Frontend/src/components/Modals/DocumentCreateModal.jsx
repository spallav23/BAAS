import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { dataAPI } from '../../services/api'
import toast from 'react-hot-toast'

const DocumentCreateModal = ({ cluster, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({})
  const [jsonInput, setJsonInput] = useState('')
  const [useJson, setUseJson] = useState(false)

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

      await dataAPI.createDocument(cluster.id, data)
      toast.success('Document created successfully!')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create document')
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
          <h2 className="text-xl font-bold text-dark-text">Create Document</h2>
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
                placeholder='{"name": "John Doe", "age": 30, "email": "john@example.com"}'
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
                    value={value}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
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
                  Creating...
                </span>
              ) : (
                'Create Document'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default DocumentCreateModal

