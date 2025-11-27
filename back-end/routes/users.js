/**
 * 用户相关路由
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../db/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateRegister, validateLogin, validateProfileUpdate } = require('../middleware/validation');

// 临时存储注册数据（在实际应用中应该使用Redis或数据库）
const tempRegistrations = new Map();

/**
 * POST /api/users/register
 * 用户注册 - 只存储临时数据，不立即创建账号
 */
router.post('/register', validateRegister, async (req, res) => {
    try {
        const { email, password, memberType, name } = req.body;

        // 验证必填字段
        if (!email || !password || !memberType) {
            return res.status(400).json({
                success: false,
                message: '邮箱、密码和会员类型为必填项'
            });
        }

        // 验证会员类型（只允许学生会员和关联会员）
        if (!['STUDENT', 'ASSOCIATE'].includes(memberType)) {
            return res.status(400).json({
                success: false,
                message: '无效的会员类型，只支持学生会员和关联会员'
            });
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '无效的邮箱格式'
            });
        }

        // 验证大学邮箱（学生和关联会员）
        if ((memberType === 'STUDENT' || memberType === 'ASSOCIATE') && !email.endsWith('.edu')) {
            return res.status(400).json({
                success: false,
                message: '学生会员和关联会员需要使用大学邮箱（.edu 域名）'
            });
        }

        const db = getDatabase();
        
        // 检查邮箱是否已存在
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: '数据库错误'
                });
            }

            if (row) {
                return res.status(409).json({
                    success: false,
                    message: '该邮箱已被注册'
                });
            }

            // 生成临时注册ID和验证令牌
            const tempId = uuidv4();
            const verificationToken = uuidv4();
            const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24小时后过期
            
            // 存储临时注册数据
            const tempRegistration = {
                id: tempId,
                email,
                password,
                memberType,
                name: name || null,
                verificationToken,
                verificationTokenExpires,
                createdAt: Date.now()
            };
            
            tempRegistrations.set(tempId, tempRegistration);

            res.status(200).json({
                success: true,
                message: '注册信息已保存，请完成验证',
                tempId: tempId,
                verificationToken: verificationToken,
                requiresVerification: true
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

/**
 * POST /api/users/login
 * 用户登录
 */
router.post('/login', validateLogin, (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '邮箱和密码为必填项'
            });
        }

        const db = getDatabase();
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: '数据库错误'
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '邮箱或密码错误'
                });
            }

            // 验证密码
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: '邮箱或密码错误'
                });
            }

            // 生成 JWT Token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    memberType: user.member_type
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // 返回用户数据（不包含密码）
            const userData = {
                id: user.id,
                email: user.email,
                name: user.name,
                memberType: user.member_type,
                verified: user.verified === 1,
                avatar: user.avatar,
                bio: user.bio,
                university: user.university,
                enrollmentYear: user.enrollment_year,
                joinDate: user.join_date
            };

            res.json({
                success: true,
                message: '登录成功',
                token: token,
                userData: userData
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

/**
 * POST /api/users/logout
 * 用户登出（客户端删除 token 即可）
 */
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: '登出成功'
    });
});

/**
 * GET /api/users/me
 * 获取当前用户信息
 */
router.get('/me', authenticateToken, (req, res) => {
    const db = getDatabase();
    db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: '数据库错误'
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 计算成功交易数和平均评分
        db.get(
            `SELECT 
                COUNT(DISTINCT r.id) as rating_count,
                AVG(r.rating) as average_rating,
                COUNT(DISTINCT CASE WHEN i.status = 'SOLD' THEN i.id END) as successful_transactions
            FROM users u
            LEFT JOIN ratings r ON r.rated_user_id = u.id
            LEFT JOIN items i ON i.seller_id = u.id
            WHERE u.id = ?`,
            [req.user.userId],
            (err, stats) => {
                if (err) {
                    console.error('Database error:', err);
                }

                const userData = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    memberType: user.member_type,
                    verified: user.verified === 1,
                    avatar: user.avatar,
                    bio: user.bio,
                    university: user.university,
                    enrollmentYear: user.enrollment_year,
                    joinDate: user.join_date,
                    successfulTransactions: stats?.successful_transactions || 0,
                    averageRating: stats?.average_rating ? parseFloat(stats.average_rating.toFixed(1)) : null,
                    ratingCount: stats?.rating_count || 0
                };

                res.json({
                    success: true,
                    data: userData
                });
            }
        );
    });
});

/**
 * GET /api/users/profile
 * 获取用户资料（当前用户或指定用户）
 */
router.get('/profile', optionalAuth, (req, res) => {
    const userId = req.query.userId || (req.user ? req.user.userId : null);
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: '需要提供用户ID或登录'
        });
    }

    const db = getDatabase();
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: '数据库错误'
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 计算统计信息
        db.get(
            `SELECT 
                COUNT(DISTINCT r.id) as rating_count,
                AVG(r.rating) as average_rating,
                COUNT(DISTINCT CASE WHEN i.status = 'SOLD' THEN i.id END) as successful_transactions
            FROM users u
            LEFT JOIN ratings r ON r.rated_user_id = u.id
            LEFT JOIN items i ON i.seller_id = u.id
            WHERE u.id = ?`,
            [userId],
            (err, stats) => {
                if (err) {
                    console.error('Database error:', err);
                }

                // 计算资料完整度
                let completeness = 0;
                const fields = ['name', 'avatar', 'bio', 'university', 'enrollment_year'];
                fields.forEach(field => {
                    if (user[field]) completeness += 20;
                });

                const userData = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    memberType: user.member_type,
                    verified: user.verified === 1,
                    avatar: user.avatar,
                    bio: user.bio,
                    university: user.university,
                    enrollmentYear: user.enrollment_year,
                    joinDate: user.join_date,
                    successfulTransactions: stats?.successful_transactions || 0,
                    averageRating: stats?.average_rating ? parseFloat(stats.average_rating.toFixed(1)) : null,
                    ratingCount: stats?.rating_count || 0,
                    profileCompleteness: completeness
                };

                res.json({
                    success: true,
                    data: userData
                });
            }
        );
    });
});

/**
 * PUT /api/users/profile
 * 更新用户资料
 */
router.put('/profile', authenticateToken, validateProfileUpdate, (req, res) => {
    const { name, avatar, bio, university, enrollmentYear } = req.body;
    const db = getDatabase();
    const now = Date.now();

    db.run(
        `UPDATE users 
        SET name = COALESCE(?, name),
            avatar = COALESCE(?, avatar),
            bio = COALESCE(?, bio),
            university = COALESCE(?, university),
            enrollment_year = COALESCE(?, enrollment_year),
            updated_at = ?
        WHERE id = ?`,
        [name, avatar, bio, university, enrollmentYear, now, req.user.userId],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: '更新失败'
                });
            }

            res.json({
                success: true,
                message: '资料更新成功'
            });
        }
    );
});

/**
 * POST /api/users/verification/send
 * 发送验证邮件（模拟实现）
 */
router.post('/verification/send', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();
        db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], async (err, user) => {
            if (err || !user) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            if (user.verified === 1) {
                return res.status(400).json({
                    success: false,
                    message: '用户已验证'
                });
            }

            const verificationToken = uuidv4();
            const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

            db.run(
                'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
                [verificationToken, verificationTokenExpires, req.user.userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: '发送失败'
                        });
                    }

                    // 模拟发送邮件（实际应该使用 nodemailer）
                    console.log(`验证邮件已发送到 ${user.email}，验证令牌: ${verificationToken}`);
                    
                    res.json({
                        success: true,
                        message: '验证邮件已发送',
                        token: verificationToken // 开发环境返回 token 用于测试
                    });
                }
            );
        });
    } catch (error) {
        console.error('Verification send error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

/**
 * POST /api/users/verification/verify
 * 验证邮箱并创建账号 - 直接视为验证成功
 */
router.post('/verification/verify', async (req, res) => {
    const { token, tempId } = req.body;

    try {
        let tempRegistration = null;
        
        // 如果有tempId，使用新的注册流程
        if (tempId) {
            tempRegistration = tempRegistrations.get(tempId);
            if (!tempRegistration) {
                return res.status(400).json({
                    success: false,
                    message: '无效的临时注册ID'
                });
            }
        }
        // 如果有token，使用旧的验证流程（兼容性）
        else if (token) {
            for (let [id, registration] of tempRegistrations.entries()) {
                if (registration.verificationToken === token) {
                    tempRegistration = registration;
                    tempId = id;
                    break;
                }
            }
        }
        
        if (!tempRegistration) {
            return res.status(400).json({
                success: false,
                message: '无效的验证请求'
            });
        }

        const db = getDatabase();
        const userId = uuidv4();
        const passwordHash = await bcrypt.hash(tempRegistration.password, 10);
        const now = Date.now();

        // 创建已验证的用户账号
        db.run(
            `INSERT INTO users (
                id, email, password_hash, name, member_type, verified,
                verification_token, verification_token_expires,
                join_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, tempRegistration.email, passwordHash, tempRegistration.name, tempRegistration.memberType,
                1, // 已验证
                null, null, // 清除验证令牌
                now, now, now
            ],
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: '创建账号失败'
                    });
                }

                // 删除临时注册数据
                if (tempId) {
                    tempRegistrations.delete(tempId);
                }

                res.json({
                    success: true,
                    message: '验证成功，账号已创建',
                    userId: userId
                });
            }
        );
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

/**
 * POST /api/users/verification/skip
 * 跳过验证流程并创建账号（仅开发/测试环境使用）
 * 注意：创建未验证的账号
 */
router.post('/verification/skip', async (req, res) => {
    const { tempId } = req.body;

    if (!tempId) {
        return res.status(400).json({
            success: false,
            message: '需要提供临时注册ID'
        });
    }

    try {
        const tempRegistration = tempRegistrations.get(tempId);
        if (!tempRegistration) {
            return res.status(400).json({
                success: false,
                message: '无效的临时注册ID'
            });
        }

        const db = getDatabase();
        const userId = uuidv4();
        const passwordHash = await bcrypt.hash(tempRegistration.password, 10);
        const now = Date.now();

        // 创建未验证的用户账号
        db.run(
            `INSERT INTO users (
                id, email, password_hash, name, member_type, verified,
                verification_token, verification_token_expires,
                join_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, tempRegistration.email, passwordHash, tempRegistration.name, tempRegistration.memberType,
                0, // 未验证
                null, null, // 清除验证令牌
                now, now, now
            ],
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: '创建账号失败'
                    });
                }

                // 删除临时注册数据
                tempRegistrations.delete(tempId);

                res.json({
                    success: true,
                    message: '验证流程已跳过，未验证账号已创建',
                    userId: userId
                });
            }
        );
    } catch (error) {
        console.error('Skip verification error:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

/**
 * GET /api/users/verification/status
 * 检查验证状态
 */
router.get('/verification/status', authenticateToken, (req, res) => {
    const db = getDatabase();
    db.get('SELECT email, verified FROM users WHERE id = ?', [req.user.userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        res.json({
            success: true,
            data: {
                email: user.email,
                verified: user.verified === 1
            }
        });
    });
});

module.exports = router;
