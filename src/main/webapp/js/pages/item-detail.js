/**
 * ============================================
 * 物品详情页面逻辑 - Item Detail Page Logic
 * ============================================
 */

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
                <p>❌ 物品ID无效</p>
                <a href="items.html" class="btn btn-primary" style="margin-top: 16px;">返回浏览</a>
            </div>
        `;
        return;
    }

    try {
        // 获取物品详情
        const response = await getItemAPI().getItemDetail(itemId);
        const item = response.item || response.data || response;

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
                <p>❌ 加载失败：${error.message || '请稍后重试'}</p>
                <a href="items.html" class="btn btn-primary" style="margin-top: 16px;">返回浏览</a>
            </div>
        `;
    }
}

// 渲染物品详情
function renderItemDetail(item) {
    const container = document.getElementById('itemDetailContainer');
    
    // 获取类别名称
    const categoryNames = {
        'TEXTBOOK': '📚 教材',
        'ELECTRONICS': '💻 电子产品',
        'FURNITURE': '🪑 家具',
        'APPAREL': '👕 服装',
        'SPORTS': '⚽ 体育器材',
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
                <div class="item-main-image" style="display: flex; align-items: center; justify-content: center; color: var(--text-disabled); font-size: 48px;">
                    📦
                </div>
            `}
            ${thumbnails.length > 0 ? `
                <div class="item-thumbnails">
                    ${thumbnails.map((img, index) => `
                        <img src="${img}" alt="缩略图 ${index + 2}" class="item-thumbnail" onclick="changeMainImage('${img}')">
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    // 渲染详细信息
    const detailsHtml = renderItemDetails(item);

    // 渲染卖家信息
    const sellerHtml = item.seller ? renderSellerInfo(item.seller) : '';

    container.innerHTML = `
        <div class="item-detail-container">
            <div class="item-detail-main">
                ${imagesHtml}
                
                <div class="item-header">
                    <h1 class="item-title">${escapeHtml(item.title)}</h1>
                    <div class="item-meta-info">
                        <div class="item-meta-item">
                            <span>📂</span>
                            <span>${categoryNames[item.category] || item.category}</span>
                        </div>
                        <div class="item-meta-item">
                            <span>👁️</span>
                            <span>${item.viewCount || 0} 次浏览</span>
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
                    <h2 class="item-description-title">物品描述</h2>
                    <div class="item-description-content">${escapeHtml(item.description || '暂无描述')}</div>
                </div>

                ${detailsHtml}
            </div>

            <div class="item-detail-sidebar">
                ${sellerHtml}
                
                <div class="sidebar-card">
                    <h3 class="sidebar-card-title">操作</h3>
                    <div class="item-actions">
                        ${isAuthenticated() ? `
                            <button class="btn btn-primary btn-contact" onclick="contactSeller('${item.seller?.id || ''}')">
                                💬 联系卖家
                            </button>
                            ${item.seller?.id === getCurrentUserId() ? `
                                <div style="display:flex;flex-direction:column;gap:8px;">
                                    <div style="font-size:14px;color:var(--text-secondary);">当前状态：<b id="statusText">${getStatusText(item.status)}</b></div>
                                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                        <button class="btn btn-secondary" onclick="updateStatus('${item.id}','RESERVED')">标记为已预定</button>
                                        <button class="btn btn-secondary" onclick="updateStatus('${item.id}','AVAILABLE')">标记为可售</button>
                                        <button class="btn btn-secondary" onclick="updateStatus('${item.id}','SOLD')">标记为已售出</button>
                                    </div>
                                </div>
                            ` : `
                                <button class="btn btn-secondary" onclick="toggleWatch('${item.id}')">
                                    ⭐ 加入/取消关注
                                </button>
                            `}
                        ` : `
                            <a href="login.html" class="btn btn-primary btn-contact">
                                🔐 登录后联系卖家
                            </a>
                        `}
                        <a href="items.html" class="btn btn-secondary">
                            ← 返回浏览
                        </a>
                    </div>
                </div>

                <div class="sidebar-card">
                    <h3 class="sidebar-card-title">买家评价</h3>
                    <div id="reviewsContainer" style="display:flex;flex-direction:column;gap:12px;"></div>
                    ${item.status === 'SOLD' && item.seller?.id !== getCurrentUserId() && isAuthenticated() ? `
                        <div style="margin-top:12px;">
                            <div style="font-size:14px;color:var(--text-secondary);margin-bottom:6px;">我已购买，发表评价</div>
                            <div style="display:flex;flex-direction:column;gap:8px;">
                                <select id="reviewRating" class="form-control" style="max-width:180px;">
                                    <option value="5">5 - 非常满意</option>
                                    <option value="4">4 - 满意</option>
                                    <option value="3">3 - 一般</option>
                                    <option value="2">2 - 不太满意</option>
                                    <option value="1">1 - 很不满意</option>
                                </select>
                                <textarea id="reviewComment" rows="3" class="form-control" maxlength="1000" placeholder="写点评价（最多1000字）"></textarea>
                                <button class="btn btn-primary" onclick="submitReview('${item.id}')">提交评价</button>
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
        if (item.isbn) fields.push({ label: 'ISBN', value: item.isbn });
        if (item.courseCode) fields.push({ label: '课程代码', value: item.courseCode });
        if (item.moduleName) fields.push({ label: '模块名称', value: item.moduleName });
        if (item.edition) fields.push({ label: '版次', value: item.edition });
        if (item.author) fields.push({ label: '作者', value: item.author });
    } else if (category === 'ELECTRONICS') {
        if (item.brand) fields.push({ label: '品牌', value: item.brand });
        if (item.model) fields.push({ label: '型号', value: item.model });
        if (item.warrantyStatus) fields.push({ label: '保修状态', value: item.warrantyStatus });
        if (item.purchaseDate) fields.push({ label: '购买日期', value: item.purchaseDate });
        if (item.accessories) fields.push({ label: '包含配件', value: item.accessories });
    } else if (category === 'FURNITURE') {
        if (item.itemType) fields.push({ label: '物品类型', value: item.itemType });
        if (item.size) fields.push({ label: '尺寸', value: item.size });
        if (item.material) fields.push({ label: '材质', value: item.material });
        if (item.assemblyRequired) fields.push({ label: '组装情况', value: item.assemblyRequired });
        if (item.conditionDetails) fields.push({ label: '状况详情', value: item.conditionDetails });
    } else if (category === 'APPAREL') {
        if (item.size) fields.push({ label: '尺码', value: item.size });
        if (item.brand) fields.push({ label: '品牌', value: item.brand });
        if (item.material) fields.push({ label: '材质', value: item.material });
        if (item.color) fields.push({ label: '颜色', value: item.color });
        if (item.gender) fields.push({ label: '性别', value: item.gender });
    } else if (category === 'SPORTS') {
        if (item.brand) fields.push({ label: '品牌', value: item.brand });
        if (item.size) fields.push({ label: '尺寸', value: item.size });
        if (item.sportType) fields.push({ label: '运动类型', value: item.sportType });
        if (item.conditionDetails) fields.push({ label: '状况详情', value: item.conditionDetails });
    }

    if (fields.length === 0) return '';

    return `
        <div class="item-details">
            <h2 class="item-details-title">详细信息</h2>
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
function renderSellerInfo(seller) {
    return `
        <div class="sidebar-card">
            <h3 class="sidebar-card-title">卖家信息</h3>
            <div class="seller-info">
                <div class="seller-avatar">
                    ${seller.name ? seller.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div class="seller-details">
                    <div class="seller-name">${escapeHtml(seller.name || '匿名用户')}</div>
                    <div class="seller-rating">
                        <span>⭐</span>
                        <span>${seller.averageRating || 0} (${seller.ratingCount || 0} 评价)</span>
                    </div>
                </div>
            </div>
            ${seller.verified ? `
                <div style="margin-top: 12px;">
                    <span class="badge badge-verified">✓ 已验证</span>
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
        alert('卖家信息不可用');
        return;
    }
    // TODO: 实现联系卖家功能
    alert('联系卖家功能开发中...');
}

// 编辑物品
function editItem(itemId) {
    // TODO: 实现编辑功能
    alert('编辑功能开发中...');
}

// 删除物品
async function deleteItem(itemId) {
    if (!confirm('确定要删除这个物品吗？此操作不可恢复。')) {
        return;
    }

    try {
        await ItemAPI.deleteItem(itemId);
        alert('物品已删除');
        window.location.href = 'items.html';
    } catch (error) {
        console.error('删除物品失败:', error);
        alert('删除失败：' + (error.message || '请稍后重试'));
    }
}

// 工具函数
function getStatusText(status) {
    const map = { AVAILABLE: '可售', RESERVED: '已预定（待取货）', SOLD: '已售出' };
    return map[status] || status || '可售';
}

function getConditionInfo(condition) {
    const map = {
        'NEW': { text: '全新', class: 'condition-new' },
        'LIKE_NEW': { text: '几乎全新', class: 'condition-like-new' },
        'GOOD': { text: '良好', class: 'condition-good' },
        'FAIR': { text: '一般', class: 'condition-fair' },
        'POOR': { text: '较差', class: 'condition-poor' },
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
        alert('已取消关注');
    } else {
        list.push(itemId);
        alert('已加入关注列表');
    }
    localStorage.setItem(key, JSON.stringify(list));
}

// 卖家更新状态（调用API）
async function updateStatus(itemId, status) {
    try {
        await getItemAPI().updateItemStatus(itemId, status);
        document.getElementById('statusText').textContent = getStatusText(status);
        alert('状态已更新为：' + getStatusText(status));
    } catch (e) {
        alert('更新失败：' + (e.message || '请稍后再试'));
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
            box.innerHTML = '<div style="color:var(--text-secondary);font-size:14px;">暂无评价</div>';
            return;
        }
        box.innerHTML = reviews.map(r => `
            <div style="border:1px solid var(--border-color);border-radius:8px;padding:10px;">
                <div style="font-size:14px;margin-bottom:4px;">评分：${'⭐'.repeat(r.rating)} (${r.rating})</div>
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
        alert('评价提交成功！');
        document.getElementById('reviewComment').value = '';
        loadReviews(itemId);
    } catch (e) {
        alert('提交失败：' + (e.message || '请稍后再试'));
    }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    loadItemDetail();
});

