# xBrowserSync API - Next.js Implementation

这是一个基于 Next.js App Router 的 xBrowserSync API 完整实现，提供书签同步服务的所有功能。

## 功能特性

### 核心功能
- ✅ **书签同步** - 完整的 CRUD 操作
- ✅ **版本管理** - 支持 v1 和 v2 API
- ✅ **速率限制** - 每日新建同步限制
- ✅ **错误处理** - 统一的错误管理
- ✅ **CORS 支持** - 跨域资源共享
- ✅ **安全头** - 基本安全保护
- ✅ **请求日志** - 请求追踪

### API 端点

#### 服务信息
- `GET /api/info` - 获取服务状态和配置

#### 书签管理
- `POST /api/bookmarks` - 创建新书签同步
- `GET /api/bookmarks/[id]` - 获取书签数据
- `PUT /api/bookmarks/[id]` - 更新书签数据
- `GET /api/bookmarks/[id]/lastUpdated` - 获取最后更新时间
- `GET /api/bookmarks/[id]/version` - 获取版本信息

#### 文档和测试
- `GET /api/docs` - API 文档页面
- `GET /api/test` - 测试工具页面

## 项目结构

```
apps/next/app/api/
├── bookmarks/              # 书签相关 API
│   ├── types.ts           # 类型定义
│   ├── lib/
│   │   ├── db.ts          # 数据库操作
│   │   └── utils.ts       # 工具函数
│   ├── route.ts           # POST /api/bookmarks
│   └── [id]/
│       ├── route.ts       # GET, PUT /api/bookmarks/[id]
│       ├── lastUpdated/
│       │   └── route.ts   # GET /api/bookmarks/[id]/lastUpdated
│       └── version/
│           └── route.ts   # GET /api/bookmarks/[id]/version
├── config/                # 配置管理
│   └── index.ts           # 配置文件
├── info/                  # 服务信息
│   ├── types.ts           # 类型定义
│   └── route.ts           # GET /api/info
├── lib/                   # 共享库
│   └── errors.ts          # 错误处理
├── rate-limit/            # 速率限制
│   └── middleware.ts      # 中间件
├── sync-logs/             # 同步日志
│   ├── types.ts           # 类型定义
│   ├── lib/
│   │   ├── db.ts          # 数据库操作
│   │   └── service.ts     # 服务层
├── test/                  # 测试工具
│   ├── e2e.test.ts        # 端到端测试
│   └── page.tsx           # 测试页面
├── docs/                  # 文档页面
│   └── page.tsx           # API 文档
├── middleware.ts          # 全局中间件
└── README.md              # 本文档
```

## 配置选项

### 环境变量

```bash
# 每日新建同步限制 (0 = 无限制)
DAILY_NEW_SYNCS_LIMIT=3

# 最大同步大小 (字节)
MAX_SYNC_SIZE=5242880

# 服务位置
LOCATION=US

# 状态消息
STATUS_MESSAGE="xBrowserSync Service - Online"

# API 版本
VERSION=1.1.8

# 服务器端口
PORT=3000
```

### 配置对象

```typescript
interface Config {
  allowedOrigins: string[]
  dailyNewSyncsLimit: number
  maxSyncSize: number
  location?: string
  server: {
    relativePath: string
    port: number
  }
  status: {
    message: string
    enabled: boolean
  }
  version: string
  api: {
    version: string
    title: string
    description: string
  }
}
```

## 使用示例

### 创建新的书签同步

```bash
# v2 API - 仅版本
curl -X POST http://localhost:3000/api/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"version": "1.0.0"}'

# v1 API - 带书签数据
curl -X POST http://localhost:3000/api/bookmarks \
  -H "Content-Type: application/json" \
  -d '{
    "bookmarks": "{\"bookmarks\": [{\"title\": \"Example\", \"url\": \"https://example.com\"}]}",
    "version": "1.0.0"
  }'
```

### 获取书签

```bash
curl http://localhost:3000/api/bookmarks/[SYNC-ID]
```

### 更新书签

```bash
curl -X PUT http://localhost:3000/api/bookmarks/[SYNC-ID] \
  -H "Content-Type: application/json" \
  -d '{
    "bookmarks": "{\"bookmarks\": [{\"title\": \"Updated\", \"url\": \"https://updated.com\"}]}",
    "version": "1.0.1"
  }'
```

### 获取服务信息

```bash
curl http://localhost:3000/api/info
```

## 响应格式

### 成功响应

```json
{
  "id": "generated-sync-id",
  "version": "1.0.0",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

## 错误代码

- `VALIDATION_ERROR` (400) - 请求验证失败
- `NOT_FOUND` (404) - 资源未找到
- `CONFLICT` (409) - 资源冲突
- `RATE_LIMIT_EXCEEDED` (429) - 速率限制
- `SERVICE_UNAVAILABLE` (503) - 服务不可用
- `NEW_SYNCS_FORBIDDEN` (403) - 新建同步被禁用
- `NEW_SYNCS_LIMIT_EXCEEDED` (429) - 每日同步限制
- `INTERNAL_ERROR` (500) - 内部服务器错误

## 安全特性

- **CORS 配置** - 可配置的跨域访问
- **速率限制** - 防止 API 滥用
- **输入验证** - 严格的数据验证
- **安全头** - XSS、点击劫持保护
- **错误过滤** - 避免敏感信息泄露

## 开发和测试

### 启动开发服务器

```bash
cd apps/next
yarn dev
```

### 运行测试

1. 访问 http://localhost:3000/api/test 查看测试页面
2. 点击 "Run All Tests" 执行完整测试套件
3. 查看实时日志和测试结果

### API 文档

访问 http://localhost:3000/api/docs 查看完整的 API 文档。

## 生产部署建议

1. **数据库** - 替换内存存储为持久化数据库
2. **缓存** - 添加 Redis 缓存提高性能
3. **监控** - 集成日志监控和告警
4. **备份** - 实现定期数据备份
5. **CDN** - 使用 CDN 加速静态资源
6. **负载均衡** - 支持水平扩展

## 许可证

本项目基于 xBrowserSync 项目实现，遵循相应的开源许可证。