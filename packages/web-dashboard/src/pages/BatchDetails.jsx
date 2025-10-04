import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Package, MapPin, Clock, User, TrendingUp, AlertCircle, CheckCircle, QrCode, Download } from 'lucide-react'

const BatchDetails = () => {
  const { id } = useParams()
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        setLoading(true)
        
        // Fetch all batches and find the one with matching ID
        const response = await fetch('http://localhost:3000/api/batches')
        if (response.ok) {
          const result = await response.json()
          const foundBatch = result.data.find(b => b.id === parseInt(id))
          
          if (foundBatch) {
            // Add some additional data for display
            const batchWithDetails = {
              ...foundBatch,
              events: [
                {
                  id: 1,
                  type: 'REGISTERED',
                  description: 'Batch registered by farmer',
                  timestamp: foundBatch.createdAt,
                  location: foundBatch.location,
                  actor: foundBatch.farmer
                }
              ],
              qualityChecks: [
                {
                  id: 1,
                  type: 'visual',
                  passed: true,
                  score: foundBatch.qualityGrade === 'A' ? 95 : foundBatch.qualityGrade === 'B' ? 85 : 75,
                  timestamp: foundBatch.createdAt,
                  performedBy: 'Quality Inspector'
                }
              ]
            }
            setBatch(batchWithDetails)
          } else {
            setBatch(null)
          }
        } else {
          console.error('Failed to fetch batches')
          setBatch(null)
        }
      } catch (error) {
        console.error('Error fetching batch:', error)
        setBatch(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBatch()
  }, [id])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Batch not found</h3>
        <p className="text-gray-600">The requested batch could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{batch.batchId}</h1>
          <p className="text-gray-600 mt-2">{batch.produceType} • {batch.quantity} kg</p>
        </div>
        <span className={getStatusBadge(batch.status)}>
          {getStatusIcon(batch.status)}
          <span className="ml-1">{batch.status.replace('_', ' ')}</span>
        </span>
      </div>

      {/* Batch Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Produce Type</label>
                <p className="text-lg font-semibold text-gray-900">{batch.produceType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quantity</label>
                <p className="text-lg font-semibold text-gray-900">{batch.quantity} kg</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quality Grade</label>
                <p className="text-lg font-semibold text-gray-900">{batch.qualityGrade}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Harvest Date</label>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(batch.harvestDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Farmer</label>
                <p className="text-lg font-semibold text-gray-900">{batch.farmer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Location</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-semibold text-gray-900">{batch.location}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created Date</label>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(batch.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Blockchain Verification */}
            {batch.blockchain && batch.blockchain.onBlockchain && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">Blockchain Verified</h4>
                </div>
                <p className="text-sm text-green-700">
                  This batch is registered on the blockchain for complete transparency.
                </p>
                {batch.blockchain.transactionHash && (
                  <p className="text-xs text-green-600 mt-1">
                    TX: {batch.blockchain.transactionHash.substring(0, 20)}...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Supply Chain Events */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supply Chain History</h3>
            <div className="space-y-4">
              {batch.events.map((event, index) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {getStatusIcon(event.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {event.type.replace('_', ' ')}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{event.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{event.location}</span>
                      </div>
                      <span className="text-sm text-gray-500">by {event.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Checks */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Checks</h3>
            <div className="space-y-4">
              {batch.qualityChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      check.passed ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {check.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">{check.type} Check</h4>
                      <p className="text-sm text-gray-600">Score: {check.score}/100</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(check.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">{check.performedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Batch Information Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Batch ID</span>
                <span className="font-semibold">{batch.batchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Produce Type</span>
                <span className="font-semibold">{batch.produceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity</span>
                <span className="font-semibold">{batch.quantity} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quality Grade</span>
                <span className="font-semibold">Grade {batch.qualityGrade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(batch.status).split(' ')[1]}`}>
                  {batch.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Quality Score</span>
                </div>
                <span className="font-semibold text-green-600">95%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">Days in Transit</span>
                </div>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-600">Events</span>
                </div>
                <span className="font-semibold">{batch.events.length}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {batch.qrCode && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
              <div className="text-center">
                <img 
                  src={batch.qrCode.qrCodeDataURL} 
                  alt="Batch QR Code"
                  className="mx-auto border-2 border-gray-200 rounded-lg mb-4"
                  style={{ width: '200px', height: '200px' }}
                />
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code to track this batch
                </p>
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = batch.qrCode.qrCodeDataURL
                    link.download = `batch-${batch.batchId}-qr.png`
                    link.click()
                  }}
                  className="w-full btn-outline inline-flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-primary">
                Update Status
              </button>
              {!batch.qrCode && (
                <button className="w-full btn-outline">
                  Generate QR Code
                </button>
              )}
              <button className="w-full btn-outline">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BatchDetails
