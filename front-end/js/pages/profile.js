/**
 * ============================================
 * 个人资料页面逻辑 - Profile Page Logic
 * ============================================
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    initProfilePage();
});

/**
 * 初始化个人资料页面
 */
async function initProfilePage() {
    // 检查登录状态
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // 加载用户资料
    await loadUserProfile();
}

/**
 * 加载用户资料
 */
async function loadUserProfile() {
    try {
        // 调用API获取用户资料（预留后端）
        // const profile = await UserAPI.getProfile();
        
        // 模拟数据（开发阶段）
        const profile = getMockProfileData();
        
        // 渲染资料
        renderProfile(profile);
        
    } catch (error) {
        console.error('加载资料失败:', error);
        alert('加载资料失败: ' + (error.message || '未知错误'));
    }
}

/**
 * 渲染用户资料
 * @param {Object} profile - 用户资料数据
 */
function renderProfile(profile) {
    // 渲染头部信息
    renderProfileHeader(profile);
    
    // 渲染信任指标
    renderTrustIndicators(profile);
    
    // 渲染资料完整度
    renderProfileCompleteness(profile);
    
    // 渲染详细资料
    renderProfileDetails(profile);
    
    // 渲染评分历史
    renderRatingHistory(profile);
}

/**
 * 渲染资料头部
 * @param {Object} profile - 用户资料
 */
function renderProfileHeader(profile) {
    const avatar = document.querySelector('.profile-avatar');
    const name = document.querySelector('.profile-name');
    const email = document.querySelector('.profile-email');
    const memberType = document.querySelector('.profile-member-type');
    const joinDate = document.querySelector('.profile-join-date');
    
    if (avatar) {
        avatar.src = profile.avatar || 'images/default-avatar.png';
        avatar.alt = profile.name || '用户头像';
    }
    
    if (name) {
        name.textContent = profile.name || '未设置姓名';
        // 添加验证徽章
        const badge = document.createElement('span');
        badge.className = profile.verified ? 'badge badge-verified' : 'badge badge-unverified';
        badge.textContent = profile.verified ? '已验证' : '未验证';
        name.appendChild(badge);
    }
    
    if (email) {
        email.textContent = profile.email || '';
    }
    
    if (memberType) {
        memberType.textContent = getMemberTypeName(profile.memberType);
        memberType.className = `badge badge-member-${profile.memberType.toLowerCase()}`;
    }
    
    if (joinDate) {
        joinDate.textContent = formatDate(profile.joinDate);
    }
}

/**
 * 渲染信任指标
 * @param {Object} profile - 用户资料
 */
function renderTrustIndicators(profile) {
    const indicators = [
        {
            icon: profile.verified ? '✓' : '✗',
            value: profile.verified ? '已验证' : '未验证',
            label: '验证状态',
            color: profile.verified ? 'var(--success-color)' : 'var(--text-disabled)',
        },
        {
            icon: '📅',
            value: formatDate(profile.joinDate),
            label: '加入日期',
        },
        {
            icon: '💰',
            value: profile.successfulTransactions || 0,
            label: '成功交易',
        },
        {
            icon: '⭐',
            value: profile.averageRating ? profile.averageRating.toFixed(1) : '0.0',
            label: '平均评分',
        },
    ];
    
    const container = document.querySelector('.trust-indicators');
    if (!container) return;
    
    container.innerHTML = indicators.map(indicator => `
        <div class="trust-card">
            <div class="trust-card-icon" style="color: ${indicator.color || 'var(--primary-color)'}">
                ${indicator.icon}
            </div>
            <div class="trust-card-value">${indicator.value}</div>
            <div class="trust-card-label">${indicator.label}</div>
        </div>
    `).join('');
}

/**
 * 渲染资料完整度
 * @param {Object} profile - 用户资料
 */
function renderProfileCompleteness(profile) {
    const completenessItems = [
        { key: 'avatar', label: '头像', completed: !!profile.avatar },
        { key: 'name', label: '姓名', completed: !!profile.name },
        { key: 'bio', label: '个人简介', completed: !!profile.bio },
        { key: 'university', label: '大学', completed: !!profile.university },
        { key: 'enrollmentYear', label: '入学年份', completed: !!profile.enrollmentYear },
    ];
    
    const completedCount = completenessItems.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / completenessItems.length) * 100);
    
    // 更新百分比
    const percentageElement = document.querySelector('.completeness-percentage');
    if (percentageElement) {
        percentageElement.textContent = `${percentage}%`;
    }
    
    // 更新进度条
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    // 更新项目列表
    const itemsContainer = document.querySelector('.completeness-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = completenessItems.map(item => `
            <div class="completeness-item">
                <div class="icon ${item.completed ? 'completed' : 'incomplete'}">
                    ${item.completed ? '✓' : '✗'}
                </div>
                <span>${item.label}</span>
            </div>
        `).join('');
    }
}

/**
 * 渲染详细资料
 * @param {Object} profile - 用户资料
 */
function renderProfileDetails(profile) {
    const details = [
        { label: '邮箱', value: profile.email },
        { label: '会员类型', value: getMemberTypeName(profile.memberType) },
        { label: '大学', value: profile.university || '未设置' },
        { label: '入学年份', value: profile.enrollmentYear || '未设置' },
        { label: '个人简介', value: profile.bio || '未设置' },
    ];
    
    const detailsContainer = document.querySelector('.details-grid');
    if (detailsContainer) {
        detailsContainer.innerHTML = details.map(detail => `
            <div class="detail-item">
                <div class="detail-label">${detail.label}</div>
                <div class="detail-value ${!detail.value || detail.value === '未设置' ? 'empty' : ''}">
                    ${detail.value || '未设置'}
                </div>
            </div>
        `).join('');
    }
}

/**
 * 渲染评分历史
 * @param {Object} profile - 用户资料
 */
function renderRatingHistory(profile) {
    const averageRating = profile.averageRating || 0;
    const ratingCount = profile.ratingCount || 0;
    
    // 更新平均评分
    const averageElement = document.querySelector('.rating-average');
    if (averageElement) {
        averageElement.textContent = averageRating.toFixed(1);
    }
    
    // 渲染星级
    const starsContainer = document.querySelector('.rating-stars');
    if (starsContainer) {
        starsContainer.innerHTML = Array.from({ length: 5 }, (_, i) => {
            const filled = i < Math.floor(averageRating);
            return `<span class="star ${filled ? 'filled' : ''}">★</span>`;
        }).join('');
    }
    
    // 更新评分数量
    const countElement = document.querySelector('.rating-count');
    if (countElement) {
        countElement.textContent = `基于 ${ratingCount} 条评价`;
    }
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @returns {string}
 */
function formatDate(date) {
    if (!date) return '未知';
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * 获取模拟资料数据（开发阶段）
 * @returns {Object}
 */
function getMockProfileData() {
    const userData = getUserData();
    return {
        id: userData?.id || '1',
        email: userData?.email || 'student@university.edu',
        name: userData?.name || '张三',
        memberType: userData?.memberType || 'STUDENT',
        verified: userData?.verified || false,
        avatar: userData?.avatar || null,
        bio: userData?.bio || null,
        university: userData?.university || null,
        enrollmentYear: userData?.enrollmentYear || null,
        joinDate: userData?.joinDate || new Date().toISOString(),
        successfulTransactions: 12,
        averageRating: 4.5,
        ratingCount: 8,
    };
}

