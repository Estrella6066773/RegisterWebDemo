# Student Bay - 后端模块

## 📋 模块简介

后端模块使用 Node.js + Express.js + SQLite 实现，提供 RESTful API 接口和前端静态文件服务。前后端已整合到同一服务器，统一从 8080 端口访问。

## 🎯 核心功能

### 用户管理
- ✅ 用户注册（支持学生会员和关联会员）
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
.
├── index.js              # Express 服务器主文件
├── package.json          # 项目配置和依赖
├── package-lock.json     # 依赖锁定文件
├── .env                  # 环境变量（需要创建）
├── .env.example          # 环境变量示例
├── routes/               # API 路由
│   ├── users.js          # 用户相关路由
│   ├── items.js          # 物品相关路由
│   └── upload.js         # 图片上传路由
├── middleware/           # 中间件
│   ├── auth.js           # JWT 认证中间件
│   └── validation.js     # 数据验证中间件
├── utils/                # 工具模块
│   └── fieldConverter.js # 字段名称转换工具（snake_case ↔ camelCase）
├── db/                   # 数据库
│   ├── database.js       # 数据库连接和初始化
│   └── SCHEMA.md         # 数据库架构文档
└── public/               # 静态前端资源
    ├── index.html        # 前端入口
    ├── css/              # 样式
    ├── js/               # 前端脚本
    └── pages/            # 业务页面
```

## 🚀 快速开始

### 前置要求：Node.js 和 npm

**确保已安装 Node.js 和 npm**

npm 通常随 Node.js 一起安装。检查是否已安装：

```bash
node --version
npm --version
```

如果显示版本号，说明已安装。

**如果未安装：**

1. 访问 https://nodejs.org/
2. 下载并安装 LTS（长期支持）版本
3. 安装时确保勾选 "Add to PATH" 选项
4. 安装完成后，重新打开终端验证

**验证安装：**
```bash
node --version  # 应显示版本号，如 v24.11.1
npm --version  # 应显示版本号，如 10.2.4
```

### 步骤 1：安装依赖 ⚠️ 必须执行

**重要：在启动服务器之前，必须先安装项目依赖！**

```bash
npm install
```

**重要：请在项目根目录（即 `package.json` 所在目录）执行 `npm install`！**


这会安装所有必需的依赖包，包括：
- `express` - Web 框架
- `dotenv` - 环境变量管理
- `bcryptjs` - 密码加密
- `jsonwebtoken` - JWT 认证
- `sqlite3` - 数据库
- `multer` - 文件上传
- `uuid` - UUID 生成
- 以及其他依赖

**验证安装：** 检查项目根目录下是否有 `node_modules` 文件夹。

### 步骤 2：配置环境变量

在项目根目录下创建 `.env` 文件：

```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
DB_PATH=./db/student_bay.db
```

**重要：** `JWT_SECRET` 必须设置，否则服务器无法启动！

你可以复制 `.env.example` 文件（如果存在）：
```bash
cp .env.example .env
```

然后编辑 `.env` 文件，修改 `JWT_SECRET` 为你的密钥。

### 步骤 3：启动服务器

**在终端中执行以下命令：**

```bash
# 方式1：使用 npm 启动（推荐）
npm start

# 方式2：使用 Node.js 直接启动
node index.js

# 方式3：开发模式（自动重启，需要安装 nodemon）
npm run dev
```

**启动成功后会看到：**
```
✅ Database initialized
🚀 Server is running on http://localhost:8080
🌐 Frontend available at http://localhost:8080
📡 API endpoints available at http://localhost:8080/api
🌍 Environment: development
```

### 步骤 4：在浏览器中访问应用

**确保 Node.js 服务器正在运行**，然后在浏览器地址栏输入：

- **前端首页**: `http://localhost:8080` - 访问完整的前端应用
- **登录页面**: `http://localhost:8080/pages/login.html` - 用户登录
- **注册页面**: `http://localhost:8080/pages/register.html` - 用户注册
- **API接口**: `http://localhost:8080/api/*` - 后端API端点
- **健康检查**: `http://localhost:8080/api/health` - 验证服务器运行状态

### 步骤 5：验证服务器运行

打开浏览器，访问 `http://localhost:8080/api/health`，应该看到：

```json
{
  "status": "ok",
  "message": "Student Bay API is running",
  "timestamp": "2025-..."
}
```

## 📝 快速检查清单

启动前确保：

- [ ] Node.js 和 npm 已安装（`node --version` 和 `npm --version` 有输出）
- [ ] 在项目根目录执行了 `npm install`
- [ ] 根目录下存在 `node_modules` 文件夹
- [ ] 创建了 `.env` 文件并配置了 `JWT_SECRET`
- [ ] IDE（若使用）设置的工作目录指向项目根目录
- [ ] 端口 8080 未被占用

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

