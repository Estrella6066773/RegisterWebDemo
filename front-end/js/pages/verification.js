/**
 * 验证页面逻辑
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    initVerificationPage();
});

/**
 * 初始化验证页面
 */
function initVerificationPage() {
    const email = getUrlParameter('email');
    const token = getUrlParameter('token');
    const tempId = getUrlParameter('tempId');
    
    if (email) {
        document.getElementById('verificationEmail').textContent = email;
    }
    
    // 如果有tempId，说明是新的注册流程
    if (tempId) {
        showDevModeNotice(email, tempId);
    }
    
    // 如果有token，尝试验证（旧的验证流程）
    if (token) {
        verifyEmail(token);
    }
    
    // 初始化事件监听器
    initEventListeners(email, tempId);
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null}
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * 初始化事件监听器
 * @param {string} email - 邮箱地址
 * @param {string} tempId - 临时注册ID
 */
function initEventListeners(email, tempId) {
    // 重新发送验证邮件
    document.getElementById('resendBtn').addEventListener('click', async function() {
        if (!email) {
            showGlobalError(I18n.t('verification.alert.noEmail', '无法获取邮箱地址'));
            return;
        }
        
        this.disabled = true;
        this.textContent = I18n.t('verification.pending.sending', '发送中...');
        
        try {
            await UserAPI.sendVerificationEmail();
            showSuccessMessage(I18n.t('verification.alert.resendSuccess', '验证邮件已重新发送！'));
            this.disabled = false;
            this.textContent = I18n.t('verification.pending.resend', '重新发送验证邮件');
        } catch (error) {
            showGlobalError(I18n.t('verification.alert.resendFailed', '发送失败: {error}', { error: error.message || I18n.t('common.error.unknown', '未知错误') }));
            this.disabled = false;
            this.textContent = I18n.t('verification.pending.resend', '重新发送验证邮件');
        }
    });
    
    // 重试按钮
    document.getElementById('retryBtn').addEventListener('click', function() {
        if (email) {
            window.location.href = `verification.html?email=${encodeURIComponent(email)}`;
        } else {
            window.location.href = 'register.html';
        }
    });
    
    // 测试验证链接（开发模式）
    const testLink = document.getElementById('testVerificationLink');
    if (testLink) {
        testLink.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!tempId) {
                showGlobalError('缺少临时注册ID');
                return;
            }
            
            // 直接调用验证API，视为验证成功
            try {
                // 使用任意token调用验证API
                const response = await UserAPI.verifyEmail('direct_verification', tempId);
                
                if (response.success) {
                    showSuccessState();
                } else {
                    throw new Error(response.message || '验证失败');
                }
            } catch (error) {
                console.error('模拟验证失败:', error);
                showGlobalError('验证失败: ' + (error.message || '未知错误'));
            }
        });
    }
    
    // 跳过验证按钮（开发模式）
    const skipBtn = document.getElementById('skipVerificationBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            if (!tempId) {
                showGlobalError('缺少临时注册ID');
                return;
            }
            await skipVerification(tempId);
        });
    }
}

/**
 * 显示开发模式提示
 * @param {string} email - 邮箱地址
 * @param {string} tempId - 临时注册ID
 */
function showDevModeNotice(email, tempId) {
    const notice = document.getElementById('devModeNotice');
    if (notice) {
        notice.style.display = 'block';
    }
}

/**
 * 验证邮箱
 * @param {string} token - 验证token
 */
async function verifyEmail(token) {
    try {
        // 调用后端API进行验证
        const response = await UserAPI.verifyEmail(token);
        
        if (response.success) {
            // 显示成功状态
            showSuccessState();
        } else {
            throw new Error(response.message || '验证失败');
        }
    } catch (error) {
        // 显示失败状态
        showErrorState(error.message || I18n.t('verification.error.defaultMessage', '验证失败'));
    }
}

/**
 * 跳过验证
 * @param {string} tempId - 临时注册ID
 */
async function skipVerification(tempId) {
    const skipBtn = document.getElementById('skipVerificationBtn');
    const originalText = skipBtn.textContent;
    
    try {
        skipBtn.disabled = true;
        skipBtn.textContent = I18n.t('verification.devMode.skipping', '跳过中...');
        
        // 调用后端API跳过验证并创建未验证账号
        const response = await UserAPI.skipVerification(tempId);
        
        if (response.success) {
            showSuccessMessage(I18n.t('verification.alert.skipSuccess', '验证流程已跳过，未验证账号已创建！'));
            // 跳转到登录页面
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            throw new Error(response.message || '跳过验证失败');
        }
    } catch (error) {
        showGlobalError(I18n.t('verification.alert.skipFailed', '跳过验证失败: {error}', { 
            error: error.message || I18n.t('common.error.unknown', '未知错误') 
        }));
        skipBtn.disabled = false;
        skipBtn.textContent = originalText;
    }
}

/**
 * 显示成功状态
 */
function showSuccessState() {
    document.getElementById('pendingState').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('devModeNotice').classList.add('hidden');
    document.getElementById('successState').classList.remove('hidden');
}

/**
 * 显示失败状态
 * @param {string} errorMessage - 错误消息
 */
function showErrorState(errorMessage) {
    document.getElementById('pendingState').classList.add('hidden');
    document.getElementById('successState').classList.add('hidden');
    document.getElementById('devModeNotice').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('errorMessage').textContent = errorMessage;
}

// 国际化函数
function t(key, fallback = '') {
    if (window.I18n && typeof window.I18n.t === 'function') {
        return I18n.t(key, fallback || key);
    }
    return fallback || key;
}

/**
 * 显示全局错误信息
 * @param {string} message - 错误消息
 */
function showGlobalError(message) {
    // 创建或获取全局错误容器
    let errorContainer = document.getElementById('globalErrorContainer');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'globalErrorContainer';
        errorContainer.className = 'global-error';
        const container = document.querySelector('.verification-container');
        if (container) {
            container.insertBefore(errorContainer, container.firstChild);
        }
    }
    
    errorContainer.innerHTML = `
        <div class="error-message">
            <span class="error-icon">⚠️</span>
            <span>${message}</span>
        </div>
    `;
    errorContainer.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 3000);
}

/**
 * 显示成功消息
 * @param {string} message - 成功消息
 */
function showSuccessMessage(message) {
    // 创建或获取成功消息容器
    let successContainer = document.getElementById('globalSuccessContainer');
    if (!successContainer) {
        successContainer = document.createElement('div');
        successContainer.id = 'globalSuccessContainer';
        successContainer.className = 'global-success';
        const container = document.querySelector('.verification-container');
        if (container) {
            container.insertBefore(successContainer, container.firstChild);
        }
    }
    
    successContainer.innerHTML = `
        <div class="success-message">
            <span class="success-icon">✅</span>
            <span>${message}</span>
        </div>
    `;
    successContainer.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        successContainer.style.display = 'none';
    }, 3000);
}
