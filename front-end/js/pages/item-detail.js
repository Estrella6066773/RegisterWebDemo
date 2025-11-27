

function t(key, fallback = '') {
    return window.I18n ? window.I18n.t(key, fallback) : fallback;
}

function formatMessage(key, fallback, replacements = {}) {
    let message = t(key, fallback);
    for (const [placeholder, value] of Object.entries(replacements)) {
        message = message.replace(`{${placeholder}}`, value);
    }
    return message;
}

// 获取URL参数中的物品ID
function getItemId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 选择可用的 ItemAPI（优先使用前端模拟，其次真实后端）
function getItemAPI() {
    if (typeof window !== 'undefined') {
        if (window.MockItemAPI) return window.MockItemAPI;
        if (window.ItemAPI) return window.ItemAPI;
    }
    return {
        async getItemDetail() { return { item: null }; },
        async incrementViewCount() { return { ok: true }; },
        async updateItemStatus() { return { ok: true }; },
        async getReviews() { return { reviews: [] }; },
        async addReview() { return { ok: true }; },
    };
}

// 加载物品详情
async function loadItemDetail() {
    const itemId = getItemId();
    const container = document.getElementById('itemDetailContainer');

    if (!itemId) {
        container.innerHTML = `
            <div class="error-state">
                <p>❌ ${t('itemDetail.error.invalidId', '物品ID无效')}</p>
                <a href="items.html" class="btn btn-primary" style="margin-top: 16px;">${t('itemDetail.actions.backToBrowse', '返回浏览')}</a>
            </div>
        `;
        return;
    }

    try {
        // 获取物品详情
        const response = await getItemAPI().getItemDetail(itemId);
        const item = response.data || response;

        // 增加浏览量
        try {
            await getItemAPI().incrementViewCount(itemId);
        } catch (error) {
            console.warn('增加浏览量失败:', error);
        }

        // 渲染物品详情
        renderItemDetail(item);
    } catch (error) {
        console.error('加载物品详情失败:', error);
        container.innerHTML = `
            <div class="error-state">
                <p>❌ ${t('itemDetail.error.loadFailed', '加载失败：')}${error.message || t('itemDetail.error.retry', '请稍后重试')}</p>
                <a href="items.html" class="btn btn-primary" style="margin-top: 16px;">${t('itemDetail.actions.backToBrowse', '返回浏览')}</a>
            </div>
        `;
    }
}

