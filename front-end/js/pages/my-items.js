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
    };
}

let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('myItemsList');
    const modal = document.getElementById('editorModal');

    async function load() {
        list.innerHTML = '<div class="items-loading" style="text-align:center;padding:40px;color:var(--text-secondary);"><p>加载中...</p></div>';
        try {
            const resp = await getItemAPI().getMyItems();
            const items = resp.items || [];
            if (items.length === 0) {
                list.innerHTML = `
                    <div class="items-empty" style="grid-column: 1 / -1;">
                        <div class="items-empty-icon">📦</div>
                        <p>还没有发布宝贝</p>
                        <p style="font-size:14px;color:var(--text-secondary);">点击右上角“发布宝贝”试试</p>
                    </div>`;
                return;
            }
            list.innerHTML = items.map(renderCard).join('');
        } catch (e) {
            list.innerHTML = `<div class="items-empty" style="grid-column: 1 / -1;"><div class="items-empty-icon">⚠️</div><p>加载失败</p></div>`;
        }
    }

    function renderCard(it) {
        const img = (it.images && it.images[0]) || 'https://picsum.photos/seed/fallback/800/600';
        const status = it.status || 'AVAILABLE';
        const statusText = { AVAILABLE: '可售', RESERVED: '已预定', SOLD: '已售出' }[status] || status;
        return `
            <div class="item-card" style="position:relative;">
                <a href="item-detail.html?id=${it.id}" style="text-decoration:none;color:inherit;">
                    <div class="item-image-container"><img class="item-image" src="${img}" alt="${escapeHtml(it.title)}"></div>
                </a>
                <div class="item-info">
                    <h3 class="item-title">${escapeHtml(it.title)}</h3>
                    <div class="item-price">¥${it.price || 0}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--text-secondary);">
                        <span>状态：${statusText}</span>
                        <span>浏览：${it.viewCount || 0}</span>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:8px;">
                        <button class="btn btn-secondary" data-edit="${it.id}">编辑</button>
                        <button class="btn btn-secondary" data-status="RESERVED" data-id="${it.id}">标记预定</button>
                        <button class="btn btn-secondary" data-status="AVAILABLE" data-id="${it.id}">标记可售</button>
                        <button class="btn btn-secondary" data-status="SOLD" data-id="${it.id}">标记已售</button>
                        <button class="btn btn-secondary" data-del="${it.id}">删除</button>
                    </div>
                </div>
            </div>`;
    }

    // 新建
    const newBtn = document.getElementById('newBtn');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            editingId = null;
            document.getElementById('editorTitle').textContent = '发布宝贝';
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
            alert('保存失败：' + (e.message || '请稍后重试'));
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
                editingId = it.id;
                document.getElementById('editorTitle').textContent = '编辑宝贝';
                document.getElementById('f_title').value = it.title || '';
                document.getElementById('f_price').value = it.price || 0;
                document.getElementById('f_category').value = it.category || 'TEXTBOOK';
                document.getElementById('f_condition').value = it.condition || 'GOOD';
                document.getElementById('f_desc').value = it.description || '';
                modal.classList.remove('hidden');
            } catch {}
        } else if (delId) {
            if (confirm('确定删除该宝贝吗？')) {
                try {
                    await getItemAPI().deleteItem(delId);
                    load();
                } catch (err) {
                    alert('删除失败：' + (err.message || '请稍后再试'));
                }
            }
        } else if (status && idForStatus) {
            try {
                await getItemAPI().updateItemStatus(idForStatus, status);
                load();
            } catch (err) {
                alert('更新状态失败：' + (err.message || '请稍后再试'));
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


