/**
 * ============================================
 * 物品浏览页面逻辑 - Items Browse Page Logic
 * ============================================
 */

let currentPage = 1;
const pageSize = 12;
let currentFilters = {};

function t(key, fallback = '') {
    if (window.I18n && typeof window.I18n.t === 'function') {
        return I18n.t(key, fallback || key);
    }
    return fallback || key;
}

function formatMessage(key, fallback, replacements = {}) {
    const template = t(key, fallback);
    return template.replace(/\{(\w+)\}/g, (_, token) => {
        if (Object.prototype.hasOwnProperty.call(replacements, token)) {
            return replacements[token];
        }
        return `{${token}}`;
    });
}

// 选择可用的 ItemAPI（优先使用前端模拟，其次真实后端）
function getItemAPI() {
    if (typeof window !== 'undefined') {
        if (window.MockItemAPI) return window.MockItemAPI;
        if (window.ItemAPI) return window.ItemAPI;
    }
    // 兜底，避免未定义报错
    return {
        async searchItems() { return { total: 0, items: [] }; },
        async getFeaturedItems() { return { items: [] }; },
    };
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从URL参数读取初始筛选条件
    const urlParams = new URLSearchParams(window.location.search);
    currentFilters = {
        keyword: urlParams.get('keyword') || '',
        category: urlParams.get('category') || '',
        minPrice: urlParams.get('minPrice') || '',
        maxPrice: urlParams.get('maxPrice') || '',
        condition: urlParams.get('condition') || '',
        sortBy: urlParams.get('sortBy') || 'newest',
    };

    // 设置表单初始值
    if (currentFilters.keyword) {
        document.getElementById('searchKeyword').value = currentFilters.keyword;
    }
    if (currentFilters.category) {
        const checkbox = document.querySelector(`input[name="category"][value="${currentFilters.category}"]`);
        if (checkbox) checkbox.checked = true;
    }
    if (currentFilters.condition) {
        const checkbox = document.querySelector(`input[name="condition"][value="${currentFilters.condition}"]`);
        if (checkbox) checkbox.checked = true;
    }
    if (currentFilters.minPrice) {
        document.getElementById('minPrice').value = currentFilters.minPrice;
    }
    if (currentFilters.maxPrice) {
        document.getElementById('maxPrice').value = currentFilters.maxPrice;
    }
    if (currentFilters.sortBy) {
        document.getElementById('sortBy').value = currentFilters.sortBy;
    }

    // 绑定事件
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('sortBy').addEventListener('change', handleSortChange);

    // 加载物品列表
    loadItems();
});

// 处理搜索
function handleSearch(e) {
    e.preventDefault();
    const keyword = document.getElementById('searchKeyword').value.trim();
    currentFilters.keyword = keyword;
    currentFilters.page = 1;
    updateURL();
    loadItems();
}

// 应用筛选
function applyFilters() {
    // 获取选中的类别
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
    const categories = Array.from(categoryCheckboxes).map(cb => cb.value);
    currentFilters.category = categories.length > 0 ? categories.join(',') : '';

    // 获取选中的状况
    const conditionCheckboxes = document.querySelectorAll('input[name="condition"]:checked');
    const conditions = Array.from(conditionCheckboxes).map(cb => cb.value);
    currentFilters.condition = conditions.length > 0 ? conditions.join(',') : '';

    // 获取价格范围
    currentFilters.minPrice = document.getElementById('minPrice').value.trim();
    currentFilters.maxPrice = document.getElementById('maxPrice').value.trim();

    currentFilters.page = 1;
    updateURL();
    loadItems();
}

// 重置筛选
function resetFilters() {
    // 重置表单
    document.getElementById('searchKeyword').value = '';
    document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="condition"]').forEach(cb => cb.checked = false);
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortBy').value = 'newest';

    // 重置筛选条件
    currentFilters = {
        keyword: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        condition: '',
        sortBy: 'newest',
        page: 1,
    };

    updateURL();
    loadItems();
}

// 处理排序变化
function handleSortChange() {
    currentFilters.sortBy = document.getElementById('sortBy').value;
    currentFilters.page = 1;
    updateURL();
    loadItems();
}

// 更新URL
function updateURL() {
    const params = new URLSearchParams();
    Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] && key !== 'page') {
            params.append(key, currentFilters[key]);
        }
    });
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState({}, '', newURL);
}

