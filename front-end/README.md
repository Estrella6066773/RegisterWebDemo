# Student Bay - 前端模块

## 📋 模块简介

前端模块使用 HTML、CSS 和 JavaScript 实现，提供用户界面和交互功能。所有页面采用响应式设计，支持桌面端和移动端访问。

## 🎯 核心功能

### FR1: 用户配置文件和验证
- ✅ 三种会员类型选择（普通会员、学生会员、关联会员）
- ✅ 用户注册和登录
- ✅ 邮箱验证流程
- ✅ 个人资料管理
- ✅ 信任指标显示（验证状态、加入日期、成功交易数、平均评分）
- ✅ 资料完整度百分比

### FR2: 物品列表
- ✅ 物品浏览和搜索
- ✅ 物品详情查看
- ✅ 发布物品（支持5个类别：教材、电子产品、家具、服装、体育器材）
- ✅ 物品状态管理（可用、已预订、已售出）
- ✅ 图片上传支持（最多5张）
- ✅ 条件评级（新到差）
- ✅ 查看计数器

### 额外功能
- ✅ **FR3: 搜索和发现** - 关键词搜索、分类筛选、价格范围、条件筛选、排序
- ✅ **FR5: 物品状态管理** - 状态切换、买家选择

## 📁 文件结构

```
front-end/
├── index.html              # 网站首页（主页面）
├── pages/                  # 其他页面目录
│   ├── register.html       # 注册页面
│   ├── login.html          # 登录页面
│   ├── profile.html        # 个人资料页面
│   ├── verification.html   # 邮箱验证页面
│   ├── items.html          # 物品浏览页面
│   ├── item-detail.html   # 物品详情页面
│   ├── post-item.html     # 发布物品页面
│   └── my-items.html      # 我的物品页面
├── css/                    # 样式文件
│   ├── common.css         # 通用样式（按钮、表单、卡片等）
│   ├── layout.css         # 布局样式（头部、页脚、导航等）
│   └── pages/             # 页面专用样式
│       ├── register.css
│       ├── profile.css
│       ├── items.css
│       ├── item-detail.css
│       └── post-item.css
├── js/                     # JavaScript 文件
│   ├── utils/             # 工具函数
│   │   ├── api.js         # API接口调用模块
│   │   ├── auth.js        # 认证工具
│   │   └── validation.js  # 表单验证工具
│   └── pages/             # 页面逻辑
│       ├── index.js
│       ├── register.js
│       ├── login.js
│       ├── profile.js
│       ├── items.js
│       ├── item-detail.js
│       ├── post-item.js
│       └── my-items.js
└── images/                 # 图片资源
```

## 🔧 技术实现

### HTML 页面
- **9个页面**：首页、注册、登录、个人资料、验证、物品浏览、物品详情、发布物品、我的物品
- **响应式设计**：支持桌面端和移动端
- **语义化标签**：使用 HTML5 语义化标签

### CSS 样式
- **模块化设计**：通用样式、布局样式、页面专用样式分离
- **CSS 变量**：使用 CSS 变量便于主题定制
- **响应式布局**：使用 Flexbox 和 Grid 布局
- **7个样式文件**：2个通用样式 + 5个页面专用样式

### JavaScript 功能
- **模块化架构**：工具函数和页面逻辑分离
- **API 集成**：通过 `api.js` 调用后端 API
- **认证管理**：通过 `auth.js` 管理用户登录状态
- **表单验证**：通过 `validation.js` 实现实时验证
- **12个 JS 文件**：3个工具模块 + 8个页面逻辑

## 🚀 使用说明

### 开发环境

1. **直接打开**
   - 直接在浏览器中打开 `index.html` 文件

2. **本地服务器**（推荐）
   ```bash
   # 使用 Python
   cd front-end
   python -m http.server 8080
   
   # 或使用 Node.js http-server
   npx http-server -p 8080
   ```
   然后访问 `http://localhost:8080`

### 与后端集成

前端通过 `js/utils/api.js` 调用后端 API：

- **API 基础路径**：`/api`
- **认证方式**：JWT Token（存储在 localStorage）
- **CORS 配置**：需要后端配置允许前端域名

确保：
1. 后端服务器运行在 `http://localhost:3000`
2. 后端已配置 CORS 允许前端访问
3. API 路径正确配置

## 📝 主要功能模块

### 用户认证模块 (`js/utils/auth.js`)
- 用户登录状态管理
- Token 存储和获取
- 用户权限检查
- 会员类型验证

### API 调用模块 (`js/utils/api.js`)
- 统一的 API 请求方法
- 自动添加认证 Token
- 错误处理
- 用户相关 API（注册、登录、资料管理、验证）
- 物品相关 API（搜索、列表、详情、CRUD、我的物品、状态管理）

### 表单验证模块 (`js/utils/validation.js`)
- 邮箱格式验证
- 大学邮箱验证（.edu 域名）
- 密码强度验证
- 实时表单验证
- 错误提示显示

## 🎨 设计特点

- **现代化 UI**：使用 CSS 变量，易于主题定制
- **响应式布局**：支持桌面端和移动端
- **用户体验**：实时表单验证、友好的错误提示
- **代码组织**：模块化设计，易于维护和扩展

## 📝 注意事项

1. **图片资源**：需要在 `images/` 目录下放置默认头像等图片
2. **API 路径**：后端 API 基础路径为 `/api`，可在 `js/utils/api.js` 中修改 `API_BASE_URL`
3. **认证 Token**：使用 localStorage 存储，后端需要实现 JWT
4. **浏览器兼容性**：支持现代浏览器（Chrome、Firefox、Safari、Edge）
5. **数据格式**：前端使用 `camelCase` 字段名，后端会自动转换为 `snake_case` 存储，返回时自动转换回 `camelCase`
6. **API 响应格式**：所有 API 返回统一格式 `{ success: boolean, data: any, message?: string }`

---

**返回项目主文档**: [../README.md](../README.md)
