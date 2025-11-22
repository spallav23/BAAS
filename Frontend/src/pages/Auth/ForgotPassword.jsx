import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { forgotPassword, verifyCode, resetPassword } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: email, 2: verify code, 3: reset password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await dispatch(forgotPassword(email)).unwrap()
      toast.success('Password reset code sent to your email')
      setStep(2)
    } catch (error) {
      toast.error(error || 'Failed to send reset code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      await dispatch(verifyCode({ email, code })).unwrap()
      toast.success('Code verified successfully')
      setStep(3)
    } catch (error) {
      toast.error(error || 'Invalid or expired code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await dispatch(resetPassword({ email, code, newPassword })).unwrap()
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (error) {
      toast.error(error || 'Password reset failed')
    } finally {
      setIsLoading(false)
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
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold gradient-text mb-2"
          >
            Reset Password
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-dark-text-muted"
          >
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && 'Enter the verification code from your email'}
            {step === 3 && 'Enter your new password'}
          </motion.p>
        </div>

        {/* Step 1: Request Code */}
        {step === 1 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  <>
                    Send Reset Code
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-dark-text-muted hover:text-dark-text transition-colors"
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card"
          >
            <form onSubmit={handleVerifyCode} className="space-y-6">
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
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  <>
                    Verify Code
                    <FiCheckCircle className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-dark-text-muted hover:text-dark-text transition-colors"
              >
                Change Email
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card"
          >
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </span>
                ) : (
                  <>
                    Reset Password
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPassword

