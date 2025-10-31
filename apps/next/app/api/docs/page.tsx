import { Metadata } from 'next'
import { getConfig } from '../config'

export const metadata: Metadata = {
  title: 'xBrowserSync API Documentation',
  description: 'API documentation for xBrowserSync bookmark sync service',
}

export default function DocsPage() {
  const config = getConfig()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            xBrowserSync API
          </h1>
          <p className="text-xl text-gray-600 mb-8">{config.api.description}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            API Overview
          </h2>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Base URL
              </h3>
              <code className="block bg-gray-100 p-3 rounded text-sm">
                {process.env.NODE_ENV === 'production'
                  ? 'https://your-domain.com/api'
                  : 'http://localhost:3000/api'}
              </code>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Service Information
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <strong>Version:</strong> {config.version}
                </li>
                <li>
                  <strong>Max Sync Size:</strong>{' '}
                  {(config.maxSyncSize / 1024 / 1024).toFixed(1)} MB
                </li>
                <li>
                  <strong>Daily New Syncs Limit:</strong>{' '}
                  {config.dailyNewSyncsLimit}
                </li>
                {config.location && (
                  <li>
                    <strong>Location:</strong> {config.location}
                  </li>
                )}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Endpoints
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900">Service Info</h4>
                  <p className="text-gray-600">
                    Get service status and configuration
                  </p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    GET /info
                  </code>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-gray-900">Bookmarks</h4>
                  <p className="text-gray-600">
                    Create, retrieve, and update bookmark syncs
                  </p>
                  <div className="space-y-1 mt-2">
                    <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                      POST /bookmarks - Create new sync
                    </div>
                    <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                      GET /bookmarks/[id] - Get bookmarks
                    </div>
                    <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                      PUT /bookmarks/[id] - Update bookmarks
                    </div>
                    <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                      GET /bookmarks/[id]/lastUpdated - Get last updated time
                    </div>
                    <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                      GET /bookmarks/[id]/version - Get version
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Usage Examples
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Create New Sync
                  </h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                    {`curl -X POST http://localhost:3000/api/bookmarks \\
  -H "Content-Type: application/json" \\
  -d '{"version": "1.0.0"}'`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Get Bookmarks
                  </h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                    {`curl http://localhost:3000/api/bookmarks/[SYNC-ID]`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Update Bookmarks
                  </h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                    {`curl -X PUT http://localhost:3000/api/bookmarks/[SYNC-ID] \\
  -H "Content-Type: application/json" \\
  -d '{
    "bookmarks": "{\\"bookmarks\\": []}",
    "version": "1.0.1"
  }'`}
                  </pre>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Error Handling
              </h3>
              <p className="text-gray-600 mb-3">
                The API returns standard HTTP status codes and JSON error
                responses:
              </p>
              <pre className="bg-gray-100 p-3 rounded text-sm">
                {`{
  "error": "Error message description"
}`}
              </pre>
              <ul className="mt-3 space-y-1 text-gray-600 text-sm">
                <li>
                  <strong>400:</strong> Bad Request - Invalid input data
                </li>
                <li>
                  <strong>404:</strong> Not Found - Sync ID not found
                </li>
                <li>
                  <strong>500:</strong> Internal Server Error
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

