import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUser,
  FiMail,
  FiSave,
  FiTrash2,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
} from 'react-icons/fi'
import {
  getCurrentUser,
  updateUser,
  deleteUser,
  sendVerification,
  verifyEmail,
  logout,
} from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const Profile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isLoading } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      })
    } else {
      dispatch(getCurrentUser())
    }
  }, [user, dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const updateData = {}
      if (formData.name !== user.name) updateData.name = formData.name
      if (formData.email !== user.email) updateData.email = formData.email

      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to save')
        return
      }

      await dispatch(updateUser({ userId: user.id, data: updateData })).unwrap()
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      if (updateData.email) {
        toast.info('Please verify your new email address')
        setShowVerificationModal(true)
      }
      dispatch(getCurrentUser())
    } catch (error) {
      toast.error(error || 'Failed to update profile')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteUser(user.id)).unwrap()
      toast.success('Account deleted successfully')
      navigate('/')
    } catch (error) {
      toast.error(error || 'Failed to delete account')
    }
  }

  const handleSendVerification = async () => {
    try {
      await dispatch(sendVerification()).unwrap()
      toast.success('Verification code sent to your email')
      setShowVerificationModal(true)
    } catch (error) {
      toast.error(error || 'Failed to send verification code')
    }
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    try {
      await dispatch(verifyEmail(verificationCode)).unwrap()
      toast.success('Email verified successfully!')
      setShowVerificationModal(false)
      setVerificationCode('')
      dispatch(getCurrentUser())
    } catch (error) {
      toast.error(error || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">Profile</h1>
          <p className="text-dark-text-muted">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <FiUser className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-dark-text">{user.name}</h2>
            <p className="text-dark-text-muted">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {user.emailVerified ? (
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-accent-green/20 text-accent-green rounded-full">
                  <FiCheckCircle className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                  <FiXCircle className="w-3 h-3" />
                  Not Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="input pl-10 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="input pl-10 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="your@email.com"
              />
            </div>
            {!user.emailVerified && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm text-dark-text-muted">
                  Email not verified
                </p>
                <button
                  type="button"
                  onClick={handleSendVerification}
                  className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
                >
                  Verify Email
                </button>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="pt-4 border-t border-dark-border">
            <h3 className="text-sm font-semibold text-dark-text-muted uppercase mb-3">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-dark-text-muted mb-1">
                  Account Created
                </p>
                <p className="text-dark-text">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-text-muted mb-1">Last Login</p>
                <p className="text-dark-text">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-dark-border">
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                    })
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Profile
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center gap-3 mb-4">
          <FiShield className="w-5 h-5 text-accent-blue" />
          <h2 className="text-xl font-bold text-dark-text">Security</h2>
        </div>
        <p className="text-dark-text-muted mb-4">
          Manage your account security settings
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-dark-surface border border-dark-border">
            <div>
              <p className="font-medium text-dark-text">Email Verification</p>
              <p className="text-sm text-dark-text-muted">
                {user.emailVerified
                  ? 'Your email is verified'
                  : 'Please verify your email address'}
              </p>
            </div>
            {!user.emailVerified && (
              <button
                onClick={handleSendVerification}
                className="btn btn-secondary text-sm"
              >
                Verify
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card border-red-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <FiTrash2 className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>
        </div>
        <p className="text-dark-text-muted mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn btn-danger"
        >
          Delete Account
        </button>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-dark-text mb-2">
              Delete Account
            </h3>
            <p className="text-dark-text-muted mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="btn btn-danger flex-1"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-dark-text mb-2">
              Verify Email
            </h3>
            <p className="text-dark-text-muted mb-6">
              Enter the 6-digit verification code sent to your email address.
            </p>
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="input text-center text-2xl tracking-widest"
                required
              />
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationModal(false)
                    setVerificationCode('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="btn btn-primary flex-1"
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSendVerification}
                className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors w-full"
              >
                Resend Code
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Profile

