# 学生港湾 - 前端文件结构说明

## 📁 目录结构

```
src/main/webapp/
├── index.html              # 网站首页
├── pages/                  # 页面目录
│   ├── register.html       # 注册页面
│   ├── login.html          # 登录页面
│   ├── profile.html        # 个人资料页面
│   └── verification.html   # 邮箱验证页面
├── css/                    # 样式文件目录
│   ├── common.css          # 通用样式（按钮、表单、卡片等）
│   ├── layout.css          # 布局样式（头部、页脚、导航等）
│   └── pages/              # 页面专用样式
│       ├── register.css    # 注册页面样式
│       └── profile.css      # 个人资料页面样式
├── js/                     # JavaScript文件目录
│   ├── utils/              # 工具函数
│   │   ├── api.js          # API接口调用模块（预留后端）
│   │   ├── auth.js         # 认证工具（登录状态、用户信息管理）
│   │   └── validation.js   # 表单验证工具
│   └── pages/              # 页面逻辑
│       ├── register.js     # 注册页面逻辑
│       ├── login.js        # 登录页面逻辑
│       └── profile.js      # 个人资料页面逻辑
├── images/                 # 图片资源目录
└── WEB-INF/                # Web配置文件（后端相关）
```

## 📋 文件功能说明

### HTML 页面

#### `index.html`
- **功能**: 网站首页
- **特点**: 
  - 展示平台介绍和特色功能
  - 介绍三种会员类型
  - 根据登录状态显示不同的导航链接

#### `pages/register.html`
- **功能**: 用户注册页面
- **特点**:
  - 支持三种会员类型选择（普通会员、学生会员、关联会员）
  - 根据会员类型显示邮箱验证提示
  - 表单验证和提交

#### `pages/login.html`
- **功能**: 用户登录页面
- **特点**:
  - 邮箱和密码登录
  - 记住我功能
  - 忘记密码链接（预留）

#### `pages/profile.html`
- **功能**: 个人资料页面
- **特点**:
  - 显示用户基本信息
  - 展示信任指标（验证状态、加入日期、成功交易数、平均评分）
  - 显示资料完整度百分比
  - 显示评分历史

#### `pages/verification.html`
- **功能**: 邮箱验证页面
- **特点**:
  - 显示验证邮件发送状态
  - 处理邮箱验证链接
  - 重新发送验证邮件功能

### CSS 样式文件

#### `css/common.css`
- **功能**: 通用样式定义
- **包含**:
  - CSS变量定义（颜色、间距、圆角等）
  - 按钮样式（primary、secondary、success等）
  - 表单样式（输入框、标签、错误提示等）
  - 卡片样式
  - 徽章样式（验证状态、会员类型）
  - 进度条样式
  - 工具类（间距、文本对齐等）

#### `css/layout.css`
- **功能**: 布局相关样式
- **包含**:
  - 头部导航样式
  - 页脚样式
  - 主内容区样式
  - 页面标题样式
  - 响应式布局

#### `css/pages/register.css`
- **功能**: 注册页面专用样式
- **包含**:
  - 会员类型选择卡片样式
  - 表单步骤指示器样式
  - 邮箱验证提示样式

#### `css/pages/profile.css`
- **功能**: 个人资料页面专用样式
- **包含**:
  - 资料头部样式
  - 信任指标卡片样式
  - 资料完整度样式
  - 详细资料展示样式
  - 评分历史样式

### JavaScript 文件

#### `js/utils/api.js`
- **功能**: API接口调用模块
- **特点**:
  - 统一的API请求方法
  - 自动添加认证token
  - 错误处理
  - **预留后端接口**:
    - `UserAPI.register()` - 用户注册
    - `UserAPI.login()` - 用户登录
    - `UserAPI.getProfile()` - 获取用户资料
    - `UserAPI.updateProfile()` - 更新用户资料
    - `UserAPI.sendVerificationEmail()` - 发送验证邮件
    - `UserAPI.verifyEmail()` - 验证邮箱
    - `UserAPI.checkVerificationStatus()` - 检查验证状态

#### `js/utils/auth.js`
- **功能**: 认证工具函数
- **包含**:
  - `saveAuth()` - 保存认证信息
  - `getAuthToken()` - 获取认证token
  - `getUserData()` - 获取用户数据
  - `clearAuth()` - 清除认证信息
  - `isAuthenticated()` - 检查登录状态
  - `getUserMemberType()` - 获取会员类型
  - `isUserVerified()` - 检查验证状态
  - `getMemberTypeName()` - 获取会员类型中文名称
  - `hasPermission()` - 检查用户权限

