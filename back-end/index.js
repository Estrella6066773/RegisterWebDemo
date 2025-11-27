/**
 * Student Bay - 后端服务器主文件
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 导入路由
const userRoutes = require('./routes/users');
const itemRoutes = require('./routes/items');
const uploadRoutes = require('./routes/upload');

// 导入数据库初始化
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件配置

// CORS 配置（同源访问，可以简化）
app.use(cors({
    origin: process.env.FRONTEND_URL || `http://localhost:${PORT}`,
    credentials: true
}));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务配置
const path = require('path');

// 上传的图片文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 前端静态文件（CSS、JS、图片等）
const frontendPath = path.join(__dirname, '../front-end');
app.use(express.static(frontendPath));

// API 路由

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Student Bay API is running',
        timestamp: new Date().toISOString()
    });
});

// 用户相关路由
app.use('/api/users', userRoutes);

// 物品相关路由
app.use('/api/items', itemRoutes);

// 图片上传路由
app.use('/api/upload', uploadRoutes);

// 前端路由处理（SPA支持）

// 对于所有非API请求，返回前端index.html（支持前端路由）
app.get('*', (req, res, next) => {
    // 如果是API请求，跳过
    if (req.path.startsWith('/api')) {
        return next();
    }
    
    // 如果是静态资源请求（已有扩展名），跳过
    if (req.path.includes('.')) {
        return next();
    }
    
    // 返回前端首页
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// 错误处理中间件

// API 404 处理
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// 服务器启动

async function startServer() {
    try {
        // 检查必需的环境变量
        if (!process.env.JWT_SECRET) {
            console.error('❌ 错误: JWT_SECRET 未设置！');
            console.error('请在 back-end/.env 文件中设置 JWT_SECRET');
            console.error('示例: JWT_SECRET=your-secret-key-change-this');
            process.exit(1);
        }

        // 初始化数据库
        await initDatabase();
        console.log('✅ Database initialized');

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`🌐 Frontend available at http://localhost:${PORT}`);
            console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// 启动服务器
startServer();

module.exports = app;

