/**
 * ============================================
 * 表单验证工具 - Validation Utilities
 * ============================================
 */

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 验证大学邮箱（.edu域名）
 * @param {string} email - 邮箱地址
 * @returns {boolean}
 */
function isValidUniversityEmail(email) {
    if (!isValidEmail(email)) {
        return false;
    }
    // 检查是否包含.edu域名
    return email.toLowerCase().includes('.edu');
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} { valid: boolean, message: string }
 */
function validatePassword(password) {
    if (!password) {
        return { valid: false, message: '密码不能为空' };
    }
    if (password.length < 8) {
        return { valid: false, message: '密码长度至少8位' };
    }
    if (password.length > 20) {
        return { valid: false, message: '密码长度不能超过20位' };
    }
    // 检查是否包含字母和数字
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
        return { valid: false, message: '密码必须包含字母和数字' };
    }
    return { valid: true, message: '' };
}

/**
 * 验证姓名
 * @param {string} name - 姓名
 * @returns {Object} { valid: boolean, message: string }
 */
function validateName(name) {
    if (!name || name.trim().length === 0) {
        return { valid: false, message: '姓名不能为空' };
    }
    if (name.length < 2) {
        return { valid: false, message: '姓名至少2个字符' };
    }
    if (name.length > 50) {
        return { valid: false, message: '姓名不能超过50个字符' };
    }
    return { valid: true, message: '' };
}

/**
 * 验证必填字段
 * @param {string} value - 字段值
 * @param {string} fieldName - 字段名称
 * @returns {Object} { valid: boolean, message: string }
 */
function validateRequired(value, fieldName) {
    if (!value || value.trim().length === 0) {
        return { valid: false, message: `${fieldName}不能为空` };
    }
    return { valid: true, message: '' };
}

/**
 * 显示表单错误
 * @param {HTMLElement} field - 表单字段元素
 * @param {string} message - 错误消息
 */
function showFieldError(field, message) {
    // 移除之前的错误
    hideFieldError(field);
    
    // 添加错误样式
    field.classList.add('error');
    
    // 创建错误消息元素
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    
    // 插入错误消息
    field.parentElement.appendChild(errorElement);
}

/**
 * 隐藏表单错误
 * @param {HTMLElement} field - 表单字段元素
 */
function hideFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * 验证整个表单
 * @param {HTMLFormElement} form - 表单元素
 * @param {Object} rules - 验证规则
 * @returns {boolean}
 */
function validateForm(form, rules) {
    let isValid = true;
    
    for (const [fieldName, rule] of Object.entries(rules)) {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field) continue;
        
        const value = field.value.trim();
        let fieldValid = true;
        let errorMessage = '';
        
        // 必填验证
        if (rule.required && !value) {
            fieldValid = false;
            errorMessage = rule.requiredMessage || `${fieldName}不能为空`;
        }
        
        // 自定义验证
        if (fieldValid && rule.validator) {
            const result = rule.validator(value);
            if (typeof result === 'object') {
                fieldValid = result.valid;
                errorMessage = result.message || '';
            } else {
                fieldValid = result;
            }
        }
        
        if (!fieldValid) {
            showFieldError(field, errorMessage);
            isValid = false;
        } else {
            hideFieldError(field);
        }
    }
    
    return isValid;
}

/**
 * 导出验证函数
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        isValidUniversityEmail,
        validatePassword,
        validateName,
        validateRequired,
        showFieldError,
        hideFieldError,
        validateForm,
    };
}

