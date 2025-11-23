/**
 * ============================================
 * 数据库连接和初始化模块
 * SQLite 数据库
 * ============================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'student_bay.db');

// 确保数据库目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

/**
 * 获取数据库连接
 */
function getDatabase() {
    if (!db) {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Database connection error:', err);
            } else {
                console.log('✅ Connected to SQLite database');
            }
        });
    }
    return db;
}

/**
 * 初始化数据库表结构
 */
function initDatabase() {
    return new Promise((resolve, reject) => {
        const database = getDatabase();

        // 启用外键约束
        database.run('PRAGMA foreign_keys = ON');

        // 创建用户表
        database.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                member_type TEXT NOT NULL CHECK(member_type IN ('GENERAL', 'STUDENT', 'ASSOCIATE')),
                verified INTEGER DEFAULT 0,
                verification_token TEXT,
                verification_token_expires INTEGER,
                avatar TEXT,
                bio TEXT,
                university TEXT,
                enrollment_year INTEGER,
                student_id TEXT,
                join_date INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
                return reject(err);
            }
            console.log('✅ Users table created');
        });

        // 创建物品表
        database.run(`
            CREATE TABLE IF NOT EXISTS items (
                id TEXT PRIMARY KEY,
                seller_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL CHECK(category IN ('TEXTBOOK', 'ELECTRONICS', 'FURNITURE', 'APPAREL', 'SPORTS')),
                price REAL NOT NULL,
                condition TEXT NOT NULL CHECK(condition IN ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR')),
                status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'RESERVED', 'SOLD')),
                view_count INTEGER DEFAULT 0,
                images TEXT,
                -- 教材特定字段
                isbn TEXT,
                course_code TEXT,
                module_name TEXT,
                edition TEXT,
                author TEXT,
                -- 电子产品特定字段
                brand TEXT,
                model_number TEXT,
                warranty_status TEXT,
                original_purchase_date TEXT,
                accessories_included TEXT,
                -- 家具特定字段
                item_type TEXT,
                dimensions TEXT,
                material TEXT,
                assembly_required INTEGER,
                condition_details TEXT,
                -- 服装特定字段
                size TEXT,
                clothing_brand TEXT,
                material_type TEXT,
                color TEXT,
                gender TEXT,
                -- 体育器材特定字段
                sports_brand TEXT,
                size_dimensions TEXT,
                sport_type TEXT,
                sports_condition_details TEXT,
                post_date INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error('Error creating items table:', err);
                return reject(err);
            }
            console.log('✅ Items table created');
        });

        // 创建评分表
        database.run(`
            CREATE TABLE IF NOT EXISTS ratings (
                id TEXT PRIMARY KEY,
                rated_user_id TEXT NOT NULL,
                rater_user_id TEXT NOT NULL,
                item_id TEXT,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (rater_user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating ratings table:', err);
                return reject(err);
            }
            console.log('✅ Ratings table created');
        });

        // 创建关注列表表
        database.run(`
            CREATE TABLE IF NOT EXISTS watchlists (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                item_id TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
                UNIQUE(user_id, item_id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating watchlists table:', err);
                return reject(err);
            }
            console.log('✅ Watchlists table created');
        });

        // 创建物品状态变更记录表
        database.run(`
            CREATE TABLE IF NOT EXISTS item_status_history (
                id TEXT PRIMARY KEY,
                item_id TEXT NOT NULL,
                old_status TEXT,
                new_status TEXT NOT NULL,
                buyer_id TEXT,
                buyer_name TEXT,
                changed_by TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
                FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error('Error creating item_status_history table:', err);
                return reject(err);
            }
            console.log('✅ Item status history table created');
            resolve();
        });
    });
}

/**
 * 关闭数据库连接
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    db = null;
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

module.exports = {
    getDatabase,
    initDatabase,
    closeDatabase,
    DB_PATH
};
