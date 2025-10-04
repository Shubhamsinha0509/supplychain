import React, { useState, useEffect } from 'react'
import { DollarSign, Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

const Pricing = () => {
  const { user } = useUser()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [pricingData, setPricingData] = useState({
    farmGatePrice: '',
    wholesalePrice: '',
    retailPrice: '',
    currency: 'USD'
  })

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/batches')
      if (response.ok) {
        const result = await response.json()
        setBatches(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePricingSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBatch) return

    try {
      // Here you would call the pricing API
      console.log('Setting prices for batch:', selectedBatch.batchId, pricingData)
      alert('Pricing updated successfully!')
      setSelectedBatch(null)
      setPricingData({ farmGatePrice: '', wholesalePrice: '', retailPrice: '', currency: 'USD' })
    } catch (error) {
      console.error('Error updating pricing:', error)
      alert('Error updating pricing')
    }
  }

  const canManagePricing = user?.userType && ['wholesaler', 'retailer', 'government'].includes(user.userType.toLowerCase())

  if (!canManagePricing) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">Only wholesalers, retailers, and government officials can manage pricing.</p>
      </div>
    )
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600 mt-2">Set and manage prices for agricultural produce batches</p>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* Pricing Form */}
      {selectedBatch && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Set Prices for {selectedBatch.batchId}
          </h3>
          <form onSubmit={handlePricingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Gate Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pricingData.farmGatePrice}
                  onChange={(e) => setPricingData({...pricingData, farmGatePrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wholesale Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pricingData.wholesalePrice}
                  onChange={(e) => setPricingData({...pricingData, wholesalePrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retail Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pricingData.retailPrice}
                  onChange={(e) => setPricingData({...pricingData, retailPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Set Prices
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batches List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Batches</h3>
        {batches.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No batches available for pricing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-medium text-gray-900">{batch.batchId}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {batch.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600">{batch.produceType} • {batch.quantity} kg • Grade {batch.qualityGrade}</p>
                      <p className="text-sm text-gray-500">Farmer: {batch.farmer} • {batch.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedBatch(batch)}
                      className="btn-outline inline-flex items-center"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Set Prices
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing Guidelines */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Guidelines</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Fair Pricing</h4>
              <p className="text-sm text-gray-600">
                Ensure fair pricing that benefits all stakeholders in the supply chain.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Market Rates</h4>
              <p className="text-sm text-gray-600">
                Consider current market rates and quality grades when setting prices.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Transparency</h4>
              <p className="text-sm text-gray-600">
                All pricing information is recorded on the blockchain for transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
