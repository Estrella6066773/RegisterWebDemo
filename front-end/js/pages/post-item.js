/**
 * ============================================
 * 发布物品页面逻辑 - Post Item Page Logic
 * ============================================
 */

function t(key, fallback = '') {
    return window.I18n ? window.I18n.t(key, fallback) : fallback;
}

function formatMessage(key, fallback, replacements = {}) {
    let message = t(key, fallback);
    for (const [placeholder, value] of Object.entries(replacements)) {
        message = message.replace(`{${placeholder}}`, value);
    }
    return message;
}

function translateField(key, fallback = '') {
    if (!key) return fallback || '';
    const currentLang = (window.I18n && typeof window.I18n.getLang === 'function')
        ? window.I18n.getLang()
        : 'en';
    const textMap = window.I18N_TEXT_MAP || {};
    const langMap = textMap[currentLang] || {};
    if (Object.prototype.hasOwnProperty.call(langMap, key)) {
        return langMap[key];
    }
    const defaultMap = textMap.en || {};
    if (Object.prototype.hasOwnProperty.call(defaultMap, key)) {
        return defaultMap[key];
    }
    return fallback || key;
}

// 类别特定字段配置
const categoryFields = {
    TEXTBOOK: [
        { name: 'isbn', labelKey: 'postItem.fields.isbn', placeholderKey: 'postItem.fields.isbnPlaceholder', helpKey: 'postItem.fields.isbnHelp', type: 'text', maxLength: 20 },
        { name: 'courseCode', labelKey: 'postItem.fields.courseCode', placeholderKey: 'postItem.fields.courseCodePlaceholder', helpKey: 'postItem.fields.courseCodeHelp', type: 'text', maxLength: 20 },
        { name: 'moduleName', labelKey: 'postItem.fields.moduleName', placeholderKey: 'postItem.fields.moduleNamePlaceholder', helpKey: 'postItem.fields.moduleNameHelp', type: 'text', maxLength: 100 },
        { name: 'edition', labelKey: 'postItem.fields.edition', placeholderKey: 'postItem.fields.editionPlaceholder', helpKey: 'postItem.fields.editionHelp', type: 'text', maxLength: 50 },
        { name: 'author', labelKey: 'postItem.fields.author', placeholderKey: 'postItem.fields.authorPlaceholder', helpKey: 'postItem.fields.authorHelp', type: 'text', maxLength: 100 },
    ],
    ELECTRONICS: [
        { name: 'brand', labelKey: 'postItem.fields.brand', placeholderKey: 'postItem.fields.brandPlaceholder', helpKey: 'postItem.fields.brandHelp', type: 'text', maxLength: 50 },
        { name: 'model', labelKey: 'postItem.fields.model', placeholderKey: 'postItem.fields.modelPlaceholder', helpKey: 'postItem.fields.modelHelp', type: 'text', maxLength: 100 },
        { name: 'warrantyStatus', labelKey: 'postItem.fields.warrantyStatus', helpKey: 'postItem.fields.warrantyStatusHelp', type: 'select', optionKeys: ['postItem.fields.warrantyIn', 'postItem.fields.warrantyOut', 'postItem.fields.warrantyNone'] },
        { name: 'purchaseDate', labelKey: 'postItem.fields.purchaseDate', helpKey: 'postItem.fields.purchaseDateHelp', type: 'date' },
        { name: 'accessories', labelKey: 'postItem.fields.accessories', placeholderKey: 'postItem.fields.accessoriesPlaceholder', helpKey: 'postItem.fields.accessoriesHelp', type: 'text', maxLength: 200, fullWidth: true },
    ],
    FURNITURE: [
        { name: 'itemType', labelKey: 'postItem.fields.itemType', placeholderKey: 'postItem.fields.itemTypePlaceholder', helpKey: 'postItem.fields.itemTypeHelp', type: 'text', maxLength: 50 },
        { name: 'size', labelKey: 'postItem.fields.size', placeholderKey: 'postItem.fields.sizePlaceholder', helpKey: 'postItem.fields.sizeHelp', type: 'text', maxLength: 100 },
        { name: 'material', labelKey: 'postItem.fields.material', placeholderKey: 'postItem.fields.materialPlaceholder', helpKey: 'postItem.fields.materialHelp', type: 'text', maxLength: 100 },
        { name: 'assemblyRequired', labelKey: 'postItem.fields.assemblyRequired', helpKey: 'postItem.fields.assemblyRequiredHelp', type: 'select', optionKeys: ['postItem.fields.assemblyYes', 'postItem.fields.assemblyNo', 'postItem.fields.assemblyDone'] },
        { name: 'conditionDetails', labelKey: 'postItem.fields.conditionDetails', placeholderKey: 'postItem.fields.conditionDetailsPlaceholder', helpKey: 'postItem.fields.conditionDetailsHelp', type: 'textarea', maxLength: 500, fullWidth: true },
    ],
    APPAREL: [
        { name: 'size', labelKey: 'postItem.fields.sizeApparel', placeholderKey: 'postItem.fields.sizeApparelPlaceholder', helpKey: 'postItem.fields.sizeApparelHelp', type: 'text', maxLength: 20 },
        { name: 'brand', labelKey: 'postItem.fields.brand', placeholderKey: 'postItem.fields.brandPlaceholder', helpKey: 'postItem.fields.brandHelp', type: 'text', maxLength: 50 },
        { name: 'material', labelKey: 'postItem.fields.material', placeholderKey: 'postItem.fields.materialPlaceholder', helpKey: 'postItem.fields.materialHelp', type: 'text', maxLength: 100 },
        { name: 'color', labelKey: 'postItem.fields.color', placeholderKey: 'postItem.fields.colorPlaceholder', helpKey: 'postItem.fields.colorHelp', type: 'text', maxLength: 50 },
        { name: 'gender', labelKey: 'postItem.fields.gender', helpKey: 'postItem.fields.genderHelp', type: 'select', optionKeys: ['postItem.fields.genderMale', 'postItem.fields.genderFemale', 'postItem.fields.genderNeutral'] },
    ],
    SPORTS: [
        { name: 'brand', labelKey: 'postItem.fields.brand', placeholderKey: 'postItem.fields.brandPlaceholder', helpKey: 'postItem.fields.brandHelp', type: 'text', maxLength: 50 },
        { name: 'size', labelKey: 'postItem.fields.size', placeholderKey: 'postItem.fields.sizeSportsPlaceholder', helpKey: 'postItem.fields.sizeSportsHelp', type: 'text', maxLength: 50 },
        { name: 'sportType', labelKey: 'postItem.fields.sportType', placeholderKey: 'postItem.fields.sportTypePlaceholder', helpKey: 'postItem.fields.sportTypeHelp', type: 'text', maxLength: 100 },
        { name: 'conditionDetails', labelKey: 'postItem.fields.conditionDetails', placeholderKey: 'postItem.fields.conditionDetailsPlaceholder', helpKey: 'postItem.fields.conditionDetailsHelp', type: 'textarea', maxLength: 500, fullWidth: true },
    ],
};

