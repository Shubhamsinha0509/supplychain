import React, { useState } from 'react'
import { QrCode, Package, MapPin, Calendar, Star, User, AlertCircle, CheckCircle, ExternalLink, Download } from 'lucide-react'

const Scan = () => {
  const [qrData, setQrData] = useState('')
  const [scannedData, setScannedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleQRInput = (e) => {
    setQrData(e.target.value)
  }

  const parseQRCode = async () => {
    if (!qrData.trim()) {
      setError('Please enter QR code data')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Parse the QR code data
      const payload = JSON.parse(qrData)
      
      if (payload.type === 'batch_tracking' && payload.data) {
        // Fetch additional batch information from API
        const response = await fetch(`http://localhost:3000/api/batches`)
        if (response.ok) {
          const result = await response.json()
          const batch = result.data.find(b => b.batchId === payload.data.batchId)
          
          if (batch) {
            setScannedData({
              ...payload,
              fullBatchData: batch
            })
          } else {
            setScannedData(payload)
          }
        } else {
          setScannedData(payload)
        }
      } else {
        setError('Invalid QR code format')
      }
    } catch (err) {
      setError('Invalid QR code data. Please check the format.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'REGISTERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_TRANSIT':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'AT_WHOLESALER':
        return <User className="h-4 w-4 text-orange-600" />
      case 'AT_RETAILER':
        return <Star className="h-4 w-4 text-purple-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'REGISTERED':
        return 'bg-green-100 text-green-800'
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800'
      case 'AT_WHOLESALER':
        return 'bg-orange-100 text-orange-800'
      case 'AT_RETAILER':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <QrCode className="h-12 w-12 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
        </div>
        <p className="text-gray-600">
          Scan or paste QR code data to view batch information
        </p>
      </div>

      {/* QR Input */}
      <div className="card mb-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Data
          </label>
          <textarea
            value={qrData}
            onChange={handleQRInput}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Paste QR code data here or scan with your device..."
          />
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={parseQRCode}
            disabled={loading || !qrData.trim()}
            className="btn-primary inline-flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR Code
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Scanned Data Display */}
      {scannedData && (
        <div className="space-y-6">
          {/* Batch Information Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Batch Information</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(scannedData.data.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scannedData.data.status)}`}>
                  {scannedData.data.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Batch ID</span>
                      <p className="font-medium text-gray-900">{scannedData.data.batchId}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Produce Type</span>
                      <p className="font-medium text-gray-900">{scannedData.data.produceType}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Farmer</span>
                      <p className="font-medium text-gray-900">{scannedData.data.farmer}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Quality Grade</span>
                      <p className="font-medium text-gray-900">Grade {scannedData.data.qualityGrade}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Quantity</span>
                      <p className="font-medium text-gray-900">{scannedData.data.quantity} kg</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Location</span>
                      <p className="font-medium text-gray-900">{scannedData.data.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Harvest Date</span>
                      <p className="font-medium text-gray-900">{scannedData.data.harvestDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Created</span>
                      <p className="font-medium text-gray-900">
                        {new Date(scannedData.data.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Information */}
            {scannedData.data.blockchain && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">Blockchain Verified</h4>
                </div>
                <p className="text-sm text-green-700">
                  This batch is registered on the blockchain for complete transparency and traceability.
                </p>
                {scannedData.data.blockchain.transactionHash && (
                  <p className="text-xs text-green-600 mt-1">
                    TX: {scannedData.data.blockchain.transactionHash.substring(0, 20)}...
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {scannedData.urls && (
                <>
                  {scannedData.urls.web && (
                    <a
                      href={scannedData.urls.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline inline-flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Details
                    </a>
                  )}
                  
                  {scannedData.urls.api && (
                    <a
                      href={scannedData.urls.api}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline inline-flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      API Data
                    </a>
                  )}

                  {scannedData.urls.blockchain && (
                    <a
                      href={scannedData.urls.blockchain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline inline-flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Blockchain Data
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Full Batch Data (if available) */}
          {scannedData.fullBatchData && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Batch Data</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(scannedData.fullBatchData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* QR Code Raw Data */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Raw Data</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(scannedData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Scan
