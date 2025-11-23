/**
 * ============================================
 * 物品相关路由
 * /api/items/*
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../db/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/items/search
 * 搜索物品
 */
router.get('/search', (req, res) => {
    const { keyword, category, minPrice, maxPrice, condition, sortBy, page = 1, pageSize = 20 } = req.query;
    const db = getDatabase();
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let query = 'SELECT * FROM items WHERE status != "DELETED"';
    const params = [];

    if (keyword) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        const keywordPattern = `%${keyword}%`;
        params.push(keywordPattern, keywordPattern);
    }

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    if (condition) {
        query += ' AND condition = ?';
        params.push(condition);
    }

    if (minPrice) {
        query += ' AND price >= ?';
        params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
        query += ' AND price <= ?';
        params.push(parseFloat(maxPrice));
    }

    // 排序
    const sortOptions = {
        newest: 'post_date DESC',
        price_asc: 'price ASC',
        price_desc: 'price DESC',
        views: 'view_count DESC'
    };
    query += ` ORDER BY ${sortOptions[sortBy] || 'post_date DESC'}`;

    // 分页
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    db.all(query, params, (err, items) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: '搜索失败'
            });
        }

        // 获取总数
        let countQuery = 'SELECT COUNT(*) as total FROM items WHERE status != "DELETED"';
        const countParams = [];
        if (keyword) {
            countQuery += ' AND (title LIKE ? OR description LIKE ?)';
            countParams.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }
        if (condition) {
            countQuery += ' AND condition = ?';
            countParams.push(condition);
        }
        if (minPrice) {
            countQuery += ' AND price >= ?';
            countParams.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            countQuery += ' AND price <= ?';
            countParams.push(parseFloat(maxPrice));
        }

        db.get(countQuery, countParams, (err, countResult) => {
            if (err) {
                console.error('Database error:', err);
            }

            // 解析 images JSON
            const processedItems = items.map(item => ({
                ...item,
                images: item.images ? JSON.parse(item.images) : []
            }));

            res.json({
                success: true,
                data: processedItems,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: countResult?.total || 0,
                    totalPages: Math.ceil((countResult?.total || 0) / parseInt(pageSize))
                }
            });
        });
    });
});

/**
 * GET /api/items
 * 获取物品列表
 */
router.get('/', (req, res) => {
    const { category, status, sellerId, page = 1, pageSize = 20 } = req.query;
    const db = getDatabase();
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }

    if (sellerId) {
        query += ' AND seller_id = ?';
        params.push(sellerId);
    }

    query += ' ORDER BY post_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    db.all(query, params, (err, items) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: '获取物品列表失败'
            });
        }

        const processedItems = items.map(item => ({
            ...item,
            images: item.images ? JSON.parse(item.images) : []
        }));

        res.json({
            success: true,
            data: processedItems
        });
    });
});

/**
 * GET /api/items/featured
 * 获取热门物品
 */
router.get('/featured', (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const db = getDatabase();

    db.all(
        `SELECT * FROM items 
        WHERE status = 'AVAILABLE' 
        ORDER BY view_count DESC, post_date DESC 
        LIMIT ?`,
        [limit],
        (err, items) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: '获取热门物品失败'
                });
            }

            const processedItems = items.map(item => ({
                ...item,
                images: item.images ? JSON.parse(item.images) : []
            }));

            res.json({
                success: true,
                data: processedItems
            });
        }
    );
});

/**
 * GET /api/items/:id
 * 获取物品详情
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();

    db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: '获取物品详情失败'
            });
        }

        if (!item) {
            return res.status(404).json({
                success: false,
                message: '物品不存在'
            });
        }

        // 获取卖家信息
        db.get('SELECT id, name, email, member_type, verified, average_rating FROM users WHERE id = ?', [item.seller_id], (err, seller) => {
            if (err) {
                console.error('Database error:', err);
            }

            const itemData = {
                ...item,
                images: item.images ? JSON.parse(item.images) : [],
                seller: seller || null
            };

            res.json({
                success: true,
                data: itemData
            });
        });
    });
});

/**
 * POST /api/items
 * 发布物品
 */
