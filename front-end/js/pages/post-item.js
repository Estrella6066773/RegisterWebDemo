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

// 类别特定字段配置
const categoryFields = {
    TEXTBOOK: [
        { name: 'isbn', labelKey: 'postItem.fields.isbn', placeholderKey: 'postItem.fields.isbnPlaceholder', type: 'text' },
        { name: 'courseCode', labelKey: 'postItem.fields.courseCode', placeholderKey: 'postItem.fields.courseCodePlaceholder', type: 'text' },
        { name: 'moduleName', labelKey: 'postItem.fields.moduleName', placeholderKey: 'postItem.fields.moduleNamePlaceholder', type: 'text' },
        { name: 'edition', labelKey: 'postItem.fields.edition', placeholderKey: 'postItem.fields.editionPlaceholder', type: 'text' },
        { name: 'author', labelKey: 'postItem.fields.author', placeholderKey: 'postItem.fields.authorPlaceholder', type: 'text' },
    ],
    ELECTRONICS: [
        { name: 'brand', labelKey: 'postItem.fields.brand', placeholderKey: 'postItem.fields.brandPlaceholder', type: 'text' },
        { name: 'model', labelKey: 'postItem.fields.model', placeholderKey: 'postItem.fields.modelPlaceholder', type: 'text' },
        { name: 'warrantyStatus', labelKey: 'postItem.fields.warrantyStatus', type: 'select', optionKeys: ['postItem.fields.warrantyIn', 'postItem.fields.warrantyOut', 'postItem.fields.warrantyNone'] },
        { name: 'purchaseDate', labelKey: 'postItem.fields.purchaseDate', type: 'date' },
        { name: 'accessories', labelKey: 'postItem.fields.accessories', placeholderKey: 'postItem.fields.accessoriesPlaceholder', type: 'text' },
    ],
    FURNITURE: [
        { name: 'itemType', labelKey: 'postItem.fields.itemType', placeholderKey: 'postItem.fields.itemTypePlaceholder', type: 'text' },
        { name: 'size', labelKey: 'postItem.fields.size', placeholderKey: 'postItem.fields.sizePlaceholder', type: 'text' },
        { name: 'material', labelKey: 'postItem.fields.material', placeholderKey: 'postItem.fields.materialPlaceholder', type: 'text' },
        { name: 'assemblyRequired', labelKey: 'postItem.fields.assemblyRequired', type: 'select', optionKeys: ['postItem.fields.assemblyYes', 'postItem.fields.assemblyNo', 'postItem.fields.assemblyDone'] },
        { name: 'conditionDetails', labelKey: 'postItem.fields.conditionDetails', placeholderKey: 'postItem.fields.conditionDetailsPlaceholder', type: 'textarea' },
    ],
    APPAREL: [
        { name: 'size', labelKey: 'postItem.fields.sizeApparel', placeholderKey: 'postItem.fields.sizeApparelPlaceholder', type: 'text' },
        { name: 'brand', labelKey: 'postItem.fields.brand', placeholderKey: 'postItem.fields.brandPlaceholder', type: 'text' },
        { name: 'material', labelKey: 'postItem.fields.material', placeholderKey: 'postItem.fields.materialPlaceholder', type: 'text' },
        { name: 'color', labelKey: 'postItem.fields.color', placeholderKey: 'postItem.fields.colorPlaceholder', type: 'text' },
        { name: 'gender', labelKey: 'postItem.fields.gender', type: 'select', optionKeys: ['postItem.fields.genderMale', 'postItem.fields.genderFemale', 'postItem.fields.genderNeutral'] },
    ],
    SPORTS: [
        { name: 'brand', labelKey: 'postItem.fields.brand', placeholderKey: 'postItem.fields.brandPlaceholder', type: 'text' },
        { name: 'size', labelKey: 'postItem.fields.size', placeholderKey: 'postItem.fields.sizeSportsPlaceholder', type: 'text' },
        { name: 'sportType', labelKey: 'postItem.fields.sportType', placeholderKey: 'postItem.fields.sportTypePlaceholder', type: 'text' },
        { name: 'conditionDetails', labelKey: 'postItem.fields.conditionDetails', placeholderKey: 'postItem.fields.conditionDetailsPlaceholder', type: 'textarea' },
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
    const fields = categoryFields[category];
    
    categoryFieldsContent.innerHTML = fields.map(field => {
        const label = t(field.labelKey, field.name);
        if (field.type === 'select') {
            const options = (field.optionKeys || []).map(key => {
                const value = key.split('.').pop();
                const text = t(key, value);
                return `<option value="${value}">${text}</option>`;
            }).join('');
            return `
                <div class="form-group category-field-group">
                    <label for="${field.name}" class="form-label">${label}</label>
                    <select id="${field.name}" name="${field.name}" class="form-control">
                        <option value="">${t('postItem.fields.selectPlaceholder', '请选择')}</option>
                        ${options}
                    </select>
                </div>
            `;
        } else if (field.type === 'textarea') {
            const placeholder = field.placeholderKey ? t(field.placeholderKey, '') : '';
            return `
                <div class="form-group category-field-group">
                    <label for="${field.name}" class="form-label">${label}</label>
                    <textarea 
                        id="${field.name}" 
                        name="${field.name}" 
                        class="form-control" 
                        rows="3"
                        placeholder="${placeholder}"
                    ></textarea>
                </div>
            `;
        } else {
            const placeholder = field.placeholderKey ? t(field.placeholderKey, '') : '';
            return `
                <div class="form-group category-field-group">
                    <label for="${field.name}" class="form-label">${label}</label>
                    <input 
                        type="${field.type}" 
                        id="${field.name}" 
                        name="${field.name}" 
                        class="form-control" 
                        placeholder="${placeholder}"
                    >
                </div>
            `;
        }
    }).join('');
}

// 处理图片选择
function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - selectedImages.length;

    if (files.length > remainingSlots) {
        alert(formatMessage('postItem.alert.maxImages', '最多只能上传5张图片，您还可以上传{count}张', { count: remainingSlots }));
        return;
    }

    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            alert(formatMessage('postItem.alert.imageTooLarge', '图片 {name} 超过5MB，请选择较小的图片', { name: file.name }));
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert(formatMessage('postItem.alert.notImage', '文件 {name} 不是图片格式', { name: file.name }));
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
        alert(t('postItem.alert.imageRequired', '请至少上传一张图片'));
        return;
    }

    // 收集表单数据
    const formData = new FormData(e.target);
    const itemData = {
        category: formData.get('category'),
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        condition: formData.get('condition'),
    };

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
            
            alert(errorMessage);
            return;
        }

        // 使用上传后的图片URL
        itemData.images = imageUrls;

        // 更新按钮状态
        submitBtn.textContent = t('postItem.form.submitLoading', '发布中...');

        // 调用API创建物品
        const response = await ItemAPI.createItem(itemData);
        
        if (response.success) {
            alert(t('postItem.alert.success', '物品发布成功！'));
            window.location.href = `item-detail.html?id=${response.itemId || response.data?.id || response.id}`;
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
            errorMessage = t('postItem.alert.validation', '数据验证失败：\n') + error.errors.join('\n');
        } else {
            errorMessage += error.message || t('postItem.alert.retry', '请稍后重试');
        }
        
        alert(errorMessage);
        
        // 恢复按钮状态
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = t('postItem.form.submit', '发布物品');
    }
});

