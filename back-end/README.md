# Student Bay - 后端模块

## 📋 模块简介

后端模块使用 Node.js + Express.js + SQLite 实现，提供 RESTful API 接口和前端静态文件服务。前后端已整合到同一服务器，统一从 8080 端口访问。

## 🎯 核心功能

### 用户管理
- ✅ 用户注册（支持三种会员类型）
- ✅ 用户登录（JWT 认证）
- ✅ 用户资料管理（CRUD）
- ✅ 邮箱验证（模拟实现）
- ✅ 密码加密（bcryptjs）
- ✅ 权限管理（会员类型权限检查）

### 物品管理
- ✅ 物品发布（支持所有类别特定字段）
- ✅ 物品搜索（关键词、分类、价格、条件筛选）
- ✅ 物品列表（分页、排序）
- ✅ 物品详情（包含卖家信息）
- ✅ 物品更新和删除
- ✅ 浏览量统计

### 数据库管理
- ✅ SQLite 数据库
- ✅ 5个数据表（users, items, ratings, watchlists, item_status_history）
- ✅ 完整 CRUD 操作
- ✅ 外键约束
- ✅ 自动初始化

## 📁 项目结构

```
back-end/
├── index.js              # Express 服务器主文件
├── package.json          # 项目配置和依赖
├── .env                  # 环境变量（需要创建）
├── .env.example          # 环境变量示例
├── routes/               # API 路由
│   ├── users.js         # 用户相关路由
│   └── items.js         # 物品相关路由
├── middleware/          # 中间件
│   └── auth.js          # JWT 认证中间件
├── utils/               # 工具模块
│   └── fieldConverter.js # 字段名称转换工具（snake_case ↔ camelCase）
└── db/                  # 数据库
    ├── database.js      # 数据库连接和初始化
    └── SCHEMA.md        # 数据库架构文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd back-end
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
DB_PATH=./db/student_bay.db
```

### 3. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 或生产模式
npm start
```

服务器将在 `http://localhost:8080` 启动

### 4. 访问应用

- **前端页面**: `http://localhost:8080` - 访问完整的前端应用
- **API接口**: `http://localhost:8080/api/*` - 访问后端API
- **健康检查**: `http://localhost:8080/api/health` - 验证服务器运行状态

访问健康检查接口应该看到：

```json
{
  "status": "ok",
  "message": "Student Bay API is running",
  "timestamp": "2025-..."
}
```

## 📡 API 端点

### 健康检查
- `GET /api/health` - 检查服务器状态

### 用户相关 API

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/users/register` | 用户注册 | 否 |
| POST | `/api/users/login` | 用户登录 | 否 |
| POST | `/api/users/logout` | 用户登出 | 是 |
| GET | `/api/users/me` | 获取当前用户信息 | 是 |
| GET | `/api/users/profile` | 获取用户资料 | 可选 |
| PUT | `/api/users/profile` | 更新用户资料 | 是 |
| POST | `/api/users/verification/send` | 发送验证邮件 | 是 |
| POST | `/api/users/verification/verify` | 验证邮箱 | 否 |
| GET | `/api/users/verification/status` | 检查验证状态 | 是 |

### 物品相关 API

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/items/search` | 搜索物品 | 否 |
| GET | `/api/items` | 获取物品列表 | 否 |
| GET | `/api/items/featured` | 获取热门物品 | 否 |
| GET | `/api/items/:id` | 获取物品详情 | 否 |
| GET | `/api/items/my` | 获取当前用户的物品列表 | 是 |
| POST | `/api/items` | 发布物品 | 是 |
| PUT | `/api/items/:id` | 更新物品 | 是 |
| PUT | `/api/items/:id/status` | 更新物品状态 | 是 |
| DELETE | `/api/items/:id` | 删除物品 | 是 |
| POST | `/api/items/:id/view` | 增加物品浏览量 | 否 |

## 🗄️ 数据库

### 数据库选择：SQLite

**选择理由：**
1. **简单易用** - 无需单独的数据库服务器，文件型数据库
2. **适合项目规模** - 学生项目，数据量适中
3. **零配置** - 开箱即用，无需额外安装和配置
4. **跨平台** - 支持 Windows、Linux、Mac
5. **轻量级** - 适合快速开发和部署

### 数据库表结构

- **users** - 用户信息表
- **items** - 物品信息表（支持所有类别特定字段）
- **ratings** - 评分记录表
- **watchlists** - 关注列表表
- **item_status_history** - 物品状态变更记录表

详细数据库架构说明请参考：[db/SCHEMA.md](./db/SCHEMA.md)

### 数据库初始化

数据库会在服务器启动时自动初始化，如果表不存在会自动创建。

数据库文件位置：`back-end/db/student_bay.db`

## 🔧 技术实现

