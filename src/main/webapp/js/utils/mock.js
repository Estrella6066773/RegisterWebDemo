/**
 * ============================================
 * 前端模拟数据与接口 - Mock API
 * 仅用于没有后端时的本地开发
 * ============================================
 */

(function () {
    if (window.__MOCK_INSTALLED__) return;
    window.__MOCK_INSTALLED__ = true;

    // 生成一些占位图片
    const pic = (i) => `https://picsum.photos/seed/sgw${i}/800/600`;

    const now = Date.now();
    const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

    const defaultSeller = { id: 'u100', name: '张三', verified: true, averageRating: 4.6, ratingCount: 12 };
    const mockItems = [
        { id: '1001', title: '计算机网络 第七版 教材', price: 38, condition: 'GOOD', images: [pic(1)], viewCount: 123, postDate: daysAgo(1), category: 'TEXTBOOK', status: 'AVAILABLE', seller: defaultSeller },
        { id: '1002', title: 'iPad 2018 32G 学习平板', price: 850, condition: 'LIKE_NEW', images: [pic(2)], viewCount: 256, postDate: daysAgo(2), category: 'ELECTRONICS', status: 'AVAILABLE', seller: defaultSeller },
        { id: '1003', title: '宿舍学习椅（可折叠）', price: 60, condition: 'GOOD', images: [pic(3)], viewCount: 77, postDate: daysAgo(5), category: 'FURNITURE', status: 'RESERVED', seller: defaultSeller },
        { id: '1004', title: '羽毛球拍套装', price: 120, condition: 'LIKE_NEW', images: [pic(4)], viewCount: 45, postDate: daysAgo(7), category: 'SPORTS', status: 'AVAILABLE', seller: defaultSeller },
        { id: '1005', title: '数据结构与算法 PDF 打印本', price: 25, condition: 'FAIR', images: [pic(5)], viewCount: 66, postDate: daysAgo(10), category: 'TEXTBOOK', status: 'AVAILABLE', seller: defaultSeller },
        { id: '1006', title: '蓝牙耳机（降噪版）', price: 199, condition: 'GOOD', images: [pic(6)], viewCount: 310, postDate: daysAgo(3), category: 'ELECTRONICS', status: 'AVAILABLE', seller: defaultSeller },
        { id: '1007', title: '简约衣架 20个装', price: 15, condition: 'GOOD', images: [pic(7)], viewCount: 18, postDate: daysAgo(4), category: 'APPAREL', status: 'AVAILABLE', seller: defaultSeller },
        { id: '1008', title: '显示器 24寸 1080P', price: 320, condition: 'GOOD', images: [pic(8)], viewCount: 140, postDate: daysAgo(6), category: 'ELECTRONICS', status: 'AVAILABLE', seller: defaultSeller },
        { id: '1009', title: 'C语言程序设计 实验指导', price: 12, condition: 'POOR', images: [pic(9)], viewCount: 9, postDate: daysAgo(12), category: 'TEXTBOOK', status: 'SOLD', seller: defaultSeller },
        { id: '1010', title: '篮球（室内外通用）', price: 48, condition: 'GOOD', images: [pic(10)], viewCount: 52, postDate: daysAgo(8), category: 'SPORTS', status: 'AVAILABLE', seller: defaultSeller },
    ];

    // 工具：过滤与分页
    function applySearch(list, params = {}) {
        let result = list.slice();
        const { keyword, category, minPrice, maxPrice, condition, sortBy } = params;

        if (keyword) {
            const kw = keyword.toLowerCase();
            result = result.filter(i => i.title.toLowerCase().includes(kw));
        }
        if (category) {
            const cats = String(category).split(',');
            result = result.filter(i => cats.includes(i.category));
        }
        if (condition) {
            const conds = String(condition).split(',');
            result = result.filter(i => conds.includes(i.condition));
        }
        const min = Number(minPrice);
        if (!Number.isNaN(min) && min !== 0 && minPrice !== '') {
            result = result.filter(i => i.price >= min);
        }
        const max = Number(maxPrice);
        if (!Number.isNaN(max) && max !== 0 && maxPrice !== '') {
            result = result.filter(i => i.price <= max);
        }

        // 排序
        switch (sortBy) {
            case 'price_asc':
                result.sort((a, b) => a.price - b.price); break;
            case 'price_desc':
                result.sort((a, b) => b.price - a.price); break;
            case 'views':
                result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)); break;
            default: // newest
                result.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        }

        return result;
    }

    // 提供 MockItemAPI，不覆盖真实 ItemAPI（避免 const 覆盖失败）
    window.MockItemAPI = {
        async searchItems(params = {}) {
            const page = Number(params.page || 1);
            const pageSize = Number(params.pageSize || 12);
            const filtered = applySearch(mockItems, params);
            const start = (page - 1) * pageSize;
            const items = filtered.slice(start, start + pageSize);
            return Promise.resolve({ total: filtered.length, items });
        },
        async getItems(params = {}) {
            return this.searchItems(params);
        },
        async getFeaturedItems(limit = 8) {
            const items = applySearch(mockItems, { sortBy: 'views' }).slice(0, limit);
            return Promise.resolve({ items });
        },
        async getItemDetail(id) {
            const it = mockItems.find(x => String(x.id) === String(id));
            if (!it) throw new Error('Not Found');
            return Promise.resolve({ item: it });
        },
        async incrementViewCount(id) {
            const it = mockItems.find(x => String(x.id) === String(id));
            if (it) it.viewCount = (it.viewCount || 0) + 1;
            return Promise.resolve({ ok: true });
        },
        async updateItemStatus(id, status) {
            const it = mockItems.find(x => String(x.id) === String(id));
            if (!it) throw new Error('Not Found');
            it.status = status;
            return Promise.resolve({ ok: true });
        },
        async getReviews(itemId) {
            const key = `mock_reviews_${itemId}`;
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            return Promise.resolve({ reviews: arr });
        },
        async addReview(itemId, { rating, comment }) {
            const key = `mock_reviews_${itemId}`;
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            const r = { rating: Math.max(1, Math.min(5, Number(rating) || 5)), comment: String(comment || '').slice(0, 1000), createdAt: new Date().toISOString() };
            if (arr.length >= 1) {
                throw new Error('您已评价过该宝贝（模拟限制）');
            }
            arr.push(r);
            localStorage.setItem(key, JSON.stringify(arr));
            return Promise.resolve({ ok: true });
        },
    };
})();


