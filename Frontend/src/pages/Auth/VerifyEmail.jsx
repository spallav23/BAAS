import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import {
  sendVerification,
  verifyEmail,
  verifyCode,
  getCurrentUser,
} from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const VerifyEmail = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const email = location.state?.email || user?.email || ''
  const fromLogin = location.state?.fromLogin || false

  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setIsVerifying(true)
    try {
      if (isAuthenticated) {
        // User is logged in, use protected verifyEmail endpoint
        await dispatch(verifyEmail(code)).unwrap()
        toast.success('Email verified successfully!')
        dispatch(getCurrentUser())
        navigate('/dashboard')
      } else {
        // User is not logged in - they need to login first to verify
        toast.error('Please login first to verify your email')
        navigate('/login', { state: { email } })
      }
    } catch (error) {
      toast.error(error || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsSending(true)
    try {
      if (isAuthenticated) {
        await dispatch(sendVerification()).unwrap()
      } else {
        // For unauthenticated users, we can't resend via protected endpoint
        // They should register again or contact support
        toast.error('Please login first to resend verification code')
      }
      toast.success('Verification code sent to your email')
    } catch (error) {
      toast.error(error || 'Failed to send verification code')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-blue/20 flex items-center justify-center"
          >
            <FiMail className="w-8 h-8 text-accent-blue" />
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold gradient-text mb-2"
          >
            Verify Your Email
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-dark-text-muted"
          >
            We've sent a verification code to
            {email && (
              <span className="font-medium text-dark-text"> {email}</span>
            )}
          </motion.p>
        </div>

        {/* Verification Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                required
                className="input text-center text-3xl tracking-widest font-mono"
              />
              <p className="text-xs text-dark-text-muted mt-2 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                <>
                  Verify Email
                  <FiCheckCircle className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Resend Code */}
          {isAuthenticated && (
            <div className="mt-6 text-center">
              <p className="text-sm text-dark-text-muted mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={isSending}
                className="text-sm text-accent-blue hover:text-accent-blue/80 font-medium transition-colors disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          )}

          {/* Back to Login */}
          {!isAuthenticated && (
            <div className="mt-6 pt-6 border-t border-dark-border text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-dark-text-muted hover:text-dark-text transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                Back to Login
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {isAuthenticated && !fromLogin && (
            <div className="mt-6 pt-6 border-t border-dark-border text-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-dark-text-muted hover:text-dark-text transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                Skip for now
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default VerifyEmail

