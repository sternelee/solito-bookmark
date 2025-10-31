# Bookmarks Sync API

这是一个基于 xBrowserSync API 设计的书签同步服务，使用 Next.js App Router 实现。

## API 端点

### 创建书签同步

#### POST /api/bookmarks

创建新的书签同步。

**请求体 (v1 - 带书签数据):**
```json
{
  "bookmarks": "bookmark data string",
  "version": "1.0.0"
}
```

**请求体 (v2 - 仅版本):**
```json
{
  "version": "1.0.0"
}
```

**响应:**
```json
{
  "id": "generated-id",
  "version": "1.0.0",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### 获取书签

#### GET /api/bookmarks/[id]

根据 ID 获取书签数据。

**响应:**
```json
{
  "bookmarks": "bookmark data string",
  "version": "1.0.0",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### 更新书签

#### PUT /api/bookmarks/[id]

更新现有书签数据。

**请求体:**
```json
{
  "bookmarks": "updated bookmark data string",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "version": "1.0.1"
}
```

**响应:**
```json
{
  "version": "1.0.1",
  "lastUpdated": "2024-01-01T01:00:00.000Z"
}
```

### 获取最后更新时间

#### GET /api/bookmarks/[id]/lastUpdated

获取书签的最后更新时间。

**响应:**
```json
{
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### 获取版本

#### GET /api/bookmarks/[id]/version

获取书签的版本信息。

**响应:**
```json
{
  "version": "1.0.0"
}
```

## 使用示例

### 创建新的书签同步

```bash
curl -X POST http://localhost:3000/api/bookmarks \
  -H "Content-Type: application/json" \
  -d '{
    "bookmarks": "{\"bookmarks\": [{\"title\": \"Example\", \"url\": \"https://example.com\"}]}",
    "version": "1.0.0"
  }'
```

### 获取书签

```bash
curl http://localhost:3000/api/bookmarks/[sync-id]
```

### 更新书签

```bash
curl -X PUT http://localhost:3000/api/bookmarks/[sync-id] \
  -H "Content-Type: application/json" \
  -d '{
    "bookmarks": "{\"bookmarks\": [{\"title\": \"Updated Example\", \"url\": \"https://updated.com\"}]}",
    "version": "1.0.1"
  }'
```

## 技术实现

- **框架**: Next.js 14+ App Router
- **数据存储**: 内存存储 (生产环境建议使用数据库)
- **类型安全**: TypeScript
- **API 兼容性**: 与 xBrowserSync API 兼容

## 注意事项

1. 当前实现使用内存存储，重启服务器数据会丢失
2. 生产环境建议集成真实的数据库 (如 MongoDB, PostgreSQL 等)
3. 可以添加身份验证和授权机制
4. 建议添加速率限制以防止滥用