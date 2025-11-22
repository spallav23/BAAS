import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiDatabase,
  FiServer,
  FiZap,
  FiShield,
  FiArrowRight,
  FiCheck,
  FiCode,
  FiBarChart,
} from 'react-icons/fi'

const Landing = () => {
  const getColorClasses = (color) => {
    const colorMap = {
      'accent-blue': {
        bg: 'bg-accent-blue/20',
        text: 'text-accent-blue',
      },
      'accent-purple': {
        bg: 'bg-accent-purple/20',
        text: 'text-accent-purple',
      },
      'accent-green': {
        bg: 'bg-accent-green/20',
        text: 'text-accent-green',
      },
      'accent-pink': {
        bg: 'bg-accent-pink/20',
        text: 'text-accent-pink',
      },
      'accent-orange': {
        bg: 'bg-accent-orange/20',
        text: 'text-accent-orange',
      },
    }
    return colorMap[color] || colorMap['accent-blue']
  }

  const features = [
    {
      icon: FiDatabase,
      title: 'Database Management',
      description: 'Create and manage multiple database clusters with ease',
      color: 'accent-blue',
    },
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Optimized performance for your applications',
      color: 'accent-purple',
    },
    {
      icon: FiShield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security and data protection',
      color: 'accent-green',
    },
    {
      icon: FiBarChart,
      title: 'Analytics Dashboard',
      description: 'Monitor your clusters with real-time analytics',
      color: 'accent-pink',
    },
    {
      icon: FiCode,
      title: 'Developer Friendly',
      description: 'RESTful APIs and comprehensive documentation',
      color: 'accent-orange',
    },
    {
      icon: FiServer,
      title: 'Scalable Infrastructure',
      description: 'Scale your databases as your needs grow',
      color: 'accent-blue',
    },
  ]

  const benefits = [
    'Easy cluster creation and management',
    'Real-time monitoring and analytics',
    'Secure authentication and authorization',
    'RESTful API access',
    'Scalable and reliable infrastructure',
    '24/7 support and documentation',
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 via-accent-purple/10 to-accent-pink/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="gradient-text">BaaS Platform</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-dark-text-muted mb-8 max-w-3xl mx-auto"
            >
              The modern way to manage your databases. Create, scale, and monitor
              your clusters with ease.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2"
                >
                  Get Started
                  <FiArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-secondary text-lg px-8 py-4"
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark-text mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-dark-text-muted max-w-2xl mx-auto">
            Everything you need to manage your databases efficiently
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            const colorClasses = getColorClasses(feature.color)
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className="card"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${colorClasses.bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
                <h3 className="text-xl font-bold text-dark-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-dark-text-muted">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="bg-dark-surface py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-dark-text mb-6">
                Why Choose BaaS Platform?
              </h2>
              <p className="text-lg text-dark-text-muted mb-8">
                Experience the power of modern database management with our
                comprehensive platform designed for developers and businesses.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-dark-text"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-4 h-4 text-accent-green" />
                    </div>
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                      <FiDatabase className="w-8 h-8 text-accent-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark-text">
                        Database Clusters
                      </h3>
                      <p className="text-dark-text-muted">Manage with ease</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                      <FiBarChart className="w-8 h-8 text-accent-purple" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark-text">
                        Analytics
                      </h3>
                      <p className="text-dark-text-muted">Real-time insights</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-accent-green/20 flex items-center justify-center">
                      <FiShield className="w-8 h-8 text-accent-green" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark-text">
                        Security
                      </h3>
                      <p className="text-dark-text-muted">
                        Enterprise-grade protection
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card text-center bg-gradient-to-br from-accent-blue/10 via-accent-purple/10 to-accent-pink/10 border-accent-blue/30"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark-text mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-dark-text-muted mb-8 max-w-2xl mx-auto">
            Join thousands of developers using BaaS Platform to manage their
            databases efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2"
              >
                Create Free Account
                <FiArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary text-lg px-8 py-4"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Landing

