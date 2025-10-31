// 简单的测试脚本，用于验证 API 功能
// 可以在浏览器控制台或使用 Node.js 运行

const BASE_URL = 'http://localhost:3000/api/bookmarks'

async function testBookmarksAPI() {
  console.log('开始测试书签同步 API...')

  try {
    // 测试 1: 创建新的书签同步 (v2 - 仅版本)
    console.log('\n1. 创建新的书签同步 (v2)')
    const createResponse = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '1.0.0',
      }),
    })

    if (!createResponse.ok) {
      throw new Error(`创建失败: ${createResponse.statusText}`)
    }

    const createData = await createResponse.json()
    console.log('创建成功:', createData)
    const syncId = createData.id

    // 测试 2: 获取书签
    console.log('\n2. 获取书签')
    const getResponse = await fetch(`${BASE_URL}/${syncId}`)
    const getData = await getResponse.json()
    console.log('获取成功:', getData)

    // 测试 3: 更新书签
    console.log('\n3. 更新书签')
    const bookmarkData = JSON.stringify({
      bookmarks: [
        {
          title: 'Example Website',
          url: 'https://example.com',
          favicon: 'https://example.com/favicon.ico',
        },
      ],
    })

    const updateResponse = await fetch(`${BASE_URL}/${syncId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookmarks: bookmarkData,
        version: '1.0.1',
      }),
    })

    const updateData = await updateResponse.json()
    console.log('更新成功:', updateData)

    // 测试 4: 获取最后更新时间
    console.log('\n4. 获取最后更新时间')
    const lastUpdatedResponse = await fetch(`${BASE_URL}/${syncId}/lastUpdated`)
    const lastUpdatedData = await lastUpdatedResponse.json()
    console.log('最后更新时间:', lastUpdatedData)

    // 测试 5: 获取版本
    console.log('\n5. 获取版本')
    const versionResponse = await fetch(`${BASE_URL}/${syncId}/version`)
    const versionData = await versionResponse.json()
    console.log('版本信息:', versionData)

    // 测试 6: 获取更新后的书签
    console.log('\n6. 获取更新后的书签')
    const getUpdatedResponse = await fetch(`${BASE_URL}/${syncId}`)
    const getUpdatedData = await getUpdatedResponse.json()
    console.log('更新后的书签:', getUpdatedData)

    console.log('\n✅ 所有测试通过!')
  } catch (error) {
    console.error('\n❌ 测试失败:', error)
  }
}

// 如果在 Node.js 环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testBookmarksAPI }
}

// 如果在浏览器中运行，可以直接调用
// testBookmarksAPI()

