/**
 * ============================================
 * 个人资料页面逻辑 - Profile Page Logic
 * ============================================
 */

function t(key, fallback = '') {
    return window.I18n ? window.I18n.t(key, fallback) : fallback;
}

function preserveElement(element) {
    if (element && window.I18n && typeof window.I18n.preserve === 'function') {
        window.I18n.preserve(element);
    }
}

function formatMessage(key, fallback, replacements = {}) {
    let message = t(key, fallback);
    for (const [placeholder, value] of Object.entries(replacements)) {
        message = message.replace(`{${placeholder}}`, value);
    }
    return message;
}

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    initProfilePage();
});

// 当前用户资料数据
let currentProfile = null;

/**
 * 初始化个人资料页面
 */
async function initProfilePage() {
    // 检查登录状态
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // 加载用户资料
    await loadUserProfile();
    
    // 初始化编辑资料功能
    initEditProfile();
}

/**
 * 加载用户资料
 */
async function loadUserProfile() {
    try {
        // 调用API获取用户资料
        const response = await UserAPI.getCurrentUser();
        
        if (response.success && response.data) {
            // 渲染资料
            renderProfile(response.data);
        } else {
            throw new Error(response.message || t('profile.error.loadFailed', '获取资料失败'));
        }
        
    } catch (error) {
        console.error('加载资料失败:', error);
        
        let errorMessage = t('profile.error.loadFailedPrefix', '加载资料失败：');
        if (error.type === 'NETWORK_ERROR') {
            errorMessage = t('profile.error.network', '网络连接失败，请检查网络连接');
        } else if (error.type === 'AUTH_ERROR') {
            errorMessage = t('profile.error.auth', '登录已过期，请重新登录');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        } else {
            errorMessage += error.message || t('profile.error.unknown', '未知错误');
        }
        
        alert(errorMessage);
        // 如果未登录，跳转到登录页
        if (error.type === 'AUTH_ERROR' || (error.message && error.message.includes('认证'))) {
            window.location.href = 'login.html';
        }
    }
}

/**
 * 渲染用户资料
 * @param {Object} profile - 用户资料数据
 */
function renderProfile(profile) {
    // 保存当前资料
    currentProfile = profile;
    
    // 渲染头部信息
    renderProfileHeader(profile);
    
    // 渲染信任指标
    renderTrustIndicators(profile);
    
    // 渲染资料完整度
    renderProfileCompleteness(profile);
    
    // 渲染详细资料
    renderProfileDetails(profile);
    
    // 渲染评分历史
    renderRatingHistory(profile);
}

/**
 * 渲染资料头部
 * @param {Object} profile - 用户资料
 */
function renderProfileHeader(profile) {
    const avatar = document.getElementById('profileAvatar');
    const name = document.getElementById('profileName');
    const email = document.getElementById('profileEmail');
    const memberType = document.getElementById('profileMemberType');
    const joinDate = document.getElementById('profileJoinDate');
    
    if (avatar) {
        avatar.src = profile.avatar ? (profile.avatar.startsWith('http') ? profile.avatar : profile.avatar) : '../images/default-avatar.png';
        avatar.alt = profile.name || t('profile.avatar.alt', '用户头像');
    }
    
    if (name) {
        name.textContent = profile.name || t('profile.name.notSet', '未设置姓名');
        const oldBadge = name.querySelector('.badge');
        if (oldBadge) oldBadge.remove();
        const badge = document.createElement('span');
        badge.className = profile.verified ? 'badge badge-verified' : 'badge badge-unverified';
        badge.textContent = profile.verified ? t('profile.verified.yes', '已验证') : t('profile.verified.no', '未验证');
        name.appendChild(badge);
        preserveElement(name);
    }
    
    if (email) {
        email.textContent = profile.email || '';
        preserveElement(email);
    }
    
    if (memberType) {
        memberType.textContent = getMemberTypeName(profile.memberType);
        memberType.className = `badge badge-member-${profile.memberType.toLowerCase()}`;
    }
    
    if (joinDate) {
        joinDate.textContent = formatDate(profile.joinDate);
        preserveElement(joinDate);
    }
}

