import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi'
import { createCluster, fetchClusters } from '../../store/slices/clusterSlice'
import toast from 'react-hot-toast'

const CreateClusterModal = ({ onClose }) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    readAccess: 'private',
    writeAccess: 'private',
    schema: {
      fields: [],
      strict: false,
    },
    indexes: [],
  })
  const [schemaField, setSchemaField] = useState({
    name: '',
    type: 'String',
    required: false,
    unique: false,
  })
  const [showSchemaBuilder, setShowSchemaBuilder] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const clusterData = {
        name: formData.name,
        description: formData.description,
        readAccess: formData.readAccess,
        writeAccess: formData.writeAccess,
        ...(formData.schema.fields.length > 0 && { schema: formData.schema }),
        ...(formData.indexes.length > 0 && { indexes: formData.indexes }),
      }
      await dispatch(createCluster(clusterData)).unwrap()
      toast.success('Cluster created successfully!')
      dispatch(fetchClusters())
      onClose()
    } catch (error) {
      toast.error(error || 'Failed to create cluster')
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

  const handleSchemaFieldChange = (e) => {
    const { name, value, type, checked } = e.target
    setSchemaField({
      ...schemaField,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const addSchemaField = () => {
    if (!schemaField.name.trim()) {
      toast.error('Field name is required')
      return
    }

    if (formData.schema.fields.some((f) => f.name === schemaField.name)) {
      toast.error('Field name already exists')
      return
    }

    setFormData({
      ...formData,
      schema: {
        ...formData.schema,
        fields: [...formData.schema.fields, { ...schemaField }],
      },
    })
    setSchemaField({
      name: '',
      type: 'String',
      required: false,
      unique: false,
    })
  }

  const removeSchemaField = (index) => {
    setFormData({
      ...formData,
      schema: {
        ...formData.schema,
        fields: formData.schema.fields.filter((_, i) => i !== index),
      },
    })
  }

  const fieldTypes = [
    'String',
    'Number',
    'Boolean',
    'Date',
    'Object',
    'Array',
    'ObjectId',
  ]

  return (
    <AnimatePresence>
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
            <h2 className="text-xl font-bold text-dark-text">Create Cluster</h2>
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

            {/* Schema Builder */}
            <div className="border-t border-dark-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-dark-text">Schema (Optional)</h3>
                  <p className="text-sm text-dark-text-muted">
                    Define the structure of your documents
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSchemaBuilder(!showSchemaBuilder)}
                  className="btn btn-secondary text-sm"
                >
                  {showSchemaBuilder ? 'Hide' : 'Show'} Schema Builder
                </button>
              </div>

              {showSchemaBuilder && (
                <div className="space-y-4">
                  {/* Schema Fields List */}
                  {formData.schema.fields.length > 0 && (
                    <div className="space-y-2">
                      {formData.schema.fields.map((field, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-dark-card rounded-lg"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-dark-text">
                              {field.name}
                            </span>
                            <span className="text-sm text-dark-text-muted ml-2">
                              ({field.type})
                            </span>
                            <div className="flex gap-2 mt-1">
                              {field.required && (
                                <span className="text-xs px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded">
                                  Required
                                </span>
                              )}
                              {field.unique && (
                                <span className="text-xs px-2 py-0.5 bg-accent-purple/20 text-accent-purple rounded">
                                  Unique
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSchemaField(index)}
                            className="p-2 rounded-lg hover:bg-red-600/20 text-red-400"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Schema Field */}
                  <div className="p-4 bg-dark-card rounded-lg border border-dark-border">
                    <h4 className="text-sm font-medium text-dark-text mb-3">
                      Add Field
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-dark-text-muted mb-1">
                            Field Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={schemaField.name}
                            onChange={handleSchemaFieldChange}
                            className="input text-sm"
                            placeholder="fieldName"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-dark-text-muted mb-1">
                            Type
                          </label>
                          <select
                            name="type"
                            value={schemaField.type}
                            onChange={handleSchemaFieldChange}
                            className="input text-sm"
                          >
                            {fieldTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="required"
                            checked={schemaField.required}
                            onChange={handleSchemaFieldChange}
                            className="w-4 h-4 rounded border-dark-border bg-dark-surface text-accent-blue focus:ring-accent-blue"
                          />
                          <span className="text-sm text-dark-text">Required</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="unique"
                            checked={schemaField.unique}
                            onChange={handleSchemaFieldChange}
                            className="w-4 h-4 rounded border-dark-border bg-dark-surface text-accent-blue focus:ring-accent-blue"
                          />
                          <span className="text-sm text-dark-text">Unique</span>
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={addSchemaField}
                        className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm"
                      >
                        <FiPlus className="w-4 h-4" />
                        Add Field
                      </button>
                    </div>
                  </div>

                  {/* Strict Mode */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.schema.strict}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schema: {
                            ...formData.schema,
                            strict: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded border-dark-border bg-dark-surface text-accent-blue focus:ring-accent-blue"
                    />
                    <span className="text-sm text-dark-text">
                      Strict Mode (reject fields not in schema)
                    </span>
                  </label>
                </div>
              )}
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
                    Creating...
                  </span>
                ) : (
                  'Create Cluster'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CreateClusterModal
