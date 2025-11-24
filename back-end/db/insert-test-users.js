/**
 * ============================================
 * 插入测试用户脚本
 * 用于开发和测试
 * ============================================
 */

require('dotenv').config();
const { getDatabase } = require('./database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/**
 * 插入测试用户
 */
async function insertTestUsers() {
    const db = getDatabase();
    const now = Date.now();
    const defaultPassword = '123456'; // 测试密码
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const testUsers = [
        {
            id: uuidv4(),
            email: 'student@university.edu',
            password_hash: passwordHash,
            name: '张三',
            member_type: 'STUDENT',
            verified: 1, // 已验证
            avatar: null,
            bio: '我是一名计算机科学专业的学生，喜欢编程和阅读。',
            university: '示例大学',
            enrollment_year: 2022,
            join_date: now - 90 * 24 * 60 * 60 * 1000, // 90天前
            created_at: now - 90 * 24 * 60 * 60 * 1000,
            updated_at: now - 90 * 24 * 60 * 60 * 1000,
        },
        {
            id: uuidv4(),
            email: 'associate@university.edu',
            password_hash: passwordHash,
            name: '李教授',
            member_type: 'ASSOCIATE',
            verified: 1, // 已验证
            avatar: null,
            bio: '我是大学教职工，从事教学和研究工作。',
            university: '示例大学',
            enrollment_year: null,
            join_date: now - 180 * 24 * 60 * 60 * 1000, // 180天前
            created_at: now - 180 * 24 * 60 * 60 * 1000,
            updated_at: now - 180 * 24 * 60 * 60 * 1000,
        },
    ];

    return new Promise((resolve, reject) => {
        let inserted = 0;
        let errors = 0;

        testUsers.forEach((user, index) => {
            // 先检查用户是否已存在
            db.get('SELECT id FROM users WHERE email = ?', [user.email], (err, row) => {
                if (err) {
                    console.error(`检查用户 ${user.email} 时出错:`, err);
                    errors++;
                    if (inserted + errors === testUsers.length) {
                        resolve({ inserted, errors });
                    }
                    return;
                }

                if (row) {
                    console.log(`⚠️  用户 ${user.email} 已存在，跳过`);
                    inserted++;
                    if (inserted + errors === testUsers.length) {
                        resolve({ inserted, errors });
                    }
                    return;
                }

                // 插入用户
                db.run(
                    `INSERT INTO users (
                        id, email, password_hash, name, member_type, verified,
                        avatar, bio, university, enrollment_year,
                        join_date, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        user.id,
                        user.email,
                        user.password_hash,
                        user.name,
                        user.member_type,
                        user.verified,
                        user.avatar,
                        user.bio,
                        user.university,
                        user.enrollment_year,
                        user.join_date,
                        user.created_at,
                        user.updated_at,
                    ],
                    function(insertErr) {
                        if (insertErr) {
                            console.error(`❌ 插入用户 ${user.email} 失败:`, insertErr);
                            errors++;
                        } else {
                            console.log(`✅ 成功插入用户: ${user.email} (${user.name})`);
                            inserted++;
                        }

                        if (inserted + errors === testUsers.length) {
                            console.log('\n===========================================');
                            console.log('测试用户插入完成');
                            console.log(`成功: ${inserted}, 失败: ${errors}`);
                            console.log('\n测试账户信息:');
                            console.log('-------------------------------------------');
                            testUsers.forEach(u => {
                                console.log(`邮箱: ${u.email}`);
                                console.log(`密码: ${defaultPassword}`);
                                console.log(`会员类型: ${u.member_type}`);
                                console.log(`姓名: ${u.name}`);
                                console.log('-------------------------------------------');
                            });
                            console.log('===========================================');
                            resolve({ inserted, errors });
                        }
                    }
                );
            });
        });
    });
}

// 如果直接运行此脚本
if (require.main === module) {
    insertTestUsers()
        .then(({ inserted, errors }) => {
            if (errors === 0) {
                console.log('\n✅ 所有测试用户插入成功！');
                process.exit(0);
            } else {
                console.log(`\n⚠️  部分用户插入失败，成功: ${inserted}, 失败: ${errors}`);
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('❌ 插入测试用户时发生错误:', error);
            process.exit(1);
        });
}

module.exports = { insertTestUsers };

