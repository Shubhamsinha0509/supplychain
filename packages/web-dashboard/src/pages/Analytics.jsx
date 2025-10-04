import React, { useState, useEffect } from 'react'
import { TrendingUp, Package, MapPin, Clock, BarChart3, PieChart } from 'lucide-react'

const Analytics = () => {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch batches from API
    const fetchBatches = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/batches')
        if (response.ok) {
          const data = await response.json()
          setBatches(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching batches:', error)
        // Use mock data as fallback
        setBatches([
          {
            id: 1,
            batchId: 'BCH001',
            produceType: 'Tomatoes',
            quantity: 1000,
            status: 'REGISTERED',
            harvestDate: '2024-01-15',
            location: 'Farm A, California',
            qualityGrade: 'A',
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 2,
            batchId: 'BCH002',
            produceType: 'Wheat',
            quantity: 2000,
            status: 'IN_TRANSIT',
            harvestDate: '2024-01-10',
            location: 'Transport Hub',
            qualityGrade: 'B',
            createdAt: '2024-01-10T08:00:00Z'
          },
          {
            id: 3,
            batchId: 'BCH003',
            produceType: 'Apples',
            quantity: 500,
            status: 'AT_WHOLESALER',
            harvestDate: '2024-01-05',
            location: 'Wholesale Market',
            qualityGrade: 'A',
            createdAt: '2024-01-05T12:00:00Z'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [])

  // Calculate analytics
  const totalBatches = batches.length
  const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0)
  const averageQuality = batches.length > 0 
    ? (batches.reduce((sum, batch) => sum + (batch.qualityGrade === 'A' ? 100 : batch.qualityGrade === 'B' ? 80 : 60), 0) / batches.length).toFixed(1)
    : 0

  const statusDistribution = batches.reduce((acc, batch) => {
    acc[batch.status] = (acc[batch.status] || 0) + 1
    return acc
  }, {})

  const produceTypeDistribution = batches.reduce((acc, batch) => {
    acc[batch.produceType] = (acc[batch.produceType] || 0) + 1
    return acc
  }, {})

  const qualityDistribution = batches.reduce((acc, batch) => {
    acc[batch.qualityGrade] = (acc[batch.qualityGrade] || 0) + 1
    return acc
  }, {})

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Track performance and quality metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Batches</p>
              <p className="text-2xl font-bold text-gray-900">{totalBatches}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quantity (kg)</p>
              <p className="text-2xl font-bold text-gray-900">{totalQuantity.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Quality</p>
              <p className="text-2xl font-bold text-gray-900">{averageQuality}%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Locations</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(batches.map(b => b.location)).size}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Batch Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const percentage = ((count / totalBatches) * 100).toFixed(1)
              const statusColors = {
                'REGISTERED': 'bg-green-500',
                'IN_TRANSIT': 'bg-yellow-500',
                'AT_WHOLESALER': 'bg-blue-500',
                'AT_RETAILER': 'bg-purple-500',
                'SOLD_TO_CONSUMER': 'bg-gray-500'
              }
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Produce Type Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Produce Type Distribution</h3>
          <div className="space-y-4">
            {Object.entries(produceTypeDistribution).map(([type, count]) => {
              const percentage = ((count / totalBatches) * 100).toFixed(1)
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quality Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quality Grade Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(qualityDistribution).map(([grade, count]) => {
            const percentage = ((count / totalBatches) * 100).toFixed(1)
            const gradeColors = {
              'A': 'text-green-600 bg-green-50',
              'B': 'text-yellow-600 bg-yellow-50',
              'C': 'text-red-600 bg-red-50'
            }
            return (
              <div key={grade} className={`p-4 rounded-lg ${gradeColors[grade]}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Grade {grade}</span>
                  <span className="text-lg font-bold">{count}</span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-current"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">{percentage}%</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Batch Activity</h3>
        <div className="space-y-4">
          {batches.slice(0, 5).map((batch) => (
            <div key={batch.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{batch.batchId}</h4>
                  <p className="text-sm text-gray-600">{batch.produceType} • {batch.quantity} kg</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {batch.status.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(batch.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics
