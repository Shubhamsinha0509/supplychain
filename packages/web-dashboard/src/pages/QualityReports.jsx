import React, { useState, useEffect } from 'react'
import { FileText, Download, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const QualityReports = () => {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState(null)

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
            createdAt: '2024-01-15T10:00:00Z',
            qualityTests: [
              { test: 'Pesticide Residue', result: 'Pass', value: '0.02 ppm', limit: '0.05 ppm' },
              { test: 'Heavy Metals', result: 'Pass', value: '0.1 ppm', limit: '0.5 ppm' },
              { test: 'Microbial Count', result: 'Pass', value: '100 CFU/g', limit: '1000 CFU/g' },
              { test: 'Nutritional Value', result: 'Pass', value: '95%', limit: '90%' }
            ]
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
            createdAt: '2024-01-10T08:00:00Z',
            qualityTests: [
              { test: 'Moisture Content', result: 'Pass', value: '12%', limit: '14%' },
              { test: 'Protein Content', result: 'Pass', value: '11.5%', limit: '10%' },
              { test: 'Foreign Matter', result: 'Warning', value: '2.1%', limit: '2%' },
              { test: 'Germination', result: 'Pass', value: '88%', limit: '85%' }
            ]
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
            createdAt: '2024-01-05T12:00:00Z',
            qualityTests: [
              { test: 'Brix Level', result: 'Pass', value: '14.2°', limit: '12°' },
              { test: 'Firmness', result: 'Pass', value: '8.5 lbs', limit: '7 lbs' },
              { test: 'Color Grade', result: 'Pass', value: '95%', limit: '90%' },
              { test: 'Defect Rate', result: 'Pass', value: '2%', limit: '5%' }
            ]
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [])

  const getTestResultIcon = (result) => {
    switch (result) {
      case 'Pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'Fail':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTestResultColor = (result) => {
    switch (result) {
      case 'Pass':
        return 'text-green-600 bg-green-50'
      case 'Warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'Fail':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const generateReport = (batch) => {
    const reportData = {
      batchId: batch.batchId,
      produceType: batch.produceType,
      quantity: batch.quantity,
      qualityGrade: batch.qualityGrade,
      harvestDate: batch.harvestDate,
      location: batch.location,
      qualityTests: batch.qualityTests || [],
      generatedAt: new Date().toISOString()
    }
    
    // In a real application, this would generate a PDF
    console.log('Generating quality report:', reportData)
    alert('Quality report generated! (Check console for details)')
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quality Reports</h1>
        <p className="text-gray-600 mt-2">Monitor quality and compliance reports for all batches</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Batches</p>
              <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grade A Batches</p>
              <p className="text-2xl font-bold text-gray-900">
                {batches.filter(b => b.qualityGrade === 'A').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900">98.5%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <AlertTriangle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quality Reports Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quality Test Reports</h2>
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produce Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Results
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{batch.batchId}</div>
                    <div className="text-sm text-gray-500">{batch.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{batch.produceType}</div>
                    <div className="text-sm text-gray-500">{batch.quantity} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      batch.qualityGrade === 'A' ? 'bg-green-100 text-green-800' :
                      batch.qualityGrade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Grade {batch.qualityGrade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {batch.qualityTests ? (
                        <>
                          {getTestResultIcon(
                            batch.qualityTests.every(test => test.result === 'Pass') ? 'Pass' :
                            batch.qualityTests.some(test => test.result === 'Fail') ? 'Fail' : 'Warning'
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            batch.qualityTests.every(test => test.result === 'Pass') ? 'text-green-600 bg-green-50' :
                            batch.qualityTests.some(test => test.result === 'Fail') ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'
                          }`}>
                            {batch.qualityTests.every(test => test.result === 'Pass') ? 'All Pass' :
                             batch.qualityTests.some(test => test.result === 'Fail') ? 'Failed' : 'Warning'}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">No tests</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBatch(batch)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => generateReport(batch)}
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Quality Test Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Quality Test Details - {selectedBatch.batchId}
                </h3>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Produce Type:</span>
                    <span className="ml-2 text-gray-900">{selectedBatch.produceType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Quality Grade:</span>
                    <span className="ml-2 text-gray-900">Grade {selectedBatch.qualityGrade}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Quantity:</span>
                    <span className="ml-2 text-gray-900">{selectedBatch.quantity} kg</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Harvest Date:</span>
                    <span className="ml-2 text-gray-900">{selectedBatch.harvestDate}</span>
                  </div>
                </div>

                {selectedBatch.qualityTests && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Test Results</h4>
                    <div className="space-y-3">
                      {selectedBatch.qualityTests.map((test, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getTestResultIcon(test.result)}
                            <div>
                              <div className="font-medium text-gray-900">{test.test}</div>
                              <div className="text-sm text-gray-600">
                                Value: {test.value} | Limit: {test.limit}
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTestResultColor(test.result)}`}>
                            {test.result}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedBatch(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => generateReport(selectedBatch)}
                    className="btn-primary flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QualityReports
