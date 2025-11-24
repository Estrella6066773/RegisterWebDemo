/**
 * ============================================
 * 数据验证中间件
 * ============================================
 */

/**
 * 验证物品数据
 */
function validateItem(req, res, next) {
    const { title, description, category, price, condition } = req.body;
    const errors = [];

    // 验证标题
    if (!title || typeof title !== 'string') {
        errors.push('标题为必填项');
    } else if (title.trim().length < 2) {
        errors.push('标题至少需要2个字符');
    } else if (title.length > 200) {
        errors.push('标题不能超过200个字符');
    }

    // 验证描述
    if (description && typeof description === 'string' && description.length > 2000) {
        errors.push('描述不能超过2000个字符');
    }

    // 验证类别
    const validCategories = ['TEXTBOOK', 'ELECTRONICS', 'FURNITURE', 'APPAREL', 'SPORTS'];
    if (!category || !validCategories.includes(category)) {
        errors.push('类别必须是: ' + validCategories.join(', '));
    }

    // 验证价格
    if (price === undefined || price === null) {
        errors.push('价格为必填项');
    } else {
        const priceNum = parseFloat(price);
        if (isNaN(priceNum)) {
            errors.push('价格必须是有效数字');
        } else if (priceNum < 0) {
            errors.push('价格不能为负数');
        } else if (priceNum > 1000000) {
            errors.push('价格不能超过1,000,000');
        }
    }

    // 验证状况
    const validConditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];
    if (!condition || !validConditions.includes(condition)) {
        errors.push('状况必须是: ' + validConditions.join(', '));
    }

    // 验证图片
    if (req.body.images) {
        if (!Array.isArray(req.body.images)) {
            errors.push('图片必须是数组格式');
        } else if (req.body.images.length > 5) {
            errors.push('最多只能上传5张图片');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: '数据验证失败',
            errors: errors
        });
    }

    next();
}

/**
 * 验证用户注册数据
 */
function validateRegister(req, res, next) {
    const { email, password, memberType, name } = req.body;
    const errors = [];

    // 验证邮箱
    if (!email || typeof email !== 'string') {
        errors.push('邮箱为必填项');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('邮箱格式不正确');
        } else if (email.length > 255) {
            errors.push('邮箱长度不能超过255个字符');
        }
    }

    // 验证密码
    if (!password || typeof password !== 'string') {
        errors.push('密码为必填项');
    } else if (password.length < 6) {
        errors.push('密码至少需要6个字符');
    } else if (password.length > 100) {
        errors.push('密码不能超过100个字符');
    }

    // 验证会员类型（只支持学生会员和关联会员）
    const validMemberTypes = ['STUDENT', 'ASSOCIATE'];
    if (!memberType || !validMemberTypes.includes(memberType)) {
        errors.push('会员类型必须是: ' + validMemberTypes.join(' 或 '));
    }

    // 验证姓名（可选）
    if (name && typeof name === 'string') {
        if (name.trim().length < 2) {
            errors.push('姓名至少需要2个字符');
        } else if (name.length > 100) {
            errors.push('姓名不能超过100个字符');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: '数据验证失败',
            errors: errors
        });
    }

    next();
}

/**
 * 验证用户登录数据
 */
function validateLogin(req, res, next) {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string' || !email.trim()) {
        errors.push('邮箱为必填项');
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
        errors.push('密码为必填项');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: '数据验证失败',
            errors: errors
        });
    }

    next();
}

/**
 * 验证用户资料更新数据
 */
function validateProfileUpdate(req, res, next) {
    const { name, bio, university, enrollmentYear } = req.body;
    const errors = [];

    if (name !== undefined) {
        if (typeof name !== 'string') {
            errors.push('姓名必须是字符串');
        } else if (name.trim().length > 0 && name.trim().length < 2) {
            errors.push('姓名至少需要2个字符');
        } else if (name.length > 100) {
            errors.push('姓名不能超过100个字符');
        }
    }

    if (bio !== undefined && typeof bio === 'string' && bio.length > 500) {
        errors.push('个人简介不能超过500个字符');
    }

    if (university !== undefined && typeof university === 'string' && university.length > 200) {
        errors.push('大学名称不能超过200个字符');
    }

    if (enrollmentYear !== undefined) {
        const year = parseInt(enrollmentYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(year)) {
            errors.push('入学年份必须是有效数字');
        } else if (year < 1900 || year > currentYear + 10) {
            errors.push(`入学年份必须在1900到${currentYear + 10}之间`);
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: '数据验证失败',
            errors: errors
        });
    }

    next();
}

module.exports = {
    validateItem,
    validateRegister,
    validateLogin,
    validateProfileUpdate
};