### 核心模块

#### 1. Express 服务器 (`index.js`)
- Express 应用配置
- CORS 中间件配置
- 路由注册
- 错误处理
- 数据库初始化

#### 2. 认证中间件 (`middleware/auth.js`)
- JWT Token 验证
- 可选认证（optionalAuth）
- 会员类型权限检查

#### 3. 用户路由 (`routes/users.js`)
- 用户注册（密码加密、邮箱验证）
- 用户登录（JWT 生成）
- 用户资料管理
- 邮箱验证流程

#### 4. 物品路由 (`routes/items.js`)
- 物品搜索（多条件筛选、排序、分页）
- 物品 CRUD 操作
- 获取我的物品列表
- 物品状态管理
- 浏览量统计
- 类别特定字段支持

#### 5. 字段转换工具 (`utils/fieldConverter.js`)
- 数据库字段名称转换（snake_case ↔ camelCase）
- 自动处理前端和后端之间的字段格式差异
- 支持物品数据的双向转换

#### 6. 数据库模块 (`db/database.js`)
- SQLite 连接管理
- 数据库表初始化
- 外键约束启用

## 🔐 安全特性

- **密码加密**：使用 bcryptjs 进行密码哈希
- **JWT 认证**：使用 jsonwebtoken 进行身份认证
- **输入验证**：API 端点包含数据验证
- **SQL 注入防护**：使用参数化查询
- **CORS 配置**：限制允许的前端域名

## 🔄 数据格式

### 字段名称转换

后端数据库使用 `snake_case`（如 `post_date`, `view_count`），但前端使用 `camelCase`（如 `postDate`, `viewCount`）。

**自动转换机制：**
- **返回数据**：后端自动将 `snake_case` 转换为 `camelCase` 返回给前端
- **接收数据**：后端自动将前端发送的 `camelCase` 转换为 `snake_case` 存储到数据库

转换由 `utils/fieldConverter.js` 工具模块自动处理，无需手动转换。

## 📝 开发说明

### 开发模式

```bash
npm run dev  # 使用 nodemon 自动重启
```

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| FRONTEND_URL | 前端 URL（用于 CORS） | http://localhost:8080 |
| JWT_SECRET | JWT 密钥 | - |
| JWT_EXPIRES_IN | Token 过期时间 | 7d |
| DB_PATH | 数据库文件路径 | ./db/student_bay.db |

### 代码组织

- **路由分离**：用户和物品路由分别在不同文件
- **中间件复用**：认证中间件可在多个路由中使用
- **数据库封装**：数据库操作封装在 database.js
- **错误处理**：统一的错误处理机制

## 🧪 测试账户

### 插入测试用户

为了方便开发和测试，提供了一个测试用户插入脚本：

```bash
# 在 back-end 目录下运行
node db/insert-test-users.js
```

脚本会插入以下测试账户（所有账户密码均为 `123456`）：

1. **学生会员**
   - 邮箱: `student@university.edu`
   - 密码: `123456`
   - 姓名: 张三
   - 会员类型: STUDENT
   - 已验证

2. **关联会员**
   - 邮箱: `associate@university.edu`
   - 密码: `123456`
   - 姓名: 李教授
   - 会员类型: ASSOCIATE
   - 已验证

> **注意**: 如果邮箱已存在，脚本会跳过该用户，不会重复插入。

### 使用 curl 测试 API

```bash
# 健康检查
curl http://localhost:8080/api/health

# 用户注册
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@university.edu","password":"password123","memberType":"STUDENT","name":"测试用户"}'

# 用户登录
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@university.edu","password":"password123"}'

# 获取物品列表（需要先登录获取 token）
curl -X GET http://localhost:8080/api/items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🌐 访问方式

### 开发环境

启动服务器后，访问：
- **前端应用**: `http://localhost:8080` - 完整的前端界面
- **API接口**: `http://localhost:8080/api/*` - 后端API端点

### 架构说明

前后端已整合到同一服务器：
- **静态文件服务**: Express 提供前端 HTML/CSS/JS 文件
- **API服务**: Express 提供 RESTful API 接口
- **统一端口**: 所有请求都通过 8080 端口访问
- **SPA支持**: 非API请求自动返回前端首页，支持前端路由

### 优势

1. **简化部署**: 只需启动一个服务器
2. **同源访问**: 无需配置CORS，减少跨域问题
3. **统一管理**: 前后端代码在同一项目中，便于管理
4. **开发便捷**: 一个命令启动完整应用

## 📚 相关文档

- **数据库架构**: [db/SCHEMA.md](./db/SCHEMA.md) - 详细的数据库表结构说明
- **项目主文档**: [../README.md](../README.md) - 项目整体说明

---

**返回项目主文档**: [../README.md](../README.md)
