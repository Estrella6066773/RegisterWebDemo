# Student Bay - 学生二手物品交易平台

## 📋 项目简介

Student Bay 是一个专为大学生设计的二手物品交易平台，帮助学生买卖课程教材、电子产品、家具、服装和体育器材等物品。

本项目是 Web Data Applications 课程的评估项目，使用 Node.js + Express.js + SQLite 技术栈开发。

## 🎯 项目目标

为学生提供一个安全、便捷的二手物品交易平台，通过大学邮箱验证建立信任机制，帮助学生在校园内进行二手物品交易。

## 🏗️ 项目结构

```
RegisterDemo/
├── front-end/          # 前端模块
│   ├── index.html      # 主页面
│   ├── pages/          # 其他页面
│   ├── css/            # 样式文件
│   ├── js/             # JavaScript 文件
│   └── images/         # 图片资源
├── back-end/           # 后端模块
│   ├── index.js        # Express 服务器
│   ├── routes/         # API 路由
│   ├── middleware/     # 中间件
│   ├── db/             # 数据库
│   └── package.json    # 项目配置
└── README.md           # 项目说明（本文档）
```

## 🚀 快速开始

### 前置要求

- Node.js (v14 或更高版本)
- npm 或 yarn

### 启动步骤

1. **启动后端服务器**

```bash
cd back-end
npm install
npm start
```

后端服务器将在 `http://localhost:3000` 启动

2. **访问前端**

直接在浏览器中打开 `front-end/index.html`，或使用本地服务器：

```bash
cd front-end
python -m http.server 8080
# 或
npx http-server -p 8080
```

然后访问 `http://localhost:8080`

详细启动说明请参考：
- [后端 README](./back-end/README.md) - 后端详细配置和启动说明
- [前端 README](./front-end/README.md) - 前端使用说明

## 🎯 功能特性

### 核心功能

- **用户管理** - 三种会员类型（普通会员、学生会员、关联会员）
- **邮箱验证** - 大学邮箱（.edu 域名）验证机制
- **信任指标** - 验证状态、交易数、评分等信任指标
- **物品管理** - 物品发布、浏览、搜索、状态管理
- **搜索功能** - 关键词搜索、分类筛选、价格范围、排序

### 已实现的功能需求

- ✅ **FR1: 用户配置文件和验证** - 完整实现
- ✅ **FR2: 物品列表** - 完整实现
- ✅ **FR3: 搜索和发现** - 完整实现
- ✅ **FR5: 物品状态管理** - 完整实现

## 🛠️ 技术栈

### 前端
- **HTML5** - 页面结构
- **CSS3** - 样式设计（响应式布局）
- **JavaScript (ES6+)** - 客户端逻辑

### 后端
- **Node.js** - 运行环境
- **Express.js** - Web 框架
- **SQLite** - 数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

### 数据库选择

项目使用 **SQLite** 数据库，选择理由：

1. **简单易用** - 无需单独的数据库服务器，文件型数据库
2. **适合项目规模** - 学生项目，数据量适中
3. **零配置** - 开箱即用，无需额外安装和配置
4. **跨平台** - 支持 Windows、Linux、Mac
5. **轻量级** - 适合快速开发和部署

数据库架构说明：请参考 [`back-end/db/SCHEMA.md`](./back-end/db/SCHEMA.md)

## 📡 API 概览

### 用户相关 API
- 用户注册、登录、登出
- 用户资料管理
- 邮箱验证

### 物品相关 API
- 物品搜索、列表、详情
- 物品发布、更新、删除
- 浏览量统计

完整 API 文档请参考：[后端 README](./back-end/README.md)

## 📚 模块文档

### 前端模块
详细的前端功能说明、文件结构、页面功能等，请查看：
**[front-end/README.md](./front-end/README.md)**

### 后端模块
详细的后端 API 文档、数据库说明、启动配置等，请查看：
**[back-end/README.md](./back-end/README.md)**

## 🧪 测试

### 测试后端 API

```bash
# 健康检查
curl http://localhost:3000/api/health

# 用户注册示例
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@university.edu","password":"password123","memberType":"STUDENT"}'
```

### 测试前端

1. 启动后端服务器
2. 打开前端页面
3. 测试各项功能（注册、登录、发布物品、搜索等）

## 📝 开发说明

### 后端开发

```bash
cd back-end
npm run dev  # 使用 nodemon 自动重启
```

### 前端开发

前端文件位于 `front-end/` 目录，可以直接在浏览器中打开 HTML 文件，或使用本地服务器。

## 📦 项目交付

### 提交文件结构

项目已按照评估要求组织：

- ✅ `front-end/` - 前端文件夹（包含 index.html、CSS、JavaScript、媒体资源）
- ✅ `back-end/` - 后端文件夹（包含 index.js、数据库架构、配置文件）
- ✅ `README.md` - 项目说明文档（本文档）

### 其他文档

- `back-end/db/SCHEMA.md` - 数据库架构详细说明
- `docs/` - 项目相关文档（可选）

## 👥 项目信息

- **课程**: Web Data Applications (UWE213)
- **项目类型**: Group Project
- **技术栈**: Node.js + Express.js + SQLite
- **完成时间**: 2025年

## 📄 许可证

ISC

---

**详细功能说明请查看各模块的 README：**
- [前端模块文档](./front-end/README.md)
- [后端模块文档](./back-end/README.md)
