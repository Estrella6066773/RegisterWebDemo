# 数据库架构说明

## SQLite 数据库结构

数据库文件位置：`back-end/db/student_bay.db`

## 表结构

### 1. users 表（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PRIMARY KEY | 用户唯一ID（UUID） |
| email | TEXT UNIQUE NOT NULL | 邮箱地址 |
| password_hash | TEXT NOT NULL | 密码哈希值（bcrypt） |
| name | TEXT | 姓名 |
| member_type | TEXT NOT NULL | 会员类型：GENERAL/STUDENT/ASSOCIATE |
| verified | INTEGER DEFAULT 0 | 是否已验证（0/1） |
| verification_token | TEXT | 验证令牌 |
| verification_token_expires | INTEGER | 验证令牌过期时间 |
| avatar | TEXT | 头像URL |
| bio | TEXT | 个人简介 |
| university | TEXT | 大学名称 |
| enrollment_year | INTEGER | 入学年份 |
| student_id | TEXT | 学生ID |
| join_date | INTEGER NOT NULL | 加入日期（时间戳） |
| created_at | INTEGER NOT NULL | 创建时间（时间戳） |
| updated_at | INTEGER NOT NULL | 更新时间（时间戳） |

### 2. items 表（物品表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PRIMARY KEY | 物品唯一ID（UUID） |
| seller_id | TEXT NOT NULL | 卖家ID（外键） |
| title | TEXT NOT NULL | 物品标题 |
| description | TEXT | 物品描述 |
| category | TEXT NOT NULL | 类别：TEXTBOOK/ELECTRONICS/FURNITURE/APPAREL/SPORTS |
| price | REAL NOT NULL | 价格 |
| condition | TEXT NOT NULL | 状况：NEW/LIKE_NEW/GOOD/FAIR/POOR |
| status | TEXT NOT NULL | 状态：AVAILABLE/RESERVED/SOLD |
| view_count | INTEGER DEFAULT 0 | 浏览量 |
| images | TEXT | 图片URL数组（JSON格式） |
| post_date | INTEGER NOT NULL | 发布时间（时间戳） |
| created_at | INTEGER NOT NULL | 创建时间（时间戳） |
| updated_at | INTEGER NOT NULL | 更新时间（时间戳） |

#### 类别特定字段

**教材（TEXTBOOK）:**
- isbn, course_code, module_name, edition, author

**电子产品（ELECTRONICS）:**
- brand, model_number, warranty_status, original_purchase_date, accessories_included

**家具（FURNITURE）:**
- item_type, dimensions, material, assembly_required, condition_details

**服装（APPAREL）:**
- size, clothing_brand, material_type, color, gender

**体育器材（SPORTS）:**
- sports_brand, size_dimensions, sport_type, sports_condition_details

### 3. ratings 表（评分表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PRIMARY KEY | 评分唯一ID（UUID） |
| rated_user_id | TEXT NOT NULL | 被评分用户ID（外键） |
| rater_user_id | TEXT NOT NULL | 评分用户ID（外键） |
| item_id | TEXT | 相关物品ID（外键，可选） |
| rating | INTEGER NOT NULL | 评分（1-5） |
| comment | TEXT | 评论 |
| created_at | INTEGER NOT NULL | 创建时间（时间戳） |

### 4. watchlists 表（关注列表表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PRIMARY KEY | 关注记录唯一ID（UUID） |
| user_id | TEXT NOT NULL | 用户ID（外键） |
| item_id | TEXT NOT NULL | 物品ID（外键） |
| created_at | INTEGER NOT NULL | 创建时间（时间戳） |
| UNIQUE(user_id, item_id) | | 用户和物品唯一约束 |

### 5. item_status_history 表（物品状态变更记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PRIMARY KEY | 记录唯一ID（UUID） |
| item_id | TEXT NOT NULL | 物品ID（外键） |
| old_status | TEXT | 旧状态 |
| new_status | TEXT NOT NULL | 新状态 |
| buyer_id | TEXT | 买家ID（外键，可选） |
| buyer_name | TEXT | 买家姓名（非系统用户） |
| changed_by | TEXT NOT NULL | 变更操作者ID（外键） |
| created_at | INTEGER NOT NULL | 创建时间（时间戳） |

## 外键关系

- items.seller_id → users.id
- ratings.rated_user_id → users.id
- ratings.rater_user_id → users.id
- ratings.item_id → items.id
- watchlists.user_id → users.id
- watchlists.item_id → items.id
- item_status_history.item_id → items.id
- item_status_history.buyer_id → users.id
- item_status_history.changed_by → users.id

## 索引建议

为了提高查询性能，建议添加以下索引：

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_seller ON items(seller_id);
CREATE INDEX idx_ratings_rated_user ON ratings(rated_user_id);
CREATE INDEX idx_watchlists_user ON watchlists(user_id);
```

## 数据库初始化

数据库表会在服务器启动时自动创建（如果不存在）。

可以通过 `initDatabase()` 函数手动初始化。

