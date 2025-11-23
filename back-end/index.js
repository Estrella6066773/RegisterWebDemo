/**
 * ============================================
 * Student Bay - 后端服务器主文件
 * Express.js API 服务器（基本框架）
 * ============================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 导入路由
const userRoutes = require('./routes/users');
const itemRoutes = require('./routes/items');

// 导入数据库初始化
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 中间件配置
// ============================================

// CORS 配置
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================
// API 路由
// ============================================

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

// ============================================
// 错误处理中间件
// ============================================

// 404 处理
app.use((req, res) => {
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

// ============================================
// 服务器启动
// ============================================

async function startServer() {
    try {
        // 初始化数据库
        await initDatabase();
        console.log('✅ Database initialized');

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
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

