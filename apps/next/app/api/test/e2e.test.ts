// 完整的端到端测试套件
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com/api'
    : 'http://localhost:3000/api'

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

class APITester {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    return { status: response.status, data }
  }

  async testServiceInfo(): Promise<TestResult> {
    try {
      const { status, data } = await this.request('/info')

      if (status === 200 && data.version && data.maxSyncSize) {
        return {
          success: true,
          message: 'Service info endpoint working',
          data,
        }
      }

      return {
        success: false,
        message: 'Service info endpoint failed',
        error: `Status: ${status}, Data: ${JSON.stringify(data)}`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Service info endpoint error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async testCreateSyncV2(): Promise<TestResult> {
    try {
      const { status, data } = await this.request('/bookmarks', {
        method: 'POST',
        body: JSON.stringify({
          version: '1.0.0',
        }),
      })

      if (status === 201 && data.id && data.version) {
        return {
          success: true,
          message: 'Create sync v2 working',
          data,
        }
      }

      return {
        success: false,
        message: 'Create sync v2 failed',
        error: `Status: ${status}, Data: ${JSON.stringify(data)}`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Create sync v2 error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async testCreateSyncWithBookmarks(): Promise<TestResult> {
    try {
      const bookmarksData = JSON.stringify({
        bookmarks: [
          {
            title: 'Test Bookmark',
            url: 'https://example.com',
            favicon: 'https://example.com/favicon.ico',
          },
        ],
      })

      const { status, data } = await this.request('/bookmarks', {
        method: 'POST',
        body: JSON.stringify({
          bookmarks: bookmarksData,
          version: '1.0.0',
        }),
      })

      if (status === 201 && data.id && data.version) {
        return {
          success: true,
          message: 'Create sync with bookmarks working',
          data,
        }
      }

      return {
        success: false,
        message: 'Create sync with bookmarks failed',
        error: `Status: ${status}, Data: ${JSON.stringify(data)}`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Create sync with bookmarks error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async testGetBookmarks(syncId: string): Promise<TestResult> {
    try {
      const { status, data } = await this.request(`/bookmarks/${syncId}`)

      if (status === 200 && (data.bookmarks !== undefined || data.version)) {
        return {
          success: true,
          message: 'Get bookmarks working',
          data,
        }
      }

      return {
        success: false,
        message: 'Get bookmarks failed',
        error: `Status: ${status}, Data: ${JSON.stringify(data)}`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Get bookmarks error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async testUpdateBookmarks(syncId: string): Promise<TestResult> {
    try {
      const updatedBookmarks = JSON.stringify({
        bookmarks: [
          {
            title: 'Updated Test Bookmark',
            url: 'https://updated.com',
            favicon: 'https://updated.com/favicon.ico',
          },
        ],
      })

      const { status, data } = await this.request(`/bookmarks/${syncId}`, {
        method: 'PUT',
        body: JSON.stringify({
          bookmarks: updatedBookmarks,
          version: '1.0.1',
        }),
      })

      if (status === 200 && data.version) {
        return {
          success: true,
          message: 'Update bookmarks working',
          data,
        }
      }

      return {
        success: false,
        message: 'Update bookmarks failed',
        error: `Status: ${status}, Data: ${JSON.stringify(data)}`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Update bookmarks error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async testGetLastUpdated(syncId: string): Promise<TestResult> {
    try {
      const { status, data } = await this.request(
        `/bookmarks/${syncId}/lastUpdated`,
      )

      if (status === 200 && data.lastUpdated) {
        return {
          success: true,
          message: 'Get last updated working',
          data,
        }
      }

      return {
        success: false,
        message: 'Get last updated failed',
        error: `Status: ${status}, Data: ${JSON.stringify(data)}`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Get last updated error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async testGetVersion(syncId: string): Promise<TestResult> {
    try {
      const { status, data } = await this.request(
        `/bookmarks/${syncId}/version`,
      )

      if (status === 200 && data.version) {
        return {
          success: true,
          message: 'Get version working',
          data,
        }
      }

      return {
        success: false,
        message: 'Get version failed',
        error: `Status: ${status}, Data: ${JSON.stringify(data)}`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Get version error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async testErrorHandling(): Promise<TestResult> {
    try {
      // Test 404 error
      const { status: status404, data: data404 } = await this.request(
        '/bookmarks/nonexistent-id',
      )

      if (status404 !== 404) {
        return {
          success: false,
          message: '404 error handling failed',
          error: `Expected 404, got ${status404}`,
        }
      }

      // Test validation error
      const { status: status400, data: data400 } = await this.request(
        '/bookmarks',
        {
          method: 'POST',
          body: JSON.stringify({}), // Missing required fields
        },
      )

      if (status400 !== 400 && status400 !== 422) {
        return {
          success: false,
          message: 'Validation error handling failed',
          error: `Expected 400/422, got ${status400}`,
        }
      }

      return {
        success: true,
        message: 'Error handling working correctly',
        data: { notFoundTest: data404, validationTest: data400 },
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error handling test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async runFullTestSuite(): Promise<void> {
    console.log('🚀 Starting xBrowserSync API E2E Tests...\n')

    const results: TestResult[] = []

    // Test 1: Service Info
    console.log('📋 Testing service info...')
    const infoResult = await this.testServiceInfo()
    results.push(infoResult)
    console.log(`${infoResult.success ? '✅' : '❌'} ${infoResult.message}`)

    // Test 2: Create Sync V2
    console.log('\n📝 Creating new sync (v2)...')
    const createV2Result = await this.testCreateSyncV2()
    results.push(createV2Result)
    console.log(
      `${createV2Result.success ? '✅' : '❌'} ${createV2Result.message}`,
    )

    if (!createV2Result.success || !createV2Result.data?.id) {
      console.log('\n❌ Cannot continue tests without valid sync ID')
      return
    }

    const syncId = createV2Result.data.id

    // Test 3: Get Bookmarks
    console.log('\n📖 Retrieving bookmarks...')
    const getResult = await this.testGetBookmarks(syncId)
    results.push(getResult)
    console.log(`${getResult.success ? '✅' : '❌'} ${getResult.message}`)

    // Test 4: Update Bookmarks
    console.log('\n✏️ Updating bookmarks...')
    const updateResult = await this.testUpdateBookmarks(syncId)
    results.push(updateResult)
    console.log(`${updateResult.success ? '✅' : '❌'} ${updateResult.message}`)

    // Test 5: Get Last Updated
    console.log('\n🕐 Getting last updated time...')
    const lastUpdatedResult = await this.testGetLastUpdated(syncId)
    results.push(lastUpdatedResult)
    console.log(
      `${lastUpdatedResult.success ? '✅' : '❌'} ${lastUpdatedResult.message}`,
    )

    // Test 6: Get Version
    console.log('\n🏷️ Getting version...')
    const versionResult = await this.testGetVersion(syncId)
    results.push(versionResult)
    console.log(
      `${versionResult.success ? '✅' : '❌'} ${versionResult.message}`,
    )

    // Test 7: Error Handling
    console.log('\n🛡️ Testing error handling...')
    const errorResult = await this.testErrorHandling()
    results.push(errorResult)
    console.log(`${errorResult.success ? '✅' : '❌'} ${errorResult.message}`)

    // Test 8: Create Sync with Bookmarks
    console.log('\n📚 Creating sync with bookmarks data...')
    const createWithDataResult = await this.testCreateSyncWithBookmarks()
    results.push(createWithDataResult)
    console.log(
      `${createWithDataResult.success ? '✅' : '❌'} ${createWithDataResult.message}`,
    )

    // Summary
    const passed = results.filter((r) => r.success).length
    const total = results.length

    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`)

    if (passed === total) {
      console.log(
        '🎉 All tests passed! The xBrowserSync API is working correctly.',
      )
    } else {
      console.log('❌ Some tests failed. Please check the implementation.')
      results.forEach((result, index) => {
        if (!result.success) {
          console.log(`  Test ${index + 1} failed: ${result.message}`)
          if (result.error) {
            console.log(`    Error: ${result.error}`)
          }
        }
      })
    }
  }
}

// Export for use in other modules
export { APITester }

// Export for use in Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APITester }
}

// Auto-run if in browser and not in production
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const tester = new APITester(BASE_URL)
      // Uncomment to run tests automatically when page loads
      // tester.runFullTestSuite()
    })
  } else {
    const tester = new APITester(BASE_URL)
    // Uncomment to run tests
    // tester.runFullTestSuite()
  }
}