### 图片上传 API

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/upload/image` | 上传图片（头像或物品图片） | 是 |

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

详细数据库架构说明请参考：[SCHEMA.md](./db/SCHEMA.md)

### 数据库初始化

数据库会在服务器启动时自动初始化，如果表不存在会自动创建。

数据库文件位置：`./db/student_bay.db`

## 🔧 技术实现

### 核心模块

#### 1. Express 服务器 (`index.js`)
- Express 应用配置
- CORS 中间件配置
- 路由注册
- 错误处理
- 数据库初始化
- 静态文件服务（前端文件）
- SPA 路由支持

#### 2. 认证中间件 (`middleware/auth.js`)
- JWT Token 验证
- 可选认证（optionalAuth）
- 会员类型权限检查

#### 3. 验证中间件 (`middleware/validation.js`)
- 用户注册数据验证
- 用户登录数据验证
- 用户资料更新验证
- 物品数据验证
- 密码复杂度验证（至少8位，包含字母和数字）
- 邮箱格式验证
- 大学邮箱验证（.edu 域名）

#### 4. 用户路由 (`routes/users.js`)
- 用户注册（密码加密、邮箱验证）
- 用户登录（JWT 生成）
- 用户资料管理
- 邮箱验证流程

#### 5. 物品路由 (`routes/items.js`)
- 物品搜索（多条件筛选、排序、分页）
- 物品 CRUD 操作
- 获取我的物品列表
- 物品状态管理
- 浏览量统计
- 类别特定字段支持

#### 6. 图片上传路由 (`routes/upload.js`)
- 头像上传
- 物品图片上传（支持多张）
- 文件大小和类型验证
- Multer 配置

#### 7. 字段转换工具 (`utils/fieldConverter.js`)
- 数据库字段名称转换（snake_case ↔ camelCase）
- 自动处理前端和后端之间的字段格式差异
- 支持物品数据的双向转换

#### 8. 数据库模块 (`db/database.js`)
- SQLite 连接管理
- 数据库表初始化
- 外键约束启用

## 🔐 安全特性

- **密码加密**：使用 bcryptjs 进行密码哈希
- **JWT 认证**：使用 jsonwebtoken 进行身份认证
- **输入验证**：API 端点包含数据验证
- **SQL 注入防护**：使用参数化查询
- **CORS 配置**：限制允许的前端域名
- **密码复杂度**：至少8位，必须包含字母和数字
- **邮箱验证**：学生会员和关联会员需要大学邮箱（.edu 域名）

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
| PORT | 服务器端口 | 8080 |
| NODE_ENV | 运行环境 | development |
| FRONTEND_URL | 前端 URL（用于 CORS） | http://localhost:8080 |
| JWT_SECRET | JWT 密钥 | - |
| JWT_EXPIRES_IN | Token 过期时间 | 7d |
| DB_PATH | 数据库文件路径 | ./db/student_bay.db |

### 代码组织

- **路由分离**：用户、物品和上传路由分别在不同文件
- **中间件复用**：认证和验证中间件可在多个路由中使用
- **数据库封装**：数据库操作封装在 database.js
- **错误处理**：统一的错误处理机制

## 🧪 测试账户

### 手动注册测试账号

**重要：** 测试账号需要用户手动注册，这是测试流程的重要环节。

请通过注册页面（`http://localhost:8080/pages/register.html`）自行注册测试账号。

**注册要求：**
- 使用大学邮箱（.edu 域名），例如：`test@university.edu`
- 密码至少8位，必须包含字母和数字
- 选择会员类型：学生会员（STUDENT）或关联会员（ASSOCIATE）

**测试建议：**
- 可以注册多个测试账号，分别测试不同会员类型的功能
- 注册后需要完成邮箱验证（开发环境中验证令牌会在控制台输出）

**登录页面预设账号示例：**

登录页面提供了5个预设账号示例，仅用于演示"一键填写"功能：
1. 学生会员 1 - `student@university.edu`
2. 关联会员 1 - `associate@university.edu`
3. 学生会员 2 - `student2@university.edu`
4. 关联会员 2 - `associate2@university.edu`
5. 通用测试账号 - `test@university.edu`

这些账号在数据库中并不存在，仅用于演示登录表单的一键填写功能。

### 使用 curl 测试 API

```bash
# 健康检查
curl http://localhost:8080/api/health

# 用户注册
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@university.edu","password":"Test1234","memberType":"STUDENT","name":"测试用户"}'

# 用户登录
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@university.edu","password":"Test1234"}'

# 获取物品列表（需要先登录获取 token）
curl -X GET http://localhost:8080/api/items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