let selectedImages = [];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    const categorySelect = document.getElementById('category');
    const imageInput = document.getElementById('imageInput');
    const uploadTrigger = document.getElementById('uploadTrigger');

    // 类别变化时更新字段
    categorySelect.addEventListener('change', handleCategoryChange);

    // 图片上传
    uploadTrigger.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageSelect);

    // 详细信息区域折叠/展开
    const categoryFieldsToggle = document.getElementById('categoryFieldsToggle');
    if (categoryFieldsToggle) {
        categoryFieldsToggle.addEventListener('click', function() {
            const section = document.getElementById('categoryFields');
            if (section) {
                section.classList.toggle('collapsed');
            }
        });
    }
});

// 处理类别变化
function handleCategoryChange() {
    const category = document.getElementById('category').value;
    const categoryFieldsSection = document.getElementById('categoryFields');
    const categoryFieldsContent = document.getElementById('categoryFieldsContent');

    if (!category || !categoryFields[category]) {
        categoryFieldsSection.style.display = 'none';
        categoryFieldsContent.innerHTML = '';
        return;
    }

    categoryFieldsSection.style.display = 'block';
    // 默认展开详细信息区域
    categoryFieldsSection.classList.remove('collapsed');
    const fields = categoryFields[category];
    
    // 延迟一下再绑定事件，确保DOM已更新
    setTimeout(() => {
        // 绑定字符计数事件
        fields.forEach(field => {
            if (field.type === 'textarea' && field.maxLength) {
                const textarea = document.getElementById(field.name);
                const counter = document.getElementById(`${field.name}_counter`);
                if (textarea && counter) {
                    textarea.addEventListener('input', function() {
                        counter.textContent = this.value.length;
                        if (this.value.length > field.maxLength * 0.9) {
                            counter.style.color = 'var(--error-color, #ff4d4f)';
                        } else {
                            counter.style.color = 'var(--text-secondary)';
                        }
                    });
                }
            }
        });
    }, 100);
    
    // 使用网格布局，两列显示
    categoryFieldsContent.innerHTML = `
        <div class="category-fields-grid">
            ${fields.map(field => {
                const label = translateField(field.labelKey, field.name);
                const placeholderText = translateField(field.placeholderKey, field.placeholderFallback || '');
                const helpKey = field.helpKey || `postItem.fields.${field.name}Help`;
                const helpText = translateField(helpKey, field.helpFallback || '');
                const isRequired = field.required || false;
                
                let fieldHtml = '';
                if (field.type === 'select') {
                    const options = (field.optionKeys || []).map(key => {
                        const value = key.split('.').pop();
                        const text = translateField(key, value);
                        return `<option value="${value}">${text}</option>`;
                    }).join('');
                    fieldHtml = `
                        <select id="${field.name}" name="${field.name}" class="form-control">
                            <option value="">${translateField('postItem.fields.selectPlaceholder', '请选择')}</option>
                            ${options}
                        </select>
                    `;
                } else if (field.type === 'textarea') {
                    const maxLength = field.maxLength || '';
                    fieldHtml = `
                        <textarea 
                            id="${field.name}" 
                            name="${field.name}" 
                            class="form-control" 
                            rows="4"
                            placeholder="${placeholderText}"
                            ${maxLength ? `maxlength="${maxLength}"` : ''}
                        ></textarea>
                        ${maxLength ? `<div class="char-counter"><span id="${field.name}_counter">0</span> / ${maxLength}</div>` : ''}
                    `;
                } else if (field.type === 'date') {
                    fieldHtml = `
                        <input 
                            type="date" 
                            id="${field.name}" 
                            name="${field.name}" 
                            class="form-control" 
                            placeholder="${placeholderText}"
                            max="${new Date().toISOString().split('T')[0]}"
                        >
                    `;
                } else {
                    const maxLength = field.maxLength || '';
                    fieldHtml = `
                        <input 
                            type="${field.type}" 
                            id="${field.name}" 
                            name="${field.name}" 
                            class="form-control" 
                            placeholder="${placeholderText}"
                            ${maxLength ? `maxlength="${maxLength}"` : ''}
                        >
                    `;
                }
                
                return `
                    <div class="category-field-item ${field.fullWidth ? 'full-width' : ''}">
                        <label for="${field.name}" class="form-label">
                            ${label}
                            ${isRequired ? '<span class="required">*</span>' : ''}
                        </label>
                        ${fieldHtml}
                        ${helpText ? `<div class="form-help">${helpText}</div>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 处理图片选择
function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - selectedImages.length;

    if (files.length > remainingSlots) {
        showGlobalError(formatMessage('postItem.alert.maxImages', '最多只能上传5张图片，您还可以上传{count}张', { count: remainingSlots }));
        return;
    }

    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            showGlobalError(formatMessage('postItem.alert.imageTooLarge', '图片 {name} 超过5MB，请选择较小的图片', { name: file.name }));
            return;
        }

        if (!file.type.startsWith('image/')) {
            showGlobalError(formatMessage('postItem.alert.notImage', '文件 {name} 不是图片格式', { name: file.name }));
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImages.push({
                file: file,
                preview: e.target.result
            });
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    });

    // 清空input，以便可以重复选择同一文件
    e.target.value = '';
}

// 更新图片预览
function updateImagePreview() {
    const grid = document.getElementById('imagePreviewGrid');
    
    // 清空现有预览（保留上传触发器）
    grid.innerHTML = '';

    // 添加已选择的图片
    selectedImages.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'image-upload-item';
        item.innerHTML = `
            <img src="${image.preview}" alt="预览" class="image-preview">
            <button type="button" class="image-remove-btn" onclick="removeImage(${index})">×</button>
        `;
        grid.appendChild(item);
    });

    // 如果还有空位，显示上传触发器
    if (selectedImages.length < 5) {
        const uploadTrigger = document.createElement('div');
        uploadTrigger.className = 'image-upload-item image-upload-placeholder';
        uploadTrigger.id = 'uploadTrigger';
        uploadTrigger.innerHTML = `
            <div class="upload-icon">📷</div>
            <div class="upload-text">点击上传</div>
            <div class="upload-hint">最多5张图片</div>
        `;
        uploadTrigger.addEventListener('click', () => document.getElementById('imageInput').click());
        grid.appendChild(uploadTrigger);
    }
}

// 移除图片
function removeImage(index) {
    selectedImages.splice(index, 1);
    updateImagePreview();
}

// 处理表单提交
document.getElementById('postItemForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 验证图片
    if (selectedImages.length === 0) {
        showGlobalError(t('postItem.alert.imageRequired', '请至少上传一张图片'));
        return;
    }

    // 收集表单数据
    const formData = new FormData(e.target);
    const priceValue = formData.get('price');
    const priceNum = priceValue ? parseFloat(priceValue) : null;
    
    const itemData = {
        category: formData.get('category') || '',
        title: (formData.get('title') || '').trim(),
        description: (formData.get('description') || '').trim(),
        price: priceNum,
        condition: formData.get('condition') || '',
    };
    
    // 前端基础验证
    if (!itemData.title) {
        showGlobalError(t('postItem.alert.titleRequired', '请输入物品标题'));
        return;
    }
    if (!itemData.category) {
        showGlobalError(t('postItem.alert.categoryRequired', '请选择物品类别'));
        return;
    }
    if (priceNum === null || isNaN(priceNum) || priceNum < 0) {
        showGlobalError(t('postItem.alert.priceInvalid', '请输入有效的价格（大于等于0）'));
        return;
    }
    if (!itemData.condition) {
        showGlobalError(t('postItem.alert.conditionRequired', '请选择物品状况'));
        return;
    }

    // 收集类别特定字段
    const category = itemData.category;
    if (category && categoryFields[category]) {
        categoryFields[category].forEach(field => {
            const value = formData.get(field.name);
            if (value) {
                itemData[field.name] = value;
            }
        });
    }

    try {
        // 显示加载状态
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = t('postItem.form.uploading', '上传图片中...');

        // 先上传图片到服务器
        const imageFiles = selectedImages.map(img => img.file);
        let imageUrls = [];
        
        try {
            const uploadResponse = await UploadAPI.uploadImages(imageFiles);
            if (uploadResponse.success && uploadResponse.data) {
                imageUrls = uploadResponse.data.map(img => img.url);
            } else {
                throw new Error(t('postItem.alert.uploadFailed', '图片上传失败'));
            }
        } catch (uploadError) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            let errorMessage = t('postItem.alert.uploadFailedPrefix', '图片上传失败：');
            if (uploadError.type === 'NETWORK_ERROR') {
                errorMessage = t('postItem.alert.network', '网络连接失败，请检查网络连接或服务器是否运行');
            } else if (uploadError.type === 'AUTH_ERROR') {
                errorMessage = t('postItem.alert.auth', '登录已过期，请重新登录');
                setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                errorMessage += uploadError.message || t('postItem.alert.retry', '请稍后重试');
            }
            
            showGlobalError(errorMessage);
            return;
        }

        // 使用上传后的图片URL
        itemData.images = imageUrls;

        // 更新按钮状态
        submitBtn.textContent = t('postItem.form.submitLoading', '发布中...');

        // 调用API创建物品
        const response = await ItemAPI.createItem(itemData);
        
        if (response.success) {
            showSuccessMessage(t('postItem.alert.success', '物品发布成功！'));
            setTimeout(() => {
                window.location.href = `item-detail.html?id=${response.itemId || response.data?.id || response.id}`;
            }, 1500);
        } else {
            throw new Error(response.message || t('postItem.alert.failed', '发布失败'));
        }
    } catch (error) {
        console.error('发布物品失败:', error);
        
        let errorMessage = t('postItem.alert.errorPrefix', '发布物品失败：');
        if (error.type === 'NETWORK_ERROR') {
            errorMessage = t('postItem.alert.network', '网络连接失败，请检查网络连接或服务器是否运行');
        } else if (error.type === 'AUTH_ERROR') {
            errorMessage = t('postItem.alert.auth', '登录已过期，请重新登录');
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else if (error.errors && Array.isArray(error.errors)) {
            // 显示详细的验证错误
            const errorList = error.errors.map(err => `• ${err}`).join('\n');
            errorMessage = t('postItem.alert.validation', '数据验证失败：\n') + '\n' + errorList;
        } else if (error.message) {
            // 尝试从响应中获取错误信息
            const responseData = error.response || {};
            if (responseData.errors && Array.isArray(responseData.errors)) {
                const errorList = responseData.errors.map(err => `• ${err}`).join('\n');
                errorMessage = t('postItem.alert.validation', '数据验证失败：\n') + '\n' + errorList;
            } else {
                errorMessage += error.message;
            }
        } else {
            errorMessage += t('postItem.alert.retry', '请稍后重试');
        }
        
        showGlobalError(errorMessage);
        
        // 恢复按钮状态
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = t('postItem.form.submit', '发布物品');
    }
});

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
        const form = document.getElementById('postItemForm');
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
        const form = document.getElementById('postItemForm');
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

