
// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
});

function t(key, fallback = '') {
    if (window.I18n && typeof window.I18n.t === 'function') {
        return I18n.t(key, fallback || key);
    }
    return fallback || key;
}

/**
 * 初始化登录页面
 */
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    // 表单验证
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateLoginEmailField(this);
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showFieldError(this, t('login.validation.passwordRequired', '密码不能为空'));
            } else {
                hideFieldError(this);
            }
        });
    }
    
    // 表单提交
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateLoginForm()) {
            await submitLoginForm();
        }
    });
    
    // 检查是否已登录
    if (isAuthenticated()) {
        window.location.href = 'profile.html';
    }
}

/**
 * 验证登录表单
 * @returns {boolean}
 */
function validateLoginForm() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const email = emailField.value.trim();
    const password = passwordField.value;
    
    let isValid = true;
    
    if (!validateLoginEmailField(emailField)) {
        isValid = false;
    }
    
    if (!password) {
        showFieldError(passwordField, t('login.validation.passwordRequired', '密码不能为空'));
        isValid = false;
    } else {
        hideFieldError(passwordField);
    }
    
    return isValid;
}

/**
 * 验证登录邮箱字段
 * @param {HTMLElement} field - 邮箱输入框
 * @returns {boolean}
 */
function validateLoginEmailField(field) {
    if (!field) {
        return false;
    }
    
    const email = field.value.trim();
    
    if (!email) {
        showFieldError(field, t('login.validation.emailRequired', '邮箱不能为空'));
        return false;
    }
    
    if (!isValidEmail(email)) {
        showFieldError(field, t('login.validation.emailFormat', '邮箱格式不正确'));
        return false;
    }
    
    hideFieldError(field);
    return true;
}

/**
 * 提交登录表单
 */
async function submitLoginForm() {
    const form = document.getElementById('loginForm');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // 禁用提交按钮
    submitButton.disabled = true;
    submitButton.textContent = t('login.form.submitLoading', '登录中...');
    
    try {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // 调用API
        const response = await UserAPI.login(email, password);
        
        if (response.success && response.token && response.userData) {
            saveAuth(response.userData, response.token);
            alert(t('login.alert.success', '登录成功！'));
            submitButton.disabled = false;
            submitButton.textContent = t('login.form.submit', '登录');
            // 更新导航后跳转
            if (typeof updateNavigation === 'function') {
                updateNavigation();
            }
            window.location.href = 'profile.html';
        } else {
            throw new Error(response.message || t('login.alert.genericError', '登录失败'));
        }
        
    } catch (error) {
        console.error('登录失败:', error);
        
        let errorMessage = t('login.alert.errorPrefix', '登录失败：');
        if (error.type === 'NETWORK_ERROR') {
            errorMessage = t('login.alert.network', '网络连接失败，请检查网络连接或服务器是否运行');
        } else if (error.type === 'AUTH_ERROR') {
            errorMessage = t('login.alert.auth', '邮箱或密码错误');
        } else if (error.errors && Array.isArray(error.errors)) {
            errorMessage = t('login.alert.validation', '数据验证失败：') + '\n' + error.errors.join('\n');
        } else {
            errorMessage += error.message || t('login.alert.auth', '邮箱或密码错误');
        }
        
        alert(errorMessage);
        submitButton.disabled = false;
        submitButton.textContent = t('login.form.submit', '登录');
    }
}

