/**
 * ============================================
 * 图片上传路由
 * /api/upload/*
 * ============================================
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳-随机数-原文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'item-' + uniqueSuffix + ext);
    }
});

// 文件过滤器：只允许图片
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件（jpeg, jpg, png, gif, webp）'));
    }
};

// 配置 multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

/**
 * POST /api/upload/image
 * 上传单张图片
 */
router.post('/image', authenticateToken, upload.single('image'), handleMulterError, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请选择要上传的图片'
            });
        }

        // 返回图片URL（相对于uploads目录）
        const imageUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: '图片上传成功',
            data: {
                url: imageUrl,
                filename: req.file.filename,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || '图片上传失败'
        });
    }
});

/**
 * POST /api/upload/images
 * 上传多张图片（最多5张）
 */
router.post('/images', authenticateToken, upload.array('images', 5), handleMulterError, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请选择要上传的图片'
            });
        }

        // 返回所有图片URL
        const imageUrls = req.files.map(file => ({
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            size: file.size
        }));

        res.json({
            success: true,
            message: `成功上传 ${imageUrls.length} 张图片`,
            data: imageUrls
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || '图片上传失败'
        });
    }
});

module.exports = router;