/**
 * 渲染信任指标
 * @param {Object} profile - 用户资料
 */
function renderTrustIndicators(profile) {
    const indicators = [
        {
            icon: profile.verified ? '✓' : '✗',
            value: profile.verified ? t('profile.trust.verified', '已验证') : t('profile.trust.unverified', '未验证'),
            label: t('profile.trust.verificationStatus', '验证状态'),
            color: profile.verified ? 'var(--success-color)' : 'var(--text-disabled)',
        },
        {
            icon: '📅',
            value: formatDate(profile.joinDate),
            label: t('profile.trust.joinDate', '加入日期'),
        },
        {
            icon: '💰',
            value: profile.successfulTransactions || 0,
            label: t('profile.trust.successfulTransactions', '成功交易'),
        },
        {
            icon: '⭐',
            value: profile.averageRating ? profile.averageRating.toFixed(1) : '0.0',
            label: t('profile.trust.averageRating', '平均评分'),
        },
    ];
    
    const container = document.querySelector('.trust-indicators');
    if (!container) return;
    
    container.innerHTML = indicators.map(indicator => `
        <div class="trust-card">
            <div class="trust-card-icon" style="color: ${indicator.color || 'var(--primary-color)'}">
                ${indicator.icon}
            </div>
            <div class="trust-card-value">${indicator.value}</div>
            <div class="trust-card-label">${indicator.label}</div>
        </div>
    `).join('');
}

/**
 * 渲染资料完整度
 * @param {Object} profile - 用户资料
 */
