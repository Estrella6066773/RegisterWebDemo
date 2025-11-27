
// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    initRegisterPage();
});

function t(key, fallback = '') {
    if (window.I18n && typeof window.I18n.t === 'function') {
        return I18n.t(key, fallback || key);
    }
    return fallback || key;
}

const PASSWORD_MESSAGE_MAP = {
    '密码不能为空': 'register.validation.passwordRequired',
    '密码长度至少8位': 'register.validation.passwordMin',
    '密码长度不能超过20位': 'register.validation.passwordMax',
    '密码必须包含字母和数字': 'register.validation.passwordComplex',
};

/**
 * 初始化注册页面
 */
function initRegisterPage() {
    // 会员类型选择
    initMemberTypeSelection();
    
    // 表单步骤切换
    initFormSteps();
    
    // 表单验证和提交
    initFormValidation();
}

/**
 * 初始化会员类型选择
 */
function initMemberTypeSelection() {
    const memberTypeCards = document.querySelectorAll('.member-type-card');
    const memberTypeInput = document.getElementById('memberType');
    
    memberTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有选中状态
            memberTypeCards.forEach(c => c.classList.remove('selected'));
            
            // 添加选中状态
            this.classList.add('selected');
            
            // 更新隐藏的radio input
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                if (memberTypeInput) {
                    memberTypeInput.value = radio.value;
                }
            }
            
            // 根据会员类型显示/隐藏邮箱验证提示
            updateEmailVerificationNotice(radio.value);
        });
    });
}

/**
 * 更新邮箱验证提示
 * @param {string} memberType - 会员类型
 */
function updateEmailVerificationNotice(memberType) {
    const notice = document.querySelector('.email-verification-notice');
    if (!notice) return;
    
    if (memberType === 'STUDENT' || memberType === 'ASSOCIATE') {
        notice.style.display = 'block';
        const key = memberType === 'STUDENT'
            ? 'register.notice.student'
            : 'register.notice.associate';
        notice.querySelector('.notice-text').textContent =
            t(key, t('register.notice.default', '大学邮箱验证是必需的，我们将向您的邮箱发送验证链接。'));
    } else {
        notice.style.display = 'none';
        notice.querySelector('.notice-text').textContent =
            t('register.notice.default', '大学邮箱验证是必需的，我们将向您的邮箱发送验证链接。');
    }
}

/**
 * 初始化表单步骤
 */
function initFormSteps() {
    const stepButtons = document.querySelectorAll('[data-step]');
    const stepContents = document.querySelectorAll('.form-step-content');
    
    stepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetStep = this.getAttribute('data-step');
            switchStep(targetStep);
        });
    });
    
    // 初始化第一步
    switchStep('1');
}

/**
 * 切换表单步骤
 * @param {string} stepNumber - 步骤编号
 */
function switchStep(stepNumber) {
    // 更新步骤指示器
    const stepNumbers = document.querySelectorAll('.step-number');
    const stepLabels = document.querySelectorAll('.step-label');
    const stepContents = document.querySelectorAll('.form-step-content');
    
    stepNumbers.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        stepLabels[index].classList.remove('active');
        
        if (stepNum < stepNumber) {
            step.classList.add('completed');
        } else if (stepNum == stepNumber) {
            step.classList.add('active');
            stepLabels[index].classList.add('active');
        }
    });
    
    // 显示对应步骤内容
    stepContents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 == stepNumber) {
            content.classList.add('active');
        }
    });
}

/**
 * 初始化表单验证
 */
function initFormValidation() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    // 实时验证
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmailField(this);
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            validatePasswordField(this);
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', function() {
            validateConfirmPasswordField(this, passwordInput);
        });
    }
    
    // 表单提交
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateRegisterForm()) {
            await submitRegisterForm();
        }
    });
}

/**
 * 验证邮箱字段
 * @param {HTMLElement} field - 邮箱输入框
 */
function validateEmailField(field) {
    const email = field.value.trim();
    const memberType = document.getElementById('memberType').value;
    
    if (!email) {
        showFieldError(field, t('register.validation.emailRequired', '邮箱不能为空'));
        return false;
    }
    
    if (!isValidEmail(email)) {
        showFieldError(field, t('register.validation.emailFormat', '邮箱格式不正确'));
        return false;
    }
    
    // 学生会员和关联会员需要大学邮箱
    if ((memberType === 'STUDENT' || memberType === 'ASSOCIATE') && !isValidUniversityEmail(email)) {
        showFieldError(field, t('register.validation.universityEmail', '请使用大学或机构邮箱（.edu域名）'));
        return false;
    }
    
    hideFieldError(field);
    return true;
}

