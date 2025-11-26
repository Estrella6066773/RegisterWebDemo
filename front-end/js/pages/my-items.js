/**
 * 我的宝贝 - 管理页（基于mock）
 */

function getItemAPI() {
    if (window.MockItemAPI) return window.MockItemAPI;
    if (window.ItemAPI) return window.ItemAPI;
    return {
        async getMyItems() { return { items: [] }; },
        async createItem() { return { item: null }; },
        async updateItem() { return { item: null }; },
        async deleteItem() { return { ok: true }; },
        async updateItemStatus() { return { ok: true }; },
        async getItemDetail() { return { data: null }; },
    };
}

let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    if (!isAuthenticated()) {
        const t = (key, fallback) => window.I18n ? window.I18n.t(key, fallback) : fallback;
        alert(t('myItems.alert.loginRequired', '请先登录后再查看我的物品'));
        window.location.href = 'login.html';
        return;
    }

    const list = document.getElementById('myItemsList');
    const modal = document.getElementById('editorModal');

    function t(key, fallback = '') {
        return window.I18n ? window.I18n.t(key, fallback) : fallback;
    }

    async function load() {
        list.innerHTML = `<div class="items-loading" style="text-align:center;padding:40px;color:var(--text-secondary);"><p>${t('myItems.loading', '正在加载您的宝贝...')}</p></div>`;
        try {
            const resp = await getItemAPI().getMyItems();
            const items = resp.data || resp.items || [];
            if (items.length === 0) {
                list.innerHTML = `
                    <div class="items-empty" style="grid-column: 1 / -1;">
                        <div class="items-empty-icon">📦</div>
                        <p>${t('myItems.empty.title', '还没有发布宝贝')}</p>
                        <p style="font-size:14px;color:var(--text-secondary);">${t('myItems.empty.hint', '点击右上角"发布宝贝"试试')}</p>
                    </div>`;
                return;
            }
            list.innerHTML = items.map(renderCard).join('');
        } catch (e) {
            list.innerHTML = `<div class="items-empty" style="grid-column: 1 / -1;"><div class="items-empty-icon">⚠️</div><p>${t('myItems.error.loadFailed', '加载失败')}</p></div>`;
        }
    }

    function renderCard(it) {
        // 处理图片URL - 如果是相对路径，确保以/开头
        let img = 'https://picsum.photos/seed/fallback/800/600';
        if (it.images && Array.isArray(it.images) && it.images.length > 0) {
            img = it.images[0];
            // 如果是相对路径且不是以/开头，添加/
            if (img && !img.startsWith('http') && !img.startsWith('/')) {
                img = '/' + img;
            }
        } else if (it.images && typeof it.images === 'string') {
            // 处理字符串格式的图片
            try {
                const parsed = JSON.parse(it.images);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    img = parsed[0];
                    if (img && !img.startsWith('http') && !img.startsWith('/')) {
                        img = '/' + img;
                    }
                }
            } catch (e) {
                // 解析失败，使用默认图片
            }
        }
        const status = it.status || 'AVAILABLE';
        const statusMap = {
            AVAILABLE: t('myItems.status.available', '可售'),
            RESERVED: t('myItems.status.reserved', '已预定'),
            SOLD: t('myItems.status.sold', '已售出')
        };
        const statusText = statusMap[status] || status;
        return `
            <div class="item-card" style="position:relative;">
                <a href="item-detail.html?id=${it.id}" style="text-decoration:none;color:inherit;">
                    <div class="item-image-container"><img class="item-image" src="${img}" alt="${escapeHtml(it.title)}"></div>
                </a>
                <div class="item-info">
                    <h3 class="item-title">${escapeHtml(it.title)}</h3>
                    <div class="item-price">¥${it.price || 0}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--text-secondary);">
                        <span>${t('myItems.card.status', '状态：')}${statusText}</span>
                        <span>${t('myItems.card.views', '浏览：')}${it.viewCount || 0}</span>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:8px;">
                        <button class="btn btn-secondary" data-edit="${it.id}">${t('myItems.actions.edit', '编辑')}</button>
                        <button class="btn btn-secondary" data-status="RESERVED" data-id="${it.id}">${t('myItems.actions.markReserved', '标记预定')}</button>
                        <button class="btn btn-secondary" data-status="AVAILABLE" data-id="${it.id}">${t('myItems.actions.markAvailable', '标记可售')}</button>
                        <button class="btn btn-secondary" data-status="SOLD" data-id="${it.id}">${t('myItems.actions.markSold', '标记已售')}</button>
                        <button class="btn btn-secondary" data-del="${it.id}">${t('myItems.actions.delete', '删除')}</button>
                    </div>
                </div>
            </div>`;
    }

    // 新建
    const newBtn = document.getElementById('newBtn');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            editingId = null;
            document.getElementById('editorTitle').textContent = t('myItems.edit.new', '发布宝贝');
            document.getElementById('f_title').value = '';
            document.getElementById('f_price').value = '';
            document.getElementById('f_category').value = 'TEXTBOOK';
            document.getElementById('f_condition').value = 'GOOD';
            document.getElementById('f_desc').value = '';
            modal.classList.remove('hidden');
        });
    }

    // 保存
    document.getElementById('saveEdit').addEventListener('click', async () => {
        const data = {
            title: document.getElementById('f_title').value.trim(),
            price: Number(document.getElementById('f_price').value || 0),
            category: document.getElementById('f_category').value,
            condition: document.getElementById('f_condition').value,
            description: document.getElementById('f_desc').value.trim(),
        };
        try {
            if (editingId) {
                await getItemAPI().updateItem(editingId, data);
            } else {
                await getItemAPI().createItem(data);
            }
            modal.classList.add('hidden');
            load();
        } catch (e) {
            alert(t('myItems.alert.saveFailed', '保存失败：') + (e.message || t('myItems.alert.retry', '请稍后重试')));
        }
    });

    // 取消
    document.getElementById('cancelEdit').addEventListener('click', () => modal.classList.add('hidden'));

    // 列表事件代理
    document.getElementById('myItemsList').addEventListener('click', async (e) => {
        const editId = e.target.getAttribute('data-edit');
        const delId = e.target.getAttribute('data-del');
        const status = e.target.getAttribute('data-status');
        const idForStatus = e.target.getAttribute('data-id');
        if (editId) {
            // 取详情填充
            try {
                const res = await getItemAPI().getItemDetail(editId);
                const it = res.item || res.data || res;
                if (!it || !it.id) {
                    throw new Error('无法获取物品详情');
                }
                editingId = it.id;
                document.getElementById('editorTitle').textContent = t('myItems.edit.title', '编辑宝贝');
                document.getElementById('f_title').value = it.title || '';
                document.getElementById('f_price').value = it.price || 0;
                document.getElementById('f_category').value = it.category || 'TEXTBOOK';
                document.getElementById('f_condition').value = it.condition || 'GOOD';
                document.getElementById('f_desc').value = it.description || '';
                modal.classList.remove('hidden');
            } catch (err) {
                console.error('获取物品详情失败:', err);
                alert(t('myItems.alert.loadDetailFailed', '获取物品详情失败：') + (err.message || t('myItems.alert.retry', '请稍后再试')));
            }
        } else if (delId) {
            if (confirm(t('myItems.confirm.delete', '确定删除该宝贝吗？'))) {
                try {
                    await getItemAPI().deleteItem(delId);
                    load();
                } catch (err) {
                    alert(t('myItems.alert.deleteFailed', '删除失败：') + (err.message || t('myItems.alert.retry', '请稍后再试')));
                }
            }
        } else if (status && idForStatus) {
            try {
                await getItemAPI().updateItemStatus(idForStatus, status);
                load();
            } catch (err) {
                alert(t('myItems.alert.statusFailed', '更新状态失败：') + (err.message || t('myItems.alert.retry', '请稍后再试')));
            }
        }
    });

    document.getElementById('refreshBtn').addEventListener('click', load);

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    load();
});


