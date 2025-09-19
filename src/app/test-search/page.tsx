'use client'

import { useState } from 'react'

export default function TestSearchPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSearch = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('Testing search script generation...')

      const response = await fetch('/api/generate-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentSource: "Kissing Bug disease",
          contentType: "search",
          artist: "Brantley Gilbert",
          songTitle: "Bottoms Up",
          selectedStyle: "Conversational"
        })
      })

      console.log('Generate scripts response status:', response.status)

      const data = await response.json()
      console.log('Generate scripts response data:', data)

      setResult({
        status: response.status,
        data: data
      })
    } catch (error: any) {
      console.error('Test error:', error)
      setResult({
        status: 'error',
        data: { error: error.message }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Script Generation Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="mb-4 text-gray-600">
            This page tests the complete search → script generation flow with "Kissing Bug disease".
          </p>

          <button
            onClick={testSearch}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded"
          >
            {loading ? 'Testing Search Scripts...' : 'Test Search Script Generation'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className="bg-gray-100 p-4 rounded text-sm">
              <strong>Status:</strong> {result.status}
              <br />
              <strong>Response:</strong>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}