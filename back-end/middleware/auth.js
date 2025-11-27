/**
 * 认证中间件
 */

const jwt = require('jsonwebtoken');
const { getDatabase } = require('../db/database');

/**
 * JWT Token 验证中间件
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '未提供认证令牌'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: '无效或过期的令牌'
            });
        }

        // 将用户信息添加到请求对象
        req.user = decoded;
        next();
    });
}

/**
 * 可选认证中间件（如果提供了 token 则验证，否则继续）
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
            req.user = decoded;
        }
        next();
    });
}

/**
 * 检查用户权限（会员类型）
 */
function requireMemberType(...allowedTypes) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '需要登录'
            });
        }

        const db = getDatabase();
        return new Promise((resolve) => {
            db.get(
                'SELECT member_type FROM users WHERE id = ?',
                [req.user.userId],
                (err, row) => {
                    if (err || !row) {
                        return res.status(403).json({
                            success: false,
                            message: '用户不存在'
                        });
                    }

                    if (!allowedTypes.includes(row.member_type)) {
                        return res.status(403).json({
                            success: false,
                            message: '权限不足'
                        });
                    }

                    req.user.memberType = row.member_type;
                    next();
                    resolve();
                }
            );
        });
    };
}

module.exports = {
    authenticateToken,
    optionalAuth,
    requireMemberType
};