// 渲染物品详情
function renderItemDetail(item) {
    const container = document.getElementById('itemDetailContainer');
    
    // 获取类别名称
    const categoryNames = {
        'TEXTBOOK': `📚 ${t('itemDetail.category.textbook', '教材')}`,
        'ELECTRONICS': `💻 ${t('itemDetail.category.electronics', '电子产品')}`,
        'FURNITURE': `🪑 ${t('itemDetail.category.furniture', '家具')}`,
        'APPAREL': `👕 ${t('itemDetail.category.apparel', '服装')}`,
        'SPORTS': `⚽ ${t('itemDetail.category.sports', '体育器材')}`,
    };

    // 获取状况信息
    const conditionInfo = getConditionInfo(item.condition);

    // 格式化日期
    const postDate = item.postDate ? formatDate(item.postDate) : '';

    // 渲染图片
    const images = item.images || [];
    const mainImage = images.length > 0 ? images[0] : null;
    const thumbnails = images.slice(1, 5);

    const imagesHtml = `
        <div class="item-images">
            ${mainImage ? `
                <img src="${mainImage}" alt="${escapeHtml(item.title)}" class="item-main-image" id="mainImage">
            ` : `
                <div class="item-main-image" style="display: flex; align-items: center; justify-content: center; color: var(--text-disabled); font-size: 48px; min-height: 200px;">
                    📦
                </div>
            `}
            ${thumbnails.length > 0 ? `
                <div class="item-thumbnails">
                    ${thumbnails.map((img, index) => `
                        <img src="${img}" alt="${t('itemDetail.image.thumbnail', '缩略图')} ${index + 2}" class="item-thumbnail" onclick="changeMainImage('${img}')">
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    // 渲染详细信息
    const detailsHtml = renderItemDetails(item);

    // 渲染卖家信息（放置在标题上方）
    const sellerInlineHtml = item.seller ? renderSellerInfo(item.seller, 'inline') : '';

    container.innerHTML = `
        <div class="item-detail-container">
            <!-- 左侧：图片区域 -->
            <div class="item-detail-images">
                ${imagesHtml}
            </div>

            <!-- 右侧：商品信息区域 -->
            <div class="item-detail-info">
                ${sellerInlineHtml}
                <div class="item-header">
                    <h1 class="item-title">${escapeHtml(item.title)}</h1>
                    <div class="item-meta-info">
                        <div class="item-meta-item">
                            <span>📂</span>
                            <span>${categoryNames[item.category] || item.category}</span>
                        </div>
                        <div class="item-meta-item">
                            <span>👁️</span>
                            <span>${formatMessage('itemDetail.meta.views', '{count} 次浏览', { count: item.viewCount || 0 })}</span>
                        </div>
                        ${postDate ? `
                            <div class="item-meta-item">
                                <span>📅</span>
                                <span>${postDate}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="item-price-section">
                    <span class="item-price">¥${item.price || 0}</span>
                    <span class="item-condition-badge ${conditionInfo.class}">${conditionInfo.text}</span>
                </div>

                <div class="item-description">
                    <h2 class="item-description-title">${t('itemDetail.description.title', '物品描述')}</h2>
                    <div class="item-description-content">${escapeHtml(item.description || t('itemDetail.description.empty', '暂无描述'))}</div>
                </div>

                ${detailsHtml}

                <!-- 操作按钮区域 -->
                <div class="item-actions-section">
                    ${isAuthenticated() ? `
                        <button class="btn btn-primary btn-contact" onclick="contactSeller('${item.seller?.id || ''}')">
                            💬 ${t('itemDetail.actions.contactSeller', '联系卖家')}
                        </button>
                        ${item.seller?.id === getCurrentUserId() ? `
                            <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
                                <div style="font-size:14px;color:var(--text-secondary);">${t('itemDetail.status.current', '当前状态：')}<b id="statusText">${getStatusText(item.status)}</b></div>
                                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                    <button class="btn btn-secondary" onclick="updateStatus('${item.id}','RESERVED')">${t('itemDetail.actions.markReserved', '标记为已预定')}</button>
                                    <button class="btn btn-secondary" onclick="updateStatus('${item.id}','AVAILABLE')">${t('itemDetail.actions.markAvailable', '标记为可售')}</button>
                                    <button class="btn btn-secondary" onclick="updateStatus('${item.id}','SOLD')">${t('itemDetail.actions.markSold', '标记为已售出')}</button>
                                </div>
                            </div>
                        ` : `
                            <button class="btn btn-secondary" onclick="toggleWatch('${item.id}')" style="margin-top:8px;">
                                ⭐ ${t('itemDetail.actions.toggleWatch', '加入/取消关注')}
                            </button>
                        `}
                    ` : `
                        <a href="login.html" class="btn btn-primary btn-contact">
                            🔐 ${t('itemDetail.actions.loginToContact', '登录后联系卖家')}
                        </a>
                    `}
                    <a href="items.html" class="btn btn-secondary btn-contact" style="margin-top:8px;">
                        ← ${t('itemDetail.actions.backToBrowse', '返回浏览')}
                    </a>
                </div>
            </div>

            <!-- 底部：仅保留评价 -->
            <div class="item-detail-sidebar">
                <div class="sidebar-card">
                    <h3 class="sidebar-card-title">${t('itemDetail.reviews.title', '买家评价')}</h3>
                    <div id="reviewsContainer" style="display:flex;flex-direction:column;gap:12px;"></div>
                    ${item.status === 'SOLD' && item.seller?.id !== getCurrentUserId() && isAuthenticated() ? `
                        <div style="margin-top:12px;">
                            <div style="font-size:14px;color:var(--text-secondary);margin-bottom:6px;">${t('itemDetail.reviews.postTitle', '我已购买，发表评价')}</div>
                            <div style="display:flex;flex-direction:column;gap:8px;">
                                <select id="reviewRating" class="form-control" style="max-width:180px;">
                                    <option value="5">5 - ${t('itemDetail.reviews.rating5', '非常满意')}</option>
                                    <option value="4">4 - ${t('itemDetail.reviews.rating4', '满意')}</option>
                                    <option value="3">3 - ${t('itemDetail.reviews.rating3', '一般')}</option>
                                    <option value="2">2 - ${t('itemDetail.reviews.rating2', '不太满意')}</option>
                                    <option value="1">1 - ${t('itemDetail.reviews.rating1', '很不满意')}</option>
                                </select>
                                <textarea id="reviewComment" rows="3" class="form-control" maxlength="1000" placeholder="${t('itemDetail.reviews.commentPlaceholder', '写点评价（最多1000字）')}"></textarea>
                                <button class="btn btn-primary" onclick="submitReview('${item.id}')">${t('itemDetail.reviews.submit', '提交评价')}</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // 加载评价
    loadReviews(item.id);
}

// 渲染详细信息
function renderItemDetails(item) {
    const category = item.category;
    if (!category) return '';

    const fields = [];
    
    // 根据类别添加特定字段
    if (category === 'TEXTBOOK') {
        if (item.isbn) fields.push({ label: t('itemDetail.fields.isbn', 'ISBN'), value: item.isbn });
        if (item.courseCode) fields.push({ label: t('itemDetail.fields.courseCode', '课程代码'), value: item.courseCode });
        if (item.moduleName) fields.push({ label: t('itemDetail.fields.moduleName', '模块名称'), value: item.moduleName });
        if (item.edition) fields.push({ label: t('itemDetail.fields.edition', '版次'), value: item.edition });
        if (item.author) fields.push({ label: t('itemDetail.fields.author', '作者'), value: item.author });
    } else if (category === 'ELECTRONICS') {
        if (item.brand) fields.push({ label: t('itemDetail.fields.brand', '品牌'), value: item.brand });
        const modelValue = item.model || item.modelNumber;
        if (modelValue) fields.push({ label: t('itemDetail.fields.model', '型号'), value: modelValue });
        if (item.warrantyStatus) fields.push({ label: t('itemDetail.fields.warrantyStatus', '保修状态'), value: item.warrantyStatus });
        const purchaseDateValue = item.purchaseDate || item.originalPurchaseDate;
        if (purchaseDateValue) fields.push({ label: t('itemDetail.fields.purchaseDate', '购买日期'), value: purchaseDateValue });
        const accessoriesValue = item.accessories || item.accessoriesIncluded;
        if (accessoriesValue) fields.push({ label: t('itemDetail.fields.accessories', '包含配件'), value: accessoriesValue });
    } else if (category === 'FURNITURE') {
        if (item.itemType) fields.push({ label: t('itemDetail.fields.itemType', '物品类型'), value: item.itemType });
        if (item.size) fields.push({ label: t('itemDetail.fields.size', '尺寸'), value: item.size });
        if (item.material) fields.push({ label: t('itemDetail.fields.material', '材质'), value: item.material });
        if (item.assemblyRequired) fields.push({ label: t('itemDetail.fields.assemblyRequired', '组装情况'), value: item.assemblyRequired });
        if (item.conditionDetails) fields.push({ label: t('itemDetail.fields.conditionDetails', '状况详情'), value: item.conditionDetails });
    } else if (category === 'APPAREL') {
        if (item.size) fields.push({ label: t('itemDetail.fields.sizeApparel', '尺码'), value: item.size });
        if (item.brand) fields.push({ label: t('itemDetail.fields.brand', '品牌'), value: item.brand });
        if (item.material) fields.push({ label: t('itemDetail.fields.material', '材质'), value: item.material });
        if (item.color) fields.push({ label: t('itemDetail.fields.color', '颜色'), value: item.color });
        if (item.gender) fields.push({ label: t('itemDetail.fields.gender', '性别'), value: item.gender });
    } else if (category === 'SPORTS') {
        if (item.brand) fields.push({ label: t('itemDetail.fields.brand', '品牌'), value: item.brand });
        if (item.size) fields.push({ label: t('itemDetail.fields.size', '尺寸'), value: item.size });
        if (item.sportType) fields.push({ label: t('itemDetail.fields.sportType', '运动类型'), value: item.sportType });
        if (item.conditionDetails) fields.push({ label: t('itemDetail.fields.conditionDetails', '状况详情'), value: item.conditionDetails });
    }

    if (fields.length === 0) return '';

    return `
        <div class="item-details">
            <h2 class="item-details-title">${t('itemDetail.details.title', '详细信息')}</h2>
            <div class="item-details-grid">
                ${fields.map(field => `
                    <div class="item-detail-item">
                        <span class="item-detail-label">${field.label}</span>
                        <span class="item-detail-value">${escapeHtml(field.value)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 渲染卖家信息
function renderSellerInfo(seller, placement = 'sidebar') {
    const cardClass = placement === 'inline' ? 'inline-seller-card' : 'sidebar-card';
    return `
        <div class="${cardClass}">
            <h3 class="sidebar-card-title">${t('itemDetail.seller.title', '卖家信息')}</h3>
            <div class="seller-info">
                <div class="seller-avatar">
                    ${seller.name ? seller.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div class="seller-details">
                    <div class="seller-name">${escapeHtml(seller.name || t('itemDetail.seller.anonymous', '匿名用户'))}</div>
                    <div class="seller-rating">
                        <span>⭐</span>
                        <span>${seller.averageRating || 0} ${formatMessage('itemDetail.seller.ratings', '({count} 评价)', { count: seller.ratingCount || 0 })}</span>
                    </div>
                </div>
            </div>
            ${seller.verified ? `
                <div style="margin-top: 12px;">
                    <span class="badge badge-verified">✓ ${t('itemDetail.seller.verified', '已验证')}</span>
                </div>
            ` : ''}
        </div>
    `;
}

// 切换主图
function changeMainImage(imageUrl) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
    
    // 更新缩略图选中状态
    document.querySelectorAll('.item-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === imageUrl) {
            thumb.classList.add('active');
        }
    });
}

// 联系卖家
function contactSeller(sellerId) {
    if (!sellerId) {
        alert(t('itemDetail.alert.sellerUnavailable', '卖家信息不可用'));
        return;
    }
    // TODO: 实现联系卖家功能
    alert(t('itemDetail.alert.contactInDevelopment', '联系卖家功能开发中...'));
}

// 编辑物品
function editItem(itemId) {
    // TODO: 实现编辑功能
    alert(t('itemDetail.alert.editInDevelopment', '编辑功能开发中...'));
}

// 删除物品
async function deleteItem(itemId) {
    if (!confirm(t('itemDetail.confirm.delete', '确定要删除这个物品吗？此操作不可恢复。'))) {
        return;
    }

    try {
        await ItemAPI.deleteItem(itemId);
        alert(t('itemDetail.alert.deleted', '物品已删除'));
        window.location.href = 'items.html';
    } catch (error) {
        console.error('删除物品失败:', error);
        alert(t('itemDetail.alert.deleteFailed', '删除失败：') + (error.message || t('itemDetail.error.retry', '请稍后重试')));
    }
}

// 工具函数
function getStatusText(status) {
    const map = {
        AVAILABLE: t('itemDetail.status.available', '可售'),
        RESERVED: t('itemDetail.status.reserved', '已预定（待取货）'),
        SOLD: t('itemDetail.status.sold', '已售出')
    };
    return map[status] || status || t('itemDetail.status.available', '可售');
}

function getConditionInfo(condition) {
    const map = {
        'NEW': { text: t('itemDetail.condition.new', '全新'), class: 'condition-new' },
        'LIKE_NEW': { text: t('itemDetail.condition.likeNew', '几乎全新'), class: 'condition-like-new' },
        'GOOD': { text: t('itemDetail.condition.good', '良好'), class: 'condition-good' },
        'FAIR': { text: t('itemDetail.condition.fair', '一般'), class: 'condition-fair' },
        'POOR': { text: t('itemDetail.condition.poor', '较差'), class: 'condition-poor' },
    };
    return map[condition] || { text: condition, class: '' };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        return user.id || null;
    } catch {
        return null;
    }
}

// 关注/取消关注（本地存储）
function toggleWatch(itemId) {
    const key = 'watchlist';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.indexOf(itemId);
    if (idx >= 0) {
        list.splice(idx, 1);
        alert(t('itemDetail.alert.unwatched', '已取消关注'));
    } else {
        list.push(itemId);
        alert(t('itemDetail.alert.watched', '已加入关注列表'));
    }
    localStorage.setItem(key, JSON.stringify(list));
}

// 卖家更新状态（调用API）
async function updateStatus(itemId, status) {
    try {
        await getItemAPI().updateItemStatus(itemId, status);
        document.getElementById('statusText').textContent = getStatusText(status);
        alert(t('itemDetail.alert.statusUpdated', '状态已更新为：') + getStatusText(status));
    } catch (e) {
        alert(t('itemDetail.alert.updateFailed', '更新失败：') + (e.message || t('itemDetail.error.retry', '请稍后再试')));
    }
}

// 加载评价
async function loadReviews(itemId) {
    try {
        const resp = await getItemAPI().getReviews(itemId);
        const reviews = resp.reviews || [];
        const box = document.getElementById('reviewsContainer');
        if (!box) return;
        if (reviews.length === 0) {
            box.innerHTML = `<div style="color:var(--text-secondary);font-size:14px;">${t('itemDetail.reviews.empty', '暂无评价')}</div>`;
            return;
        }
        box.innerHTML = reviews.map(r => `
            <div style="border:1px solid var(--border-color);border-radius:8px;padding:10px;">
                <div style="font-size:14px;margin-bottom:4px;">${t('itemDetail.reviews.ratingLabel', '评分：')}${'⭐'.repeat(r.rating)} (${r.rating})</div>
                <div style="font-size:14px;color:var(--text-primary);white-space:pre-wrap;">${escapeHtml(r.comment || '')}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:6px;">${new Date(r.createdAt).toLocaleString('zh-CN')}</div>
            </div>
        `).join('');
    } catch (e) {
        // 忽略
    }
}

// 提交评价
async function submitReview(itemId) {
    const rating = Number(document.getElementById('reviewRating').value || 5);
    const comment = (document.getElementById('reviewComment').value || '').trim();
    try {
        await getItemAPI().addReview(itemId, { rating, comment });
        alert(t('itemDetail.alert.reviewSubmitted', '评价提交成功！'));
        document.getElementById('reviewComment').value = '';
        loadReviews(itemId);
    } catch (e) {
        alert(t('itemDetail.alert.reviewFailed', '提交失败：') + (e.message || t('itemDetail.error.retry', '请稍后再试')));
    }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    loadItemDetail();
});

