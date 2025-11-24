/**
 * ============================================
 * 认证工具 - Authentication Utilities
 * ============================================
 */

/**
 * 保存用户认证信息
 * @param {Object} userData - 用户数据
 * @param {string} token - 认证token
 */
function saveAuth(userData, token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
}

/**
 * 获取认证token
 * @returns {string|null}
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * 获取用户数据
 * @returns {Object|null}
 */
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

/**
 * 清除认证信息
 */
function clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
}

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
function isAuthenticated() {
    return !!getAuthToken();
}

/**
 * 检查用户会员类型
 * @returns {string|null} 'STUDENT', 'ASSOCIATE' 或 null
 */
function getUserMemberType() {
    const userData = getUserData();
    return userData ? userData.memberType : null;
}

/**
 * 检查用户是否已验证
 * @returns {boolean}
 */
function isUserVerified() {
    const userData = getUserData();
    return userData ? userData.verified === true : false;
}

/**
 * 获取会员类型中文名称
 * @param {string} memberType - 会员类型
 * @returns {string}
 */
function getMemberTypeName(memberType) {
    const names = {
        'STUDENT': '学生会员',
        'ASSOCIATE': '关联会员',
    };
    return names[memberType] || '未知';
}

/**
 * 检查用户权限
 * @param {string} requiredType - 需要的会员类型
 * @returns {boolean}
 */
function hasPermission(requiredType) {
    const userType = getUserMemberType();
    if (!userType) return false;
    
    // 学生会员和关联会员有完整权限
    return userType === 'STUDENT' || userType === 'ASSOCIATE';
}

/**
 * 导出认证函数
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveAuth,
        getAuthToken,
        getUserData,
        clearAuth,
        isAuthenticated,
        getUserMemberType,
        isUserVerified,
        getMemberTypeName,
        hasPermission,
    };
}