/**
 * 验证密码字段
 * @param {HTMLElement} field - 密码输入框
 */
function validatePasswordField(field) {
    const password = field.value;
    const result = validatePassword(password);
    
    if (!result.valid) {
        const key = PASSWORD_MESSAGE_MAP[result.message] || 'register.validation.passwordGeneric';
        showFieldError(field, t(key, result.message));
        return false;
    }
    
    hideFieldError(field);
    return true;
}

/**
 * 验证确认密码字段
 * @param {HTMLElement} field - 确认密码输入框
 * @param {HTMLElement} passwordField - 密码输入框
 */
function validateConfirmPasswordField(field, passwordField) {
    const password = passwordField.value;
    const confirmPassword = field.value;
    
    if (!confirmPassword) {
        showFieldError(field, t('register.validation.confirmRequired', '请再次输入密码'));
        return false;
    }
    
    if (password !== confirmPassword) {
        showFieldError(field, t('register.validation.confirmMismatch', '两次输入的密码不一致'));
        return false;
    }
    
    hideFieldError(field);
    return true;
}

/**
 * 验证整个注册表单
 * @returns {boolean}
 */
function validateRegisterForm() {
    const form = document.getElementById('registerForm');
    const memberType = document.getElementById('memberType').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const name = document.getElementById('name')?.value.trim();
    
    let isValid = true;
    
    // 验证会员类型
    if (!memberType) {
        showGlobalError(t('register.validation.memberType', '请选择会员类型'));
        return false;
    }
    
    // 验证邮箱
    if (!validateEmailField(document.getElementById('email'))) {
        isValid = false;
    }
    
    // 验证密码
    if (!validatePasswordField(document.getElementById('password'))) {
        isValid = false;
    }
    
    // 验证确认密码
    if (!validateConfirmPasswordField(document.getElementById('confirmPassword'), document.getElementById('password'))) {
        isValid = false;
    }
    
    // 验证姓名（可选）
    if (name && name.length < 2) {
        showFieldError(document.getElementById('name'), t('register.validation.nameLength', '姓名至少2个字符'));
        isValid = false;
    }
    
    return isValid;
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
        const form = document.getElementById('registerForm');
        form.insertBefore(errorContainer, form.firstChild);
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
        const form = document.getElementById('registerForm');
        form.insertBefore(successContainer, form.firstChild);
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

/**
 * 提交注册表单
 */
async function submitRegisterForm() {
    const form = document.getElementById('registerForm');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // 禁用提交按钮
    submitButton.disabled = true;
    submitButton.textContent = t('register.form.submitLoading', '注册中...');
    
    try {
        const formData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            memberType: document.getElementById('memberType').value,
            name: document.getElementById('name')?.value.trim() || '',
        };
        
        // 调用API存储临时注册数据
        const response = await UserAPI.register(formData);
        
        if (response.success) {
            let successMessage = t('register.alert.success', '注册信息已保存！');
            if (response.requiresVerification) {
                successMessage += t('register.alert.checkEmail', '请完成验证以创建账号。');
            }
            showSuccessMessage(successMessage);
            
            // 跳转到验证页面，传递临时注册ID
            setTimeout(() => {
                window.location.href = 'verification.html?tempId=' + encodeURIComponent(response.tempId) + 
                                      '&email=' + encodeURIComponent(formData.email);
            }, 1500);
        }
        
    } catch (error) {
        console.error('注册失败:', error);
        
        let errorMessage = t('register.alert.errorPrefix', '注册失败：');
        if (error.type === 'NETWORK_ERROR') {
            errorMessage = t('register.alert.network', '网络连接失败，请检查网络连接或服务器是否运行');
        } else if (error.errors && Array.isArray(error.errors)) {
            errorMessage = t('register.alert.validation', '数据验证失败：') + '\n' + error.errors.join('\n');
        } else {
            errorMessage += error.message || t('register.alert.unknown', '未知错误');
        }
        
        showGlobalError(errorMessage);
        submitButton.disabled = false;
        submitButton.textContent = t('register.form.submit', '注册');
    }
}

