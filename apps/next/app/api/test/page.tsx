'use client'

import { useState, useEffect } from 'react'
import { APITester } from './e2e.test'

export default function TestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ])
  }

  const runTests = async () => {
    setIsRunning(true)
    setLogs([])
    setResults([])

    const tester = new APITester('http://localhost:3000/api')

    // Override the console.log to capture output
    const originalLog = console.log
    console.log = (...args: any[]) => {
      originalLog(...args)
      addLog(args.join(' '))
    }

    try {
      await tester.runFullTestSuite()
    } catch (error) {
      addLog(
        `Test suite error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      console.log = originalLog
      setIsRunning(false)
    }
  }

  useEffect(() => {
    // Auto-scroll to bottom of logs
    const logContainer = document.getElementById('log-container')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  }, [logs])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              xBrowserSync API Test Suite
            </h1>
            <p className="mt-2 text-gray-600">
              Comprehensive end-to-end testing for the xBrowserSync API
            </p>
          </div>

          <div className="px-6 py-4">
            <div className="mb-6">
              <button
                onClick={runTests}
                disabled={isRunning}
                className={`px-6 py-2 rounded font-medium text-white transition-colors ${
                  isRunning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </button>

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Make sure the development server is running on
                  http://localhost:3000
                </p>
                <p>Tests will verify all API endpoints including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Service information endpoint</li>
                  <li>Bookmark creation (v1 and v2 APIs)</li>
                  <li>Bookmark retrieval</li>
                  <li>Bookmark updates</li>
                  <li>Metadata endpoints (lastUpdated, version)</li>
                  <li>Error handling</li>
                  <li>Rate limiting</li>
                </ul>
              </div>
            </div>

            {logs.length > 0 && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Test Logs
                  </h2>
                  <div
                    id="log-container"
                    className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto"
                  >
                    {logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Quick API Test
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-700">
                        Test Service Info
                      </h3>
                      <code className="block bg-gray-100 p-2 rounded text-xs">
                        GET /api/info
                      </code>
                      <button
                        onClick={() =>
                          fetch('/api/info')
                            .then((r) => r.json())
                            .then((data) =>
                              alert(JSON.stringify(data, null, 2)),
                            )
                        }
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Test
                      </button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-700">
                        Create Empty Sync
                      </h3>
                      <code className="block bg-gray-100 p-2 rounded text-xs">
                        POST /api/bookmarks {`{"version": "1.0.0"}`}
                      </code>
                      <button
                        onClick={() => {
                          fetch('/api/bookmarks', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ version: '1.0.0' }),
                          })
                            .then((r) => r.json())
                            .then((data) =>
                              alert(JSON.stringify(data, null, 2)),
                            )
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

