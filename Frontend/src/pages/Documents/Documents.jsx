import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiBook,
  FiCode,
  FiDatabase,
  FiKey,
  FiShield,
  FiZap,
  FiChevronRight,
  FiSearch,
} from 'react-icons/fi'

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All', icon: FiBook },
    { id: 'getting-started', label: 'Getting Started', icon: FiZap },
    { id: 'api', label: 'API Reference', icon: FiCode },
    { id: 'database', label: 'Database', icon: FiDatabase },
    { id: 'authentication', label: 'Authentication', icon: FiKey },
    { id: 'security', label: 'Security', icon: FiShield },
  ]

  const docs = [
    {
      id: 1,
      title: 'Getting Started',
      category: 'getting-started',
      description: 'Learn how to set up your account and create your first cluster',
      content: `# Getting Started

Welcome to BaaS Platform! This guide will help you get started with managing your databases.

## Quick Start

1. **Create an Account**
   - Sign up for a free account
   - Verify your email address
   - Complete your profile setup

2. **Create Your First Cluster**
   - Navigate to the Clusters page
   - Click "Create Cluster"
   - Fill in the cluster details
   - Wait for the cluster to be provisioned

3. **Access Your Cluster**
   - Use the cluster connection string
   - Connect using your preferred database client
   - Start managing your data

## Next Steps

- Explore the Dashboard to monitor your clusters
- Read the API documentation for programmatic access
- Check out security best practices`,
    },
    {
      id: 2,
      title: 'API Authentication',
      category: 'authentication',
      description: 'Learn how to authenticate API requests using JWT tokens',
      content: `# API Authentication

BaaS Platform uses JWT (JSON Web Tokens) for API authentication.

## Getting Your API Token

1. Log in to your account
2. Navigate to Settings > API Keys
3. Generate a new API key
4. Copy and store it securely

## Making Authenticated Requests

Include your token in the Authorization header:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" \\
     https://api.baas-platform.com/v1/clusters
\`\`\`

## Token Expiration

Tokens expire after 24 hours. Refresh your token using the refresh endpoint.`,
    },
    {
      id: 3,
      title: 'Creating Clusters',
      category: 'database',
      description: 'Step-by-step guide to creating and managing database clusters',
      content: `# Creating Clusters

Learn how to create and manage database clusters in BaaS Platform.

## Creating a Cluster

1. Go to the Clusters page
2. Click "Create Cluster"
3. Fill in the required information:
   - Cluster Name
   - Database Type
   - Region
   - Configuration

## Cluster Configuration

- **Name**: A unique identifier for your cluster
- **Type**: Choose from supported database types
- **Region**: Select the closest region for better performance
- **Size**: Choose the appropriate cluster size

## Managing Clusters

- View cluster details and metrics
- Monitor performance and usage
- Scale up or down as needed
- Delete clusters when no longer needed`,
    },
    {
      id: 4,
      title: 'REST API Reference',
      category: 'api',
      description: 'Complete API reference for all endpoints',
      content: `# REST API Reference

Complete reference for the BaaS Platform REST API.

## Base URL

\`\`\`
https://api.baas-platform.com/v1
\`\`\`

## Endpoints

### Clusters

- \`GET /clusters\` - List all clusters
- \`POST /clusters\` - Create a new cluster
- \`GET /clusters/:id\` - Get cluster details
- \`PUT /clusters/:id\` - Update cluster
- \`DELETE /clusters/:id\` - Delete cluster

### Authentication

- \`POST /auth/register\` - Register new user
- \`POST /auth/login\` - Login user
- \`POST /auth/refresh\` - Refresh token
- \`POST /auth/logout\` - Logout user

## Response Format

All responses are in JSON format:

\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
\`\`\``,
    },
    {
      id: 5,
      title: 'Security Best Practices',
      category: 'security',
      description: 'Essential security practices for protecting your data',
      content: `# Security Best Practices

Follow these guidelines to keep your data secure.

## Authentication

- Use strong, unique passwords
- Enable two-factor authentication
- Rotate API keys regularly
- Never commit tokens to version control

## Network Security

- Use HTTPS for all connections
- Whitelist IP addresses when possible
- Use VPN for sensitive operations
- Monitor access logs regularly

## Data Protection

- Encrypt sensitive data at rest
- Use connection strings securely
- Implement proper access controls
- Regular backups are essential

## Compliance

- Follow industry standards (SOC 2, GDPR)
- Regular security audits
- Incident response plan
- Data retention policies`,
    },
    {
      id: 6,
      title: 'Performance Optimization',
      category: 'database',
      description: 'Tips for optimizing your database performance',
      content: `# Performance Optimization

Optimize your database clusters for better performance.

## Indexing

- Create indexes on frequently queried fields
- Monitor index usage
- Remove unused indexes
- Use compound indexes when appropriate

## Query Optimization

- Use efficient query patterns
- Avoid N+1 queries
- Use pagination for large datasets
- Cache frequently accessed data

## Scaling

- Monitor resource usage
- Scale up before hitting limits
- Use read replicas for read-heavy workloads
- Implement connection pooling

## Monitoring

- Set up alerts for performance metrics
- Track slow queries
- Monitor connection counts
- Review performance regularly`,
    },
  ]

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const [selectedDoc, setSelectedDoc] = useState(null)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-dark-text mb-4">
          Documentation
        </h1>
        <p className="text-dark-text-muted text-lg">
          Everything you need to know about using BaaS Platform
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text-muted" />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-dark-text-muted uppercase mb-4">
              Categories
            </h3>
            <nav className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                        : 'text-dark-text-muted hover:bg-dark-card hover:text-dark-text'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {selectedDoc ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <button
                onClick={() => setSelectedDoc(null)}
                className="mb-4 text-accent-blue hover:text-accent-blue/80 flex items-center gap-2 transition-colors"
              >
                <FiChevronRight className="w-4 h-4 rotate-180" />
                Back to Documentation
              </button>
              <h2 className="text-3xl font-bold text-dark-text mb-4">
                {selectedDoc.title}
              </h2>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-dark-text bg-dark-surface p-4 rounded-lg border border-dark-border">
                  {selectedDoc.content}
                </pre>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredDocs.length === 0 ? (
                <div className="card text-center py-12">
                  <FiBook className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
                  <p className="text-dark-text-muted">
                    No documentation found matching your search.
                  </p>
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const category = categories.find((c) => c.id === doc.category)
                  const CategoryIcon = category?.icon || FiBook
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="card cursor-pointer"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon className="w-6 h-6 text-accent-blue" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-dark-text">
                              {doc.title}
                            </h3>
                            <FiChevronRight className="w-5 h-5 text-dark-text-muted" />
                          </div>
                          <p className="text-dark-text-muted">
                            {doc.description}
                          </p>
                          <span className="inline-block mt-3 text-xs px-2 py-1 bg-dark-surface rounded text-dark-text-muted">
                            {category?.label}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Documents

