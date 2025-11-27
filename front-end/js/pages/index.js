/**
 * ============================================
 * 首页逻辑 - Index Page Logic
 * ============================================
 */

// 国际化函数
function t(key, fallback = '') {
    if (window.I18n && typeof window.I18n.t === 'function') {
        return I18n.t(key, fallback || key);
    }
    return fallback || key;
}

// 选择可用的 ItemAPI（优先使用前端模拟，其次真实后端）
function getItemAPI() {
    if (typeof window !== 'undefined') {
        if (window.MockItemAPI) return window.MockItemAPI;
        if (window.ItemAPI) return window.ItemAPI;
    }
    return {
        async getFeaturedItems() { return { items: [] }; },
    };
}

// 加载热门物品
async function loadFeaturedItems() {
    const container = document.getElementById('featuredItems');
    if (!container) return;

    try {
        // 调用API获取热门物品
        const response = await getItemAPI().getFeaturedItems(6);
        const items = response.data || [];

        if (items.length === 0) {
            container.innerHTML = `
                <div class="items-empty">
                    <div class="items-empty-icon">📦</div>
                    <p>暂无热门物品</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => createItemCard(item)).join('');
    } catch (error) {
        console.error('加载热门物品失败:', error);
        container.innerHTML = `
            <div class="items-empty">
                <div class="items-empty-icon">⚠️</div>
                <p>加载失败，请稍后重试</p>
            </div>
        `;
    }
}

// 创建物品卡片HTML
function createItemCard(item) {
    const imageUrl = item.images && item.images.length > 0 
        ? item.images[0] 
        : null;
    
    const imageHtml = imageUrl 
        ? `<img src="${imageUrl}" alt="${item.title}" class="item-image">`
        : `<div class="item-image-placeholder">📦</div>`;

    const conditionClass = getConditionClass(item.condition);
    const conditionText = getConditionText(item.condition);

    return `
        <a href="pages/item-detail.html?id=${item.id}" class="item-card">
            <div class="item-image-container">
                ${imageHtml}
            </div>
            <div class="item-info">
                <h3 class="item-title">${escapeHtml(item.title)}</h3>
                <div class="item-price">¥${item.price || 0}</div>
                <div class="item-meta">
                    <span class="item-condition ${conditionClass}">${conditionText}</span>
                    <span>👁️ ${item.viewCount || 0}</span>
                </div>
            </div>
        </a>
    `;
}

// 获取状况样式类
function getConditionClass(condition) {
    const map = {
        'NEW': 'condition-new',
        'LIKE_NEW': 'condition-like-new',
        'GOOD': 'condition-good',
        'FAIR': 'condition-fair',
        'POOR': 'condition-poor',
    };
    return map[condition] || '';
}

// 获取状况文本
function getConditionText(condition) {
    const map = {
        'NEW': t('postItem.condition.new', '全新'),
        'LIKE_NEW': t('postItem.condition.likeNew', '几乎全新'),
        'GOOD': t('postItem.condition.good', '良好'),
        'FAIR': t('postItem.condition.fair', '一般'),
        'POOR': t('postItem.condition.poor', '较差'),
    };
    return map[condition] || condition;
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedItems();
    
    // 监听语言切换事件，重新加载内容
    document.addEventListener('i18n:languageChanged', function() {
        loadFeaturedItems();
    });
});