// 加载物品列表
async function loadItems() {
    const container = document.getElementById('itemsList');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!container) return;

    container.innerHTML = `<div class="items-loading" style="text-align: center; padding: 40px; color: var(--text-secondary);"><p>${t('items.list.loadingItems', '正在加载物品...')}</p></div>`;

    try {
        const searchParams = {
            ...currentFilters,
            page: currentPage,
            pageSize: pageSize,
        };

        const response = await getItemAPI().searchItems(searchParams);
        const items = response.data || [];
        const total = response.pagination?.total || 0;
        const totalPages = response.pagination?.totalPages || Math.ceil(total / pageSize);

        // 更新结果数量
        if (resultsCount) {
            resultsCount.textContent = formatMessage('items.list.count', '找到 {count} 个物品', { count: total });
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="items-empty" style="grid-column: 1 / -1;">
                    <div class="items-empty-icon">🔍</div>
                    <p>${t('items.list.emptyTitle', '没有找到相关物品')}</p>
                    <p style="font-size: 14px; margin-top: 8px;">${t('items.list.emptySubtitle', '试试调整搜索条件')}</p>
                </div>
            `;
            document.getElementById('pagination').style.display = 'none';
            return;
        }

        // 渲染物品列表
        container.innerHTML = items.map(item => createItemCard(item)).join('');

        // 渲染分页
        renderPagination(totalPages);

    } catch (error) {
        console.error('加载物品失败:', error);
        container.innerHTML = `
            <div class="items-empty" style="grid-column: 1 / -1;">
                <div class="items-empty-icon">⚠️</div>
                <p>${t('items.list.error', '加载失败，请稍后重试')}</p>
            </div>
        `;
        document.getElementById('pagination').style.display = 'none';
    }
}

// 创建物品卡片
function createItemCard(item) {
    const imageUrl = item.images && item.images.length > 0 
        ? item.images[0] 
        : null;
    
    const imageHtml = imageUrl 
        ? `<img src="${imageUrl}" alt="${item.title}" class="item-image">`
        : `<div class="item-image-placeholder">📦</div>`;

    const conditionClass = getConditionClass(item.condition);
    const conditionText = getConditionText(item.condition);

    // 格式化日期
    const postDate = item.postDate ? formatDate(item.postDate) : '';

    return `
        <a href="item-detail.html?id=${item.id}" class="item-card">
            <div class="item-image-container">
                ${imageHtml}
            </div>
            <div class="item-info">
                <h3 class="item-title">${escapeHtml(item.title)}</h3>
                <div class="item-price">¥${item.price || 0}</div>
                <div class="item-meta">
                    <span class="item-condition ${conditionClass}">${conditionText}</span>
                    <div style="display: flex; gap: 12px; font-size: 12px;">
                        <span>👁️ ${item.viewCount || 0}</span>
                        ${postDate ? `<span>📅 ${postDate}</span>` : ''}
                    </div>
                </div>
            </div>
        </a>
    `;
}

// 渲染分页
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination || totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';

    let html = '';

    // 上一页按钮
    html += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
            ${t('items.pagination.prev', '上一页')}
        </button>
    `;

    // 页码按钮
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-info">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-info">...</span>`;
        }
        html += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // 下一页按钮
    html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
            ${t('items.pagination.next', '下一页')}
        </button>
    `;

    pagination.innerHTML = html;
}

// 跳转到指定页
function goToPage(page) {
    currentPage = page;
    currentFilters.page = page;
    loadItems();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 工具函数
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

function getConditionText(condition) {
    const map = {
        'NEW': '全新',
        'LIKE_NEW': '几乎全新',
        'GOOD': '良好',
        'FAIR': '一般',
        'POOR': '较差',
    };
    return map[condition] || condition;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return t('items.date.today', '今天');
    if (days === 1) return t('items.date.yesterday', '昨天');
    if (days < 7) return formatMessage('items.date.daysAgo', '{count}天前', { count: days });
    if (days < 30) return formatMessage('items.date.weeksAgo', '{count}周前', { count: Math.floor(days / 7) });

    const locale = I18n && I18n.getLang && I18n.getLang() === 'en' ? 'en-US' : 'zh-CN';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