router.post('/', authenticateToken, (req, res) => {
    const {
        title, description, category, price, condition, images,
        isbn, course_code, module_name, edition, author,
        brand, model_number, warranty_status, original_purchase_date, accessories_included,
        item_type, dimensions, material, assembly_required, condition_details,
        size, clothing_brand, material_type, color, gender,
        sports_brand, size_dimensions, sport_type, sports_condition_details
    } = req.body;

    // 验证必填字段
    if (!title || !category || !price || !condition) {
        return res.status(400).json({
            success: false,
            message: '标题、类别、价格和状况为必填项'
        });
    }

    const db = getDatabase();
    const itemId = uuidv4();
    const now = Date.now();

    // 准备数据
    const imagesJson = images && Array.isArray(images) ? JSON.stringify(images) : '[]';

    db.run(
        `INSERT INTO items (
            id, seller_id, title, description, category, price, condition, status,
            images, view_count,
            isbn, course_code, module_name, edition, author,
            brand, model_number, warranty_status, original_purchase_date, accessories_included,
            item_type, dimensions, material, assembly_required, condition_details,
            size, clothing_brand, material_type, color, gender,
            sports_brand, size_dimensions, sport_type, sports_condition_details,
            post_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            itemId, req.user.userId, title, description || null, category, parseFloat(price), condition, 'AVAILABLE',
            imagesJson, 0,
            isbn || null, course_code || null, module_name || null, edition || null, author || null,
            brand || null, model_number || null, warranty_status || null, original_purchase_date || null, accessories_included || null,
            item_type || null, dimensions || null, material || null, assembly_required ? 1 : 0, condition_details || null,
            size || null, clothing_brand || null, material_type || null, color || null, gender || null,
            sports_brand || null, size_dimensions || null, sport_type || null, sports_condition_details || null,
            now, now, now
        ],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: '发布物品失败'
                });
            }

            res.status(201).json({
                success: true,
                message: '物品发布成功',
                itemId: itemId
            });
        }
    );
});

/**
 * PUT /api/items/:id
 * 更新物品
 */
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getDatabase();

    // 检查物品是否存在且属于当前用户
    db.get('SELECT seller_id FROM items WHERE id = ?', [id], (err, item) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: '数据库错误'
            });
        }

        if (!item) {
            return res.status(404).json({
                success: false,
                message: '物品不存在'
            });
        }

        if (item.seller_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: '无权修改此物品'
            });
        }

        // 更新物品（简化版，实际应该根据类别更新不同字段）
        const {
            title, description, price, condition, images, status
        } = req.body;
        const now = Date.now();

        const updates = [];
        const params = [];

        if (title) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (price) {
            updates.push('price = ?');
            params.push(parseFloat(price));
        }
        if (condition) {
            updates.push('condition = ?');
            params.push(condition);
        }
        if (images) {
            updates.push('images = ?');
            params.push(JSON.stringify(images));
        }
        if (status) {
            updates.push('status = ?');
            params.push(status);
        }

        updates.push('updated_at = ?');
        params.push(now);
        params.push(id);

        db.run(
            `UPDATE items SET ${updates.join(', ')} WHERE id = ?`,
            params,
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: '更新失败'
                    });
                }

                res.json({
                    success: true,
                    message: '物品更新成功'
                });
            }
        );
    });
});

/**
 * DELETE /api/items/:id
 * 删除物品
 */
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getDatabase();

    // 检查物品是否存在且属于当前用户
    db.get('SELECT seller_id FROM items WHERE id = ?', [id], (err, item) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: '数据库错误'
            });
        }

        if (!item) {
            return res.status(404).json({
                success: false,
                message: '物品不存在'
            });
        }

        if (item.seller_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: '无权删除此物品'
            });
        }

        // 软删除（标记为已删除）
        db.run('UPDATE items SET status = "DELETED" WHERE id = ?', [id], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: '删除失败'
                });
            }

            res.json({
                success: true,
                message: '物品删除成功'
            });
        });
    });
});

/**
 * POST /api/items/:id/view
 * 增加物品浏览量
 */
router.post('/:id/view', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();

    db.run('UPDATE items SET view_count = view_count + 1 WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: '更新浏览量失败'
            });
        }

        res.json({
            success: true,
            message: '浏览量已更新'
        });
    });
});

module.exports = router;
