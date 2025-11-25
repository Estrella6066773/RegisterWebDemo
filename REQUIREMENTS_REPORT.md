## Student Bay 需求说明

### 1. 项目背景
Student Bay 面向大学校园社区，构建学生与教职员之间的二手物品交易平台，需覆盖注册验证、物品发布、搜索发现、可信交易和通知反馈全流程，以符合《Assessment Brief - Group Project 2025-26》的交付要求。[Assessment Brief](file:///d%3A/OneDrive/MyProjects/RegisterDemo/Assessment%20Brief%20-%20Group%20Project%202025-26.pdf)

### 2. 功能需求
- **FR1 用户档案与验证**
  - 成员划分：Public（仅浏览，无需验证）、Student（.edu 校邮验证，拥有买卖权）与 Affiliated（教职邮箱验证，拥有买卖权）。
  - 资料页需展示验证状态、加入时间、成功交易数、平均评分、资料完整度百分比；支持头像、简介、学校与入学年份等字段，完整度随字段完成情况刷新。
  - 邮件验证流程必须记录令牌及过期时间，完成验证后解锁交易权限。[Assessment Brief](file:///d%3A/OneDrive/MyProjects/RegisterDemo/Assessment%20Brief%202025-26.pdf)
- **FR2 物品发布与展示**
  - 每个 listing 支持最多 5 张图片，并保存标题、描述、价格、状况、浏览次数。
  - 类别特定字段：
    - Textbooks：ISBN、课程代码、模块名、版次、作者。
    - Electronics：品牌、型号、保修状态、原始购买日期、配件。
    - Furniture：物品类型、尺寸、材质、是否需组装、状况详情。
    - Clothing：尺码、品牌、材质、颜色、性别。
    - Sports Equipment：品牌、尺寸/规格、运动类型、状况详情。
  - 列表与详情页需展示缩略图、价格、卖家信任指标、发布时间与浏览量。
- **FR3 搜索与发现**
  - 搜索条件：关键词、分类、价格区间、状况、状态；教材需支持课程代码、模块名、ISBN 精准检索。
  - 支持最新/价格/热度排序与分页，搜索结果卡片显示关键指标。
- **FR4 关注与通知**
  - 用户可收藏物品至 Watchlist；当关注物品降价、状态变化，或出现匹配的新物品时需发送邮件通知。
- **FR5 状态管理与交易闭环**
  - 卖家可将物品标记为 Available、Reserved、Sold；标记 Sold 时需记录买家（系统用户或外部），以决定是否开启评分流程。
  - 系统记录状态变更历史（操作人、时间、买家信息），并在合适节点触发评分。
- **非功能 & 交付要求**
  - 后端：Node.js + Express + SQLite/MongoDB，REST API、JWT、输入校验与密码加密。
  - 前端：HTML/CSS/JS，Express 静态托管。
  - 最终交付含代码、运行 README、5 分钟内 Demo 视频、个人 500 字反思报告。[Assessment Brief](file:///d%3A/OneDrive/MyProjects/RegisterDemo/Assessment%20Brief%202025-26.pdf)

---

## Student Bay 需求符合度报告

### 1. 交付结构
- ✅ 现有仓库具有 `front-end` / `back-end` 目录及根 README，匹配项目结构要求。
- ⚠️ 缺少 Demo 视频与个人 Reflection 文档，需在最终提交包中补齐。[Assessment Brief](file:///d%3A/OneDrive/MyProjects/RegisterDemo/Assessment%20Brief%202025-26.pdf)

### 2. FR1 符合度
- ✅ 已完成学生/教职会员注册、.edu 邮箱校验、JWT 登录、邮箱验证、资料完整度与信任指标展示。
  ```33:118:back-end/routes/users.js
  if (!['STUDENT', 'ASSOCIATE'].includes(memberType)) {
      return res.status(400).json({ message: '无效的会员类型' });
  }
  if ((memberType === 'STUDENT' || memberType === 'ASSOCIATE') && !email.endsWith('.edu')) {
      return res.status(400).json({ message: '学生会员和关联会员需要使用大学邮箱' });
  }
  ```
  ```139:176:front-end/js/pages/profile.js
  const indicators = [
      { icon: profile.verified ? '✓' : '✗', value: profile.verified ? '已验证' : '未验证' },
      { icon: '📅', value: formatDate(profile.joinDate) },
      { icon: '💰', value: profile.successfulTransactions || 0 },
      { icon: '⭐', value: profile.averageRating ? profile.averageRating.toFixed(1) : '0.0' },
  ];
  ```
- ⚠️ 未实现 Public Member（仅浏览）角色，也缺少评分写入 API，平均评分目前无法真实计算。

### 3. FR2 符合度
- ✅ 发布页支持 5 张图和类别字段；后端 `POST /api/items` 保存所有字段；列表/详情展示状态、浏览量、缩略图等信息。
  ```7:43:front-end/js/pages/post-item.js
  const categoryFields = { TEXTBOOK: [...], ELECTRONICS: [...], FURNITURE: [...], APPAREL: [...], SPORTS: [...] };
  ```
  ```282:315:back-end/routes/items.js
  db.run(`INSERT INTO items (... images, view_count, isbn, course_code, ... sports_condition_details, post_date, created_at, updated_at) VALUES (...)`);
  ```
- ⚠️ 需确认各类别字段在详情页有针对性展示，便于评审验证。

### 4. FR3 符合度（作为额外 FR）
- ✅ `GET /api/items/search` 支持关键词、分类、价格、状况、排序、分页；前端 `items.js` 实现筛选 UI 与分页。
  ```17:118:back-end/routes/items.js
  if (keyword) query += ' AND (title LIKE ? OR description LIKE ?)';
  if (category) query += ' AND category = ?';
  if (condition) query += ' AND condition = ?';
  if (minPrice) query += ' AND price >= ?';
  if (maxPrice) query += ' AND price <= ?';
  query += ` ORDER BY ${sortOptions[sortBy] || 'post_date DESC'}`;
  ```
- ⚠️ 教材字段（课程码、ISBN）目前通过关键词模糊匹配，后续可加强独立字段搜索以完全符合案例描述。

### 5. FR4 符合度
- ❌ 虽有 `watchlists` 表，但没有相关 API；前端“关注”仅写入 `localStorage`，无法跨端同步，更无法触发邮件通知。
  ```389:403:front-end/js/pages/item-detail.js
  function toggleWatch(itemId) {
      const list = raw ? JSON.parse(raw) : [];
      if (idx >= 0) list.splice(idx, 1); else list.push(itemId);
      localStorage.setItem(key, JSON.stringify(list));
  }
  ```
- ❌ 降价/状态/匹配通知尚未实现，需要后端任务或第三方邮件服务支撑。

### 6. FR5 符合度
- ✅ 卖家可通过 `PUT /api/items/:id/status` 与前端按钮将物品标记为 Available/Reserved/Sold。
  ```528:589:back-end/routes/items.js
  const validStatuses = ['AVAILABLE', 'RESERVED', 'SOLD', 'DELETED'];
  db.run('UPDATE items SET status = ?, updated_at = ? WHERE id = ?', [status, Date.now(), id], ...);
  ```
  ```60:67:front-end/js/pages/my-items.js
  <button data-status="RESERVED">标记预定</button>
  <button data-status="AVAILABLE">标记可售</button>
  <button data-status="SOLD">标记已售</button>
  ```
- ⚠️ Sold 流程未记录买家信息，也未写入 `item_status_history` 表，评分流程无法触发，需新增 UI + API。

### 7. 非功能/交付
- ✅ 后端：Node.js + Express + SQLite，具备 JWT、bcrypt、字段校验与静态托管。
- ✅ 前端：多页面 HTML/CSS/JS，Express 统一托管。
- ⚠️ 缺少 Demo 视频与个人反思；README 未说明测试账户/录屏位置，可在提交前补充。

### 8. 建议
1. 在 README 中明确已完成的 FR（FR1/FR2/FR3）与待完成项，并说明测试路径。
2. 完善评分 API、Watchlist + 通知、Sold 买家记录等关键差距，以满足 FR4/FR5 与 FR1 信任指标。
3. 准备 Demo 视频、反思报告及测试数据脚本，确保最终交付完整。