function renderProfileCompleteness(profile) {
    const completenessItems = [
        { key: 'avatar', label: t('profile.completeness.avatar', '头像'), completed: !!profile.avatar },
        { key: 'name', label: t('profile.completeness.name', '姓名'), completed: !!profile.name },
        { key: 'bio', label: t('profile.completeness.bio', '个人简介'), completed: !!profile.bio },
        { key: 'university', label: t('profile.completeness.university', '大学'), completed: !!profile.university },
        { key: 'enrollmentYear', label: t('profile.completeness.enrollmentYear', '入学年份'), completed: !!profile.enrollmentYear },
    ];
    
    // 使用后端返回的完整度百分比，如果没有则计算
    const percentage = profile.profileCompleteness !== undefined 
        ? profile.profileCompleteness 
        : Math.round((completenessItems.filter(item => item.completed).length / completenessItems.length) * 100);
    
    // 更新百分比
    const percentageElement = document.querySelector('.completeness-percentage');
    if (percentageElement) {
        percentageElement.textContent = `${percentage}%`;
    }
    
    // 更新进度条
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
        // 根据百分比设置进度条颜色
        if (percentage < 40) {
            progressBar.style.backgroundColor = 'var(--error-color)';
        } else if (percentage < 80) {
            progressBar.style.backgroundColor = '#FFA500';
        } else {
            progressBar.style.backgroundColor = 'var(--success-color)';
        }
    }
    
    // 更新项目列表
    const itemsContainer = document.querySelector('.completeness-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = completenessItems.map(item => `
            <div class="completeness-item">
                <div class="icon ${item.completed ? 'completed' : 'incomplete'}">
                    ${item.completed ? '✓' : '✗'}
                </div>
                <span>${item.label}</span>
            </div>
        `).join('');
    }
}

/**
 * 渲染详细资料
 * @param {Object} profile - 用户资料
 */
function renderProfileDetails(profile) {
    const notSetText = t('profile.details.notSet', '未设置');
    const details = [
        { label: t('profile.details.email', '邮箱'), value: profile.email, preserve: !!profile.email },
        { label: t('profile.details.memberType', '会员类型'), value: getMemberTypeName(profile.memberType), preserve: false },
        { label: t('profile.details.university', '大学'), value: profile.university, preserve: !!profile.university },
        { label: t('profile.details.enrollmentYear', '入学年份'), value: profile.enrollmentYear, preserve: !!profile.enrollmentYear },
        { label: t('profile.details.bio', '个人简介'), value: profile.bio, preserve: !!profile.bio },
    ];
    
    const detailsContainer = document.querySelector('.details-grid');
    if (detailsContainer) {
        detailsContainer.innerHTML = details.map(detail => {
            const hasValue = detail.value !== undefined && detail.value !== null && detail.value !== '';
            const valueText = hasValue ? detail.value : notSetText;
            const preserveAttr = detail.preserve && hasValue ? ' data-i18n-preserve="true"' : '';
            return `
                <div class="detail-item">
                    <div class="detail-label">${detail.label}</div>
                    <div class="detail-value ${hasValue ? '' : 'empty'}"${preserveAttr}>
                        ${valueText}
                    </div>
                </div>
            `;
        }).join('');
    }
}

/**
 * 渲染评分历史
 * @param {Object} profile - 用户资料
 */
function renderRatingHistory(profile) {
    const averageRating = profile.averageRating || 0;
    const ratingCount = profile.ratingCount || 0;
    
    // 更新平均评分
    const averageElement = document.querySelector('.rating-average');
    if (averageElement) {
        averageElement.textContent = averageRating.toFixed(1);
    }
    
    // 渲染星级
    const starsContainer = document.querySelector('.rating-stars');
    if (starsContainer) {
        starsContainer.innerHTML = Array.from({ length: 5 }, (_, i) => {
            const filled = i < Math.floor(averageRating);
            return `<span class="star ${filled ? 'filled' : ''}">★</span>`;
        }).join('');
    }
    
    // 更新评分数量
    const countElement = document.querySelector('.rating-count');
    if (countElement) {
        countElement.textContent = formatMessage('profile.rating.basedOn', '基于 {count} 条评价', { count: ratingCount });
    }
}

/**
 * 格式化日期
 * @param {string|Date|number} date - 日期（可以是时间戳、ISO字符串或Date对象）
 * @returns {string}
 */
function formatDate(date) {
    if (!date) return t('profile.date.unknown', '未知');
    // 如果是数字（时间戳），直接使用
    // 如果是字符串，先尝试解析
    const d = typeof date === 'number' ? new Date(date) : new Date(date);
    if (isNaN(d.getTime())) return t('profile.date.unknown', '未知');
    return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * 获取会员类型中文名称
 * @param {string} memberType - 会员类型
 * @returns {string}
 */
function getMemberTypeName(memberType) {
    const names = {
        'STUDENT': t('profile.memberType.student', '学生会员'),
        'ASSOCIATE': t('profile.memberType.associate', '关联会员'),
    };
    return names[memberType] || t('profile.memberType.unknown', '未知');
}

/**
 * 初始化编辑资料功能
 */
function initEditProfile() {
    const editBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('editProfileModal');
    const closeBtn = document.getElementById('closeEditModal');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const form = document.getElementById('editProfileForm');
    const avatarInput = document.getElementById('avatarInput');
    const selectAvatarBtn = document.getElementById('selectAvatarBtn');
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');
    const avatarPreview = document.getElementById('avatarPreview');

    // 打开模态框
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            openEditModal();
        });
    }

    // 关闭模态框
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditModal);
    }
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }

    // 选择头像
    if (selectAvatarBtn) {
        selectAvatarBtn.addEventListener('click', () => {
            avatarInput?.click();
        });
    }

    // 头像文件选择
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // 预览头像
                const reader = new FileReader();
                reader.onload = (event) => {
                    avatarPreview.src = event.target.result;
                    removeAvatarBtn.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 移除头像
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', () => {
            avatarInput.value = '';
            avatarPreview.src = '../images/default-avatar.png';
            removeAvatarBtn.style.display = 'none';
        });
    }

    // 提交表单
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 验证必填字段
            const nameInput = document.getElementById('editName');
            if (nameInput && !nameInput.value.trim()) {
                alert(t('profile.validation.nameRequired', '姓名是必填项，请填写姓名'));
                nameInput.focus();
                return;
            }
            
            // 验证姓名长度
            if (nameInput && nameInput.value.trim().length < 2) {
                alert(t('profile.validation.nameMinLength', '姓名至少需要2个字符'));
                nameInput.focus();
                return;
            }
            
            await saveProfile();
        });
    }
}

/**
 * 打开编辑模态框
 */
function openEditModal() {
    if (!currentProfile) return;

    const modal = document.getElementById('editProfileModal');
    const nameInput = document.getElementById('editName');
    const universityInput = document.getElementById('editUniversity');
    const enrollmentYearInput = document.getElementById('editEnrollmentYear');
    const bioInput = document.getElementById('editBio');
    const avatarPreview = document.getElementById('avatarPreview');
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');

    // 填充表单数据
    if (nameInput) nameInput.value = currentProfile.name || '';
    if (universityInput) universityInput.value = currentProfile.university || '';
    if (enrollmentYearInput) enrollmentYearInput.value = currentProfile.enrollmentYear || '';
    if (bioInput) bioInput.value = currentProfile.bio || '';
    
    // 设置头像预览
    if (avatarPreview) {
        if (currentProfile.avatar) {
            avatarPreview.src = currentProfile.avatar.startsWith('http') 
                ? currentProfile.avatar 
                : currentProfile.avatar;
            if (removeAvatarBtn) removeAvatarBtn.style.display = 'block';
        } else {
            avatarPreview.src = '../images/default-avatar.png';
            if (removeAvatarBtn) removeAvatarBtn.style.display = 'none';
        }
    }

    // 显示模态框
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * 关闭编辑模态框
 */
function closeEditModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * 保存资料
 */
async function saveProfile() {
    try {
        const nameInput = document.getElementById('editName');
        const universityInput = document.getElementById('editUniversity');
        const enrollmentYearInput = document.getElementById('editEnrollmentYear');
        const bioInput = document.getElementById('editBio');
        const avatarInput = document.getElementById('avatarInput');
        const submitBtn = document.querySelector('#editProfileForm button[type="submit"]');

        // 禁用提交按钮
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = t('profile.form.saving', '保存中...');
        }

        let avatarUrl = currentProfile?.avatar || null;

        // 上传头像（如果选择了新头像）
        if (avatarInput && avatarInput.files && avatarInput.files.length > 0) {
            try {
                // 使用FormData上传头像，字段名为avatar
                const formData = new FormData();
                formData.append('avatar', avatarInput.files[0]);

                const token = localStorage.getItem('authToken');
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('/api/upload/image', {
                    method: 'POST',
                    headers: headers,
                    body: formData,
                });

                const uploadResponse = await response.json();
                if (uploadResponse.success && uploadResponse.data) {
                    avatarUrl = uploadResponse.data.url;
                } else {
                    throw new Error(uploadResponse.message || t('profile.alert.uploadFailed', '上传失败'));
                }
            } catch (error) {
                console.error('头像上传失败:', error);
                alert(t('profile.alert.avatarUploadFailed', '头像上传失败：') + (error.message || t('profile.alert.unknown', '未知错误')));
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = t('profile.form.save', '保存');
                }
                return;
            }
        }

        // 准备更新数据
        const updateData = {
            name: nameInput?.value || null,
            university: universityInput?.value || null,
            enrollmentYear: enrollmentYearInput?.value ? parseInt(enrollmentYearInput.value) : null,
            bio: bioInput?.value || null,
            avatar: avatarUrl,
        };

        // 调用API更新资料
        const response = await UserAPI.updateProfile(updateData);

        if (response.success) {
            alert(t('profile.alert.updateSuccess', '资料更新成功！'));
            closeEditModal();
            // 重新加载资料
            await loadUserProfile();
        } else {
            throw new Error(response.message || t('profile.alert.updateFailed', '更新失败'));
        }
    } catch (error) {
        console.error('保存资料失败:', error);
        alert(t('profile.alert.saveFailed', '保存失败：') + (error.message || t('profile.alert.unknown', '未知错误')));
    } finally {
        const submitBtn = document.querySelector('#editProfileForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = t('profile.form.save', '保存');
        }
    }
}

