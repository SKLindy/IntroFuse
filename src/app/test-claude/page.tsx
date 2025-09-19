'use client'

import { useState } from 'react'

export default function TestClaudePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testClaude = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setResult({
        status: response.status,
        data: data
      })
    } catch (error: any) {
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Claude API Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="mb-4 text-gray-600">
            This page tests if the Claude API is working correctly in production.
          </p>

          <button
            onClick={testClaude}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded"
          >
            {loading ? 'Testing...' : 'Test Claude API'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className="bg-gray-100 p-4 rounded text-sm">
              <strong>Status:</strong> {result.status}
              <br />
              <strong>Response:</strong>
              <pre className="mt-2 whitespace-pre-wrap">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}