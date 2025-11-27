/**
 * 数据库连接和初始化模块
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.db');

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
 * 使用 Promise 链确保表按顺序创建
 */
function ensureColumnExists(tableName, columnName, definition) {
    const database = getDatabase();
    return new Promise((resolve, reject) => {
        database.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
            if (err) {
                console.error(`Error checking ${tableName}.${columnName}:`, err);
                return reject(err);
            }

            const columnExists = rows.some(row => row.name === columnName);
            if (columnExists) {
                return resolve();
            }

            const alterSQL = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`;
            database.run(alterSQL, (alterErr) => {
                if (alterErr) {
                    console.error(`Error adding column ${columnName} to ${tableName}:`, alterErr);
                    return reject(alterErr);
                }
                console.log(`✅ Added missing column ${columnName} to ${tableName}`);
                resolve();
            });
        });
    });
}

function initDatabase() {
    return new Promise((resolve, reject) => {
        const database = getDatabase();

        // 启用外键约束
        database.run('PRAGMA foreign_keys = ON');

        // 将 db.run 包装为 Promise
        const runSQL = (sql, description) => {
            return new Promise((resolveSQL, rejectSQL) => {
                database.run(sql, (err) => {
                    if (err) {
                        console.error(`Error creating ${description}:`, err);
                        rejectSQL(err);
                    } else {
                        console.log(`✅ ${description} created`);
                        resolveSQL();
                    }
                });
            });
        };

        // 按顺序创建表
        runSQL(`
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
        `, 'Users table')
        .then(() => runSQL(`
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
        `, 'Items table'))
        .then(async () => {
            const itemColumns = [
                { name: 'status', definition: "TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'RESERVED', 'SOLD'))" },
                { name: 'view_count', definition: 'INTEGER DEFAULT 0' },
                { name: 'images', definition: 'TEXT' },
                { name: 'isbn', definition: 'TEXT' },
                { name: 'course_code', definition: 'TEXT' },
                { name: 'module_name', definition: 'TEXT' },
                { name: 'edition', definition: 'TEXT' },
                { name: 'author', definition: 'TEXT' },
                { name: 'brand', definition: 'TEXT' },
                { name: 'model_number', definition: 'TEXT' },
                { name: 'warranty_status', definition: 'TEXT' },
                { name: 'original_purchase_date', definition: 'TEXT' },
                { name: 'accessories_included', definition: 'TEXT' },
                { name: 'item_type', definition: 'TEXT' },
                { name: 'dimensions', definition: 'TEXT' },
                { name: 'material', definition: 'TEXT' },
                { name: 'assembly_required', definition: 'INTEGER DEFAULT 0' },
                { name: 'condition_details', definition: 'TEXT' },
                { name: 'size', definition: 'TEXT' },
                { name: 'clothing_brand', definition: 'TEXT' },
                { name: 'material_type', definition: 'TEXT' },
                { name: 'color', definition: 'TEXT' },
                { name: 'gender', definition: 'TEXT' },
                { name: 'sports_brand', definition: 'TEXT' },
                { name: 'size_dimensions', definition: 'TEXT' },
                { name: 'sport_type', definition: 'TEXT' },
                { name: 'sports_condition_details', definition: 'TEXT' }
            ];

            for (const column of itemColumns) {
                // eslint-disable-next-line no-await-in-loop
                await ensureColumnExists('items', column.name, column.definition);
            }
        })
        .then(() => runSQL(`
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
        `, 'Ratings table'))
        .then(() => runSQL(`
            CREATE TABLE IF NOT EXISTS watchlists (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                item_id TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
                UNIQUE(user_id, item_id)
            )
        `, 'Watchlists table'))
        .then(() => runSQL(`
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
        `, 'Item status history table'))
        .then(() => {
            console.log('✅ All database tables initialized successfully');
            resolve();
        })
        .catch((err) => {
            console.error('❌ Database initialization failed:', err);
            reject(err);
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
