

// 后端API基础路径
// 前后端已整合到同一服务器，使用相对路径
const API_BASE_URL = '/api';

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
            const error = new Error('服务器响应格式错误');
            error.type = 'RESPONSE_ERROR';
            throw error;
        }

        const data = await response.json();

        if (!response.ok) {
            // 根据状态码分类错误
            const error = new Error(data.message || `请求失败: ${response.status}`);
            error.status = response.status;
            // 保留验证错误数组
            if (data.errors && Array.isArray(data.errors)) {
                error.errors = data.errors;
            }
            // 保留原始响应数据
            error.response = data;
            
            if (response.status === 401) {
                error.type = 'AUTH_ERROR';
                error.message = '登录已过期，请重新登录';
            } else if (response.status === 403) {
                error.type = 'PERMISSION_ERROR';
                error.message = data.message || '权限不足';
            } else if (response.status === 404) {
                error.type = 'NOT_FOUND';
                error.message = data.message || '资源不存在';
            } else if (response.status >= 500) {
                error.type = 'SERVER_ERROR';
                error.message = '服务器错误，请稍后重试';
            } else {
                error.type = 'CLIENT_ERROR';
                // 对于400错误，保留原始错误消息
                if (response.status === 400 && data.message) {
                    error.message = data.message;
                }
            }
            
            throw error;
        }

        return data;
    } catch (error) {
        // 网络错误处理
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            const networkError = new Error('网络连接失败，请检查网络连接或服务器是否运行');
            networkError.type = 'NETWORK_ERROR';
            networkError.originalError = error;
            console.error('网络错误:', networkError);
            throw networkError;
        }
        
        // 如果已经有类型，直接抛出
        if (error.type) {
            console.error('API请求错误:', error.type, error.message);
            throw error;
        }
        
        // 其他未知错误
        const unknownError = new Error(error.message || '未知错误');
        unknownError.type = 'UNKNOWN_ERROR';
        unknownError.originalError = error;
        console.error('未知错误:', unknownError);
        throw unknownError;
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
     * @param {string} userData.memberType - 会员类型: 'STUDENT', 'ASSOCIATE'
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
     * @param {string} tempId - 临时注册ID（可选）
     */
    async verifyEmail(token, tempId = null) {
        const body = { token };
        if (tempId) {
            body.tempId = tempId;
        }
        return apiRequest('/users/verification/verify', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    /**
     * 检查邮箱验证状态
     */
    async checkVerificationStatus() {
        return apiRequest('/users/verification/status');
    },

    /**
     * 跳过验证并创建未验证账号（仅开发/测试环境使用）
     * @param {string} tempId - 临时注册ID
     */
    async skipVerification(tempId) {
        return apiRequest('/users/verification/skip', {
            method: 'POST',
            body: JSON.stringify({ tempId }),
        });
    },

    /**
     * 管理员验证用户（仅开发/测试环境使用）
     * @param {string} userId - 用户ID
     */
    async adminVerifyUser(userId) {
        return apiRequest('/users/verification/admin-verify', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
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
 * 图片上传相关API - Upload APIs
 * ============================================
 */

const UploadAPI = {
    /**
     * 上传单张图片
     * @param {File} file - 图片文件
     */
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('authToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'POST',
                headers: headers,
                body: formData,
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const error = new Error('服务器响应格式错误');
                error.type = 'RESPONSE_ERROR';
                throw error;
            }

            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || `上传失败: ${response.status}`);
                error.status = response.status;
                error.type = response.status === 401 ? 'AUTH_ERROR' : 'UPLOAD_ERROR';
                throw error;
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                const networkError = new Error('网络连接失败，请检查网络连接或服务器是否运行');
                networkError.type = 'NETWORK_ERROR';
                throw networkError;
            }
            throw error;
        }
    },

    /**
     * 上传多张图片（最多5张）
     * @param {File[]} files - 图片文件数组
     */
    async uploadImages(files) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

        const token = localStorage.getItem('authToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/upload/images`, {
                method: 'POST',
                headers: headers,
                body: formData,
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const error = new Error('服务器响应格式错误');
                error.type = 'RESPONSE_ERROR';
                throw error;
            }

            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || `上传失败: ${response.status}`);
                error.status = response.status;
                error.type = response.status === 401 ? 'AUTH_ERROR' : 'UPLOAD_ERROR';
                throw error;
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                const networkError = new Error('网络连接失败，请检查网络连接或服务器是否运行');
                networkError.type = 'NETWORK_ERROR';
                throw networkError;
            }
            throw error;
        }
    },
};

/**
 * ============================================
 * 导出API模块
 * ============================================
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UserAPI, ItemAPI, UploadAPI, apiRequest };
} else {
    // 浏览器环境 - 设置全局变量
    window.UserAPI = UserAPI;
    window.ItemAPI = ItemAPI;
    window.UploadAPI = UploadAPI;
    window.apiRequest = apiRequest;
}

