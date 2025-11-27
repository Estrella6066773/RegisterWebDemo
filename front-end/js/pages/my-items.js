
function getItemAPI() {
    if (window.MockItemAPI) return window.MockItemAPI;
    if (window.ItemAPI) return window.ItemAPI;
    // 如果 ItemAPI 未加载，抛出错误而不是返回空对象
    throw new Error('ItemAPI 未加载，请检查脚本加载顺序');
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

    // 检查 ItemAPI 是否已加载
    if (!window.ItemAPI && !window.MockItemAPI) {
        console.error('ItemAPI 未加载');
        const list = document.getElementById('myItemsList');
        const t = (key, fallback = '') => window.I18n ? window.I18n.t(key, fallback) : fallback;
        list.innerHTML = `<div class="items-empty" style="grid-column: 1 / -1;"><div class="items-empty-icon">⚠️</div><p>${t('myItems.error.loadFailed', '加载失败')}</p><p style="font-size:14px;color:var(--text-secondary);">API 模块未正确加载，请刷新页面重试</p></div>`;
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
            const api = getItemAPI();
            const resp = await api.getMyItems();
            
            // 处理不同的响应格式
            let items = [];
            if (resp && resp.data) {
                items = Array.isArray(resp.data) ? resp.data : [];
            } else if (resp && resp.items) {
                items = Array.isArray(resp.items) ? resp.items : [];
            } else if (Array.isArray(resp)) {
                items = resp;
            }
            
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
            console.error('加载我的宝贝失败:', e);
            
            // 处理不同类型的错误
            let errorMsg = '未知错误';
            if (e.type === 'AUTH_ERROR') {
                errorMsg = '登录已过期，请重新登录';
                // 清除认证信息并跳转到登录页
                setTimeout(() => {
                    if (typeof clearAuth === 'function') {
                        clearAuth();
                    }
                    window.location.href = 'login.html';
                }, 2000);
            } else if (e.type === 'NETWORK_ERROR') {
                errorMsg = '网络连接失败，请检查网络或服务器是否运行';
            } else if (e.message) {
                errorMsg = e.message;
            } else if (e.type) {
                errorMsg = e.type;
            }
            
            list.innerHTML = `
                <div class="items-empty" style="grid-column: 1 / -1;">
                    <div class="items-empty-icon">⚠️</div>
                    <p>${t('myItems.error.loadFailed', '加载失败')}</p>
                    <p style="font-size:14px;color:var(--text-secondary);">${errorMsg}</p>
                    <button class="btn btn-primary" onclick="location.reload()" style="margin-top:12px;">${t('common.actions.refresh', '刷新页面')}</button>
                </div>`;
        }
    }

    function renderCard(it) {
        // 处理图片URL
        let img = 'https://picsum.photos/seed/fallback/800/600';
        
        // 获取图片数组
        let images = null;
        if (it.images && Array.isArray(it.images)) {
            images = it.images;
        } else if (it.images && typeof it.images === 'string') {
            try {
                const parsed = JSON.parse(it.images);
                if (Array.isArray(parsed)) {
                    images = parsed;
                }
            } catch (e) {
                // 解析失败，使用默认图片
            }
        }
        
        // 使用第一张图片
        if (images && images.length > 0 && images[0]) {
            img = images[0];
            // 处理相对路径：如果不是完整URL，确保以/开头
            if (img && !img.startsWith('http://') && !img.startsWith('https://')) {
                if (!img.startsWith('/')) {
                    img = '/' + img;
                }
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
                    <div style="display:flex;flex-direction:column;gap:4px;margin-top:8px;">
                        <div style="display:flex;gap:4px;">
                            <button class="btn btn-secondary" data-edit="${it.id}" style="flex:1;">${t('myItems.actions.edit', '编辑')}</button>
                            <button class="btn btn-danger" data-del="${it.id}" style="flex:1;">${t('myItems.actions.delete', '删除')}</button>
                        </div>
                        <div style="display:flex;gap:4px;">
                            <button class="btn btn-secondary" data-status="RESERVED" data-id="${it.id}" style="flex:1;">${t('myItems.actions.markReserved', '标记预定')}</button>
                            <button class="btn btn-secondary" data-status="AVAILABLE" data-id="${it.id}" style="flex:1;">${t('myItems.actions.markAvailable', '标记可售')}</button>
                            <button class="btn btn-secondary" data-status="SOLD" data-id="${it.id}" style="flex:1;">${t('myItems.actions.markSold', '标记已售')}</button>
                        </div>
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
        const title = document.getElementById('f_title').value.trim();
        const price = Number(document.getElementById('f_price').value || 0);
        
        // 验证必填字段
        if (!title) {
            alert(t('myItems.alert.titleRequired', '请输入标题'));
            return;
        }
        if (price <= 0) {
            alert(t('myItems.alert.priceRequired', '请输入有效的价格'));
            return;
        }
        
        const data = {
            title: title,
            price: price,
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
            console.error('保存失败:', e);
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
                // 后端返回格式: { success: true, data: {...} }
                const it = res.data || res.item || res;
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
            const itemTitle = e.target.closest('.item-card').querySelector('.item-title').textContent;
            if (confirm(t('myItems.confirm.delete', `确定要删除"${itemTitle}"吗？此操作不可撤销。`))) {
                try {
                    await getItemAPI().deleteItem(delId);
                    load();
                } catch (err) {
                    console.error('删除失败:', err);
                    alert(t('myItems.alert.deleteFailed', '删除失败：') + (err.message || t('myItems.alert.retry', '请稍后再试')));
                }
            }
        } else if (status && idForStatus) {
            try {
                await getItemAPI().updateItemStatus(idForStatus, status);
                load();
            } catch (err) {
                console.error('更新状态失败:', err);
                alert(t('myItems.alert.statusFailed', '更新状态失败：') + (err.message || t('myItems.alert.retry', '请稍后再试')));
            }
        }
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    load();
});


