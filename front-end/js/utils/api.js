/**
 * ============================================
 * API 接口调用模块 - API Service Module
 * 预留后端接口调用
 * ============================================
 */

const API_BASE_URL = '/api'; // 后端API基础路径

/**
 * 通用请求方法
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 添加认证token（如果存在）
    const token = localStorage.getItem('authToken');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        
        // 处理非JSON响应
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('响应格式错误');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `请求失败: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

/**
 * ============================================
 * 用户相关API - User APIs
 * ============================================
 */

const UserAPI = {
    /**
     * 用户注册
     * @param {Object} userData - 用户注册数据
     * @param {string} userData.email - 邮箱
     * @param {string} userData.password - 密码
     * @param {string} userData.memberType - 会员类型: 'GENERAL', 'STUDENT', 'ASSOCIATE'
     * @param {string} userData.name - 姓名（可选）
     */
    async register(userData) {
        return apiRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    /**
     * 用户登录
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     */
    async login(email, password) {
        return apiRequest('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    /**
     * 用户登出
     */
    async logout() {
        return apiRequest('/users/logout', {
            method: 'POST',
        });
    },

    /**
     * 获取当前用户信息
     */
    async getCurrentUser() {
        return apiRequest('/users/me');
    },

    /**
     * 获取用户资料
     * @param {string} userId - 用户ID（可选，不传则获取当前用户）
     */
    async getProfile(userId = null) {
        const endpoint = userId ? `/users/profile?userId=${userId}` : '/users/profile';
        return apiRequest(endpoint);
    },

    /**
     * 更新用户资料
     * @param {Object} profileData - 资料数据
     */
    async updateProfile(profileData) {
        return apiRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    /**
     * 发送邮箱验证码
     * @param {string} email - 邮箱地址
     */
    async sendVerificationEmail(email) {
        return apiRequest('/users/verification/send', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    /**
     * 验证邮箱
     * @param {string} token - 验证token
     */
    async verifyEmail(token) {
        return apiRequest('/users/verification/verify', {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    },

    /**
     * 检查邮箱验证状态
     */
    async checkVerificationStatus() {
        return apiRequest('/users/verification/status');
    },
};

/**
 * ============================================
 * 物品相关API - Item APIs
 * ============================================
 */

const ItemAPI = {
    /**
     * 搜索物品
     * @param {Object} searchParams - 搜索参数
     * @param {string} searchParams.keyword - 关键词
     * @param {string} searchParams.category - 类别: 'TEXTBOOK', 'ELECTRONICS', 'FURNITURE', 'APPAREL', 'SPORTS'
     * @param {number} searchParams.minPrice - 最低价格
     * @param {number} searchParams.maxPrice - 最高价格
     * @param {string} searchParams.condition - 状况: 'NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'
     * @param {string} searchParams.sortBy - 排序: 'newest', 'price_asc', 'price_desc', 'views'
     * @param {number} searchParams.page - 页码
     * @param {number} searchParams.pageSize - 每页数量
     */
    async searchItems(searchParams = {}) {
        const queryParams = new URLSearchParams();
        Object.keys(searchParams).forEach(key => {
            if (searchParams[key] !== null && searchParams[key] !== undefined && searchParams[key] !== '') {
                queryParams.append(key, searchParams[key]);
            }
        });
        const queryString = queryParams.toString();
        const endpoint = `/items/search${queryString ? '?' + queryString : ''}`;
        return apiRequest(endpoint);
    },

    /**
     * 获取物品列表
     * @param {Object} params - 查询参数
     */
    async getItems(params = {}) {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        const queryString = queryParams.toString();
        const endpoint = `/items${queryString ? '?' + queryString : ''}`;
        return apiRequest(endpoint);
    },

    /**
     * 获取热门物品
     * @param {number} limit - 数量限制
     */
    async getFeaturedItems(limit = 8) {
        return apiRequest(`/items/featured?limit=${limit}`);
    },

    /**
     * 获取物品详情
     * @param {string} itemId - 物品ID
     */
    async getItemDetail(itemId) {
        return apiRequest(`/items/${itemId}`);
    },

    /**
     * 发布物品
     * @param {Object} itemData - 物品数据
     */
    async createItem(itemData) {
        return apiRequest('/items', {
            method: 'POST',
            body: JSON.stringify(itemData),
        });
    },

    /**
     * 更新物品
     * @param {string} itemId - 物品ID
     * @param {Object} itemData - 物品数据
     */
    async updateItem(itemId, itemData) {
        return apiRequest(`/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(itemData),
        });
    },

    /**
     * 删除物品
     * @param {string} itemId - 物品ID
     */
    async deleteItem(itemId) {
        return apiRequest(`/items/${itemId}`, {
            method: 'DELETE',
        });
    },

    /**
     * 增加物品浏览量
     * @param {string} itemId - 物品ID
     */
    async incrementViewCount(itemId) {
        return apiRequest(`/items/${itemId}/view`, {
            method: 'POST',
        });
    },

    /**
     * 获取当前用户的物品列表
     * @param {Object} params - 查询参数
     */
    async getMyItems(params = {}) {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        const queryString = queryParams.toString();
        const endpoint = `/items/my${queryString ? '?' + queryString : ''}`;
        return apiRequest(endpoint);
    },

    /**
     * 更新物品状态
     * @param {string} itemId - 物品ID
     * @param {string} status - 状态: 'AVAILABLE', 'RESERVED', 'SOLD', 'DELETED'
     */
    async updateItemStatus(itemId, status) {
        return apiRequest(`/items/${itemId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
};

/**
 * ============================================
 * 导出API模块
 * ============================================
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UserAPI, ItemAPI, apiRequest };
}