#### `js/utils/validation.js`
- **功能**: 表单验证工具
- **包含**:
  - `isValidEmail()` - 验证邮箱格式
  - `isValidUniversityEmail()` - 验证大学邮箱（.edu域名）
  - `validatePassword()` - 验证密码强度
  - `validateName()` - 验证姓名
  - `validateRequired()` - 验证必填字段
  - `showFieldError()` - 显示字段错误
  - `hideFieldError()` - 隐藏字段错误
  - `validateForm()` - 验证整个表单

#### `js/pages/register.js`
- **功能**: 注册页面逻辑
- **特点**:
  - 会员类型选择交互
  - 根据会员类型显示/隐藏邮箱验证提示
  - 表单实时验证
  - 表单提交处理

#### `js/pages/login.js`
- **功能**: 登录页面逻辑
- **特点**:
  - 表单验证
  - 登录提交处理
  - 登录状态检查

#### `js/pages/profile.js`
- **功能**: 个人资料页面逻辑
- **特点**:
  - 加载用户资料
  - 渲染信任指标
  - 计算并显示资料完整度
  - 渲染评分历史
  - 使用模拟数据（开发阶段）

## 🎯 FR1 功能实现

### 1. 验证选项
- ✅ 支持三种会员类型选择
- ✅ 学生会员和关联会员需要大学/机构邮箱验证
- ✅ 邮箱验证提示和流程

### 2. 信任指标显示
- ✅ 验证状态（已验证/未验证）
- ✅ 加入日期
- ✅ 成功交易数
- ✅ 平均评分
- ✅ 资料完整度百分比

### 3. 会员等级
- ✅ **普通会员（GENERAL）**: 仅浏览权限，无需验证
- ✅ **学生会员（STUDENT）**: 完整买卖权限，需大学邮箱验证
- ✅ **关联会员（ASSOCIATE）**: 完整买卖权限，需机构邮箱验证

## 🔌 后端接口预留

所有API调用都在 `js/utils/api.js` 中定义，当前使用模拟数据。后端需要实现以下接口：

### 用户相关接口

1. **POST /api/users/register**
   - 用户注册
   - 请求体: `{ email, password, memberType, name }`
   - 响应: `{ success, message, userId }`

2. **POST /api/users/login**
   - 用户登录
   - 请求体: `{ email, password }`
   - 响应: `{ success, token, userData }`

3. **GET /api/users/profile**
   - 获取当前用户资料
   - 响应: `{ id, email, name, memberType, verified, avatar, bio, university, enrollmentYear, joinDate, successfulTransactions, averageRating, ratingCount }`

4. **PUT /api/users/profile**
   - 更新用户资料
   - 请求体: `{ name, avatar, bio, university, enrollmentYear }`

5. **POST /api/users/verification/send**
   - 发送验证邮件
   - 请求体: `{ email }`

6. **POST /api/users/verification/verify**
   - 验证邮箱
   - 请求体: `{ token }`

7. **GET /api/users/verification/status**
   - 检查验证状态
   - 响应: `{ verified, email }`

## 🚀 使用说明

1. **开发阶段**: 
   - 当前使用模拟数据，可以直接在浏览器中打开HTML文件查看效果
   - API调用已预留，后端实现后取消注释即可

2. **部署**:
   - 将所有文件放在 `src/main/webapp` 目录下
   - 通过Java Web服务器（如Tomcat）部署
   - 确保后端API接口路径为 `/api/*`

3. **测试**:
   - 注册页面: 选择不同会员类型，查看邮箱验证提示
   - 登录页面: 测试表单验证
   - 个人资料页面: 查看信任指标和资料完整度显示

## 📝 注意事项

1. **图片资源**: 需要在 `images/` 目录下放置默认头像等图片
2. **API路径**: 后端API基础路径为 `/api`，可根据实际情况修改 `js/utils/api.js` 中的 `API_BASE_URL`
3. **认证Token**: 使用localStorage存储，后端需要实现JWT或类似的token机制
4. **响应式设计**: 所有页面都支持移动端响应式布局

## 🎨 设计特点

- **现代化UI**: 使用CSS变量，易于主题定制
- **响应式布局**: 支持桌面端和移动端
- **用户体验**: 实时表单验证、友好的错误提示
- **代码组织**: 模块化设计，易于维护和扩展

