import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Save, QrCode, Download, Share2 } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

const CreateBatch = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [createdBatch, setCreatedBatch] = useState(null)
  const [formData, setFormData] = useState({
    produceType: '',
    quantity: '',
    harvestDate: '',
    location: '',
    qualityGrade: 'A',
    farmer: '',
    notes: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const batchData = {
        ...formData,
        userId: user?.id,
        userEmail: user?.email
      }
      
      const response = await fetch('http://localhost:3000/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Batch created:', result)
        
        // Store the created batch data
        setCreatedBatch(result.data)
        setShowQRCode(true)
        
        // Show success message
        alert('Batch created successfully! QR code generated.')
      } else {
        throw new Error('Failed to create batch')
      }
    } catch (error) {
      console.error('Error creating batch:', error)
      alert('Error creating batch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Batch</h1>
          <p className="text-gray-600 mt-2">Register a new batch of agricultural produce</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produce Type *
                  </label>
                  <select
                    name="produceType"
                    value={formData.produceType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select produce type</option>
                    <option value="Tomatoes">Tomatoes</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Rice">Rice</option>
                    <option value="Apples">Apples</option>
                    <option value="Potatoes">Potatoes</option>
                    <option value="Carrots">Carrots</option>
                    <option value="Onions">Onions</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter quantity in kilograms"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harvest Date *
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Grade *
                  </label>
                  <select
                    name="qualityGrade"
                    value={formData.qualityGrade}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Good)</option>
                    <option value="C">Grade C (Standard)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Farm A, California, USA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farmer Name *
                  </label>
                  <input
                    type="text"
                    name="farmer"
                    value={formData.farmer}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter farmer name"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any additional notes about this batch..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Batch
              </>
            )}
          </button>
        </div>
      </form>

      {/* QR Code Display Modal */}
      {showQRCode && createdBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-green-600 mr-2" />
                <h3 className="text-2xl font-bold text-gray-900">Batch QR Code</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Your batch has been created successfully! Here's the QR code for tracking.
              </p>
              
              {/* QR Code Image */}
              {createdBatch.qrCode && (
                <div className="mb-6">
                  <img 
                    src={createdBatch.qrCode.qrCodeDataURL} 
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
                  <p><span className="font-medium">Batch ID:</span> {createdBatch.batchId}</p>
                  <p><span className="font-medium">Produce:</span> {createdBatch.produceType}</p>
                  <p><span className="font-medium">Quantity:</span> {createdBatch.quantity} kg</p>
                  <p><span className="font-medium">Quality:</span> Grade {createdBatch.qualityGrade}</p>
                  <p><span className="font-medium">Location:</span> {createdBatch.location}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowQRCode(false)
                    navigate('/dashboard', { state: { refresh: true } })
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                {createdBatch.qrCode && (
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = createdBatch.qrCode.qrCodeDataURL
                      link.download = `batch-${createdBatch.batchId}-qr.png`
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

export default CreateBatch
