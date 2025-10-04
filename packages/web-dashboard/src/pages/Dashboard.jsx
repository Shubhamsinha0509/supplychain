import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Package, TrendingUp, AlertCircle, CheckCircle, Clock, MapPin, RefreshCw, QrCode, Download, DollarSign } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

const Dashboard = () => {
  const { user } = useUser()
  const location = useLocation()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)

  // Fetch user-specific batches from API
  useEffect(() => {
    const fetchBatches = async () => {
      if (!user?.id) {
        setBatches([])
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch(`http://localhost:3000/api/batches/user/${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setBatches(data.data || [])
        } else {
          throw new Error('Failed to fetch batches')
        }
      } catch (error) {
        console.error('Error fetching batches:', error)
        setBatches([])
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [user?.id])

  // Refresh batches when component becomes visible (e.g., after creating a batch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        const fetchBatches = async () => {
          try {
            const response = await fetch(`http://localhost:3000/api/batches/user/${user.id}`)
            if (response.ok) {
              const data = await response.json()
              setBatches(data.data || [])
            }
          } catch (error) {
            console.error('Error refreshing batches:', error)
          }
        }
        fetchBatches()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?.id])

  // Handle refresh from navigation state
  useEffect(() => {
    if (location.state?.refresh && user?.id) {
      refreshBatches()
      // Clear the refresh state
      window.history.replaceState({}, document.title)
    }
  }, [location.state?.refresh, user?.id])

  // Manual refresh function
  const refreshBatches = async () => {
    if (!user?.id) return
    
    setRefreshing(true)
    try {
      const response = await fetch(`http://localhost:3000/api/batches/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setBatches(data.data || [])
      }
    } catch (error) {
      console.error('Error refreshing batches:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const generateQRCode = async (batch) => {
    try {
      const response = await fetch(`http://localhost:3000/api/batches/${batch.id}/qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update the batch with QR code data
          setBatches(prevBatches => 
            prevBatches.map(b => 
              b.id === batch.id 
                ? { ...b, qrCode: result.data.qrCode }
                : b
            )
          )
          setSelectedBatch({ ...batch, qrCode: result.data.qrCode })
          setShowQRModal(true)
        }
      } else {
        alert('Failed to generate QR code')
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Error generating QR code')
    }
  }

  const showQRCode = (batch) => {
    if (batch.qrCode) {
      setSelectedBatch(batch)
      setShowQRModal(true)
    } else {
      generateQRCode(batch)
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      'REGISTERED': 'status-badge status-registered',
      'IN_TRANSIT': 'status-badge status-in-transit',
      'AT_WHOLESALER': 'status-badge status-at-wholesaler',
      'AT_RETAILER': 'status-badge status-at-retailer',
      'SOLD_TO_CONSUMER': 'status-badge status-sold'
    }
    return statusClasses[status] || 'status-badge bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'REGISTERED':
        return <CheckCircle className="h-4 w-4" />
      case 'IN_TRANSIT':
        return <Clock className="h-4 w-4" />
      case 'AT_WHOLESALER':
        return <Package className="h-4 w-4" />
      case 'AT_RETAILER':
        return <Package className="h-4 w-4" />
      case 'SOLD_TO_CONSUMER':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const stats = [
    { label: 'Total Batches', value: batches.length, icon: Package, color: 'text-blue-600' },
    { label: 'In Transit', value: batches.filter(b => b.status === 'IN_TRANSIT').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'At Wholesaler', value: batches.filter(b => b.status === 'AT_WHOLESALER').length, icon: Package, color: 'text-orange-600' },
    { label: 'Quality Score', value: '98.5%', icon: TrendingUp, color: 'text-green-600' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your agricultural produce batches</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshBatches}
            disabled={refreshing}
            className="btn-outline inline-flex items-center hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link to="/dashboard/new" className="btn-primary inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Batch
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Batches */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Batches</h2>
          <Link to="/dashboard/batches" className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first batch</p>
            <Link to="/dashboard/new" className="btn-primary">
              Create First Batch
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">{batch.batchId}</h3>
                        <span className={getStatusBadge(batch.status)}>
                          {getStatusIcon(batch.status)}
                          <span className="ml-1">{batch.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-gray-600">{batch.produceType} • {batch.quantity} kg</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{batch.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => showQRCode(batch)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>QR Code</span>
                    </button>
                    <Link 
                      to={`/batch/${batch.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Register Batch</h3>
          <p className="text-gray-600 mb-4">Create a new batch of produce for tracking</p>
          <Link to="/dashboard/new" className="btn-primary">
            Register Now
          </Link>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Analytics</h3>
          <p className="text-gray-600 mb-4">Track performance and quality metrics</p>
          <Link to="/dashboard/analytics" className="btn-outline">
            View Analytics
          </Link>
        </div>

        {user?.userType?.toLowerCase() !== 'farmer' && (
          <div className="card text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Pricing</h3>
            <p className="text-gray-600 mb-4">Set and manage prices for batches</p>
            <Link to="/pricing" className="btn-outline">
              Manage Pricing
            </Link>
          </div>
        )}

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Reports</h3>
          <p className="text-gray-600 mb-4">Monitor quality and compliance reports</p>
          <Link to="/dashboard/reports" className="btn-outline">
            View Reports
          </Link>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-green-600 mr-2" />
                <h3 className="text-2xl font-bold text-gray-900">Batch QR Code</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Scan this QR code to track this batch in the supply chain.
              </p>
              
              {/* QR Code Image */}
              {selectedBatch.qrCode && (
                <div className="mb-6">
                  <img 
                    src={selectedBatch.qrCode.qrCodeDataURL} 
                    alt="Batch QR Code"
                    className="mx-auto border-2 border-gray-200 rounded-lg"
                    style={{ width: '250px', height: '250px' }}
                  />
                </div>
              )}
              
              {/* Batch Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Batch Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Batch ID:</span> {selectedBatch.batchId}</p>
                  <p><span className="font-medium">Produce:</span> {selectedBatch.produceType}</p>
                  <p><span className="font-medium">Quantity:</span> {selectedBatch.quantity} kg</p>
                  <p><span className="font-medium">Quality:</span> Grade {selectedBatch.qualityGrade}</p>
                  <p><span className="font-medium">Location:</span> {selectedBatch.location}</p>
                  <p><span className="font-medium">Status:</span> {selectedBatch.status.replace('_', ' ')}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                {selectedBatch.qrCode && (
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = selectedBatch.qrCode.qrCodeDataURL
                      link.download = `batch-${selectedBatch.batchId}-qr.png`
                      link.click()
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
