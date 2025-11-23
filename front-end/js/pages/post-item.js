/**
 * ============================================
 * 发布物品页面逻辑 - Post Item Page Logic
 * ============================================
 */

// 类别特定字段配置
const categoryFields = {
    TEXTBOOK: [
        { name: 'isbn', label: 'ISBN', type: 'text', placeholder: '例如：978-7-04-012345-6' },
        { name: 'courseCode', label: '课程代码', type: 'text', placeholder: '例如：CS101' },
        { name: 'moduleName', label: '模块名称', type: 'text', placeholder: '例如：高等数学' },
        { name: 'edition', label: '版次', type: 'text', placeholder: '例如：第3版' },
        { name: 'author', label: '作者', type: 'text', placeholder: '例如：张三' },
    ],
    ELECTRONICS: [
        { name: 'brand', label: '品牌', type: 'text', placeholder: '例如：Apple' },
        { name: 'model', label: '型号', type: 'text', placeholder: '例如：iPhone 13' },
        { name: 'warrantyStatus', label: '保修状态', type: 'select', options: ['在保', '过保', '无保修'] },
        { name: 'purchaseDate', label: '原始购买日期', type: 'date' },
        { name: 'accessories', label: '包含配件', type: 'text', placeholder: '例如：充电器、数据线、包装盒' },
    ],
    FURNITURE: [
        { name: 'itemType', label: '物品类型', type: 'text', placeholder: '例如：书桌、椅子、床' },
        { name: 'size', label: '尺寸', type: 'text', placeholder: '例如：120cm x 60cm' },
        { name: 'material', label: '材质', type: 'text', placeholder: '例如：实木、金属、塑料' },
        { name: 'assemblyRequired', label: '是否需要组装', type: 'select', options: ['需要', '不需要', '已组装'] },
        { name: 'conditionDetails', label: '状况详情', type: 'textarea', placeholder: '详细描述物品的使用状况、磨损情况等' },
    ],
    APPAREL: [
        { name: 'size', label: '尺码', type: 'text', placeholder: '例如：M、L、XL' },
        { name: 'brand', label: '品牌', type: 'text', placeholder: '例如：Nike' },
        { name: 'material', label: '材质', type: 'text', placeholder: '例如：棉、聚酯纤维' },
        { name: 'color', label: '颜色', type: 'text', placeholder: '例如：黑色、蓝色' },
        { name: 'gender', label: '性别', type: 'select', options: ['男', '女', '中性'] },
    ],
    SPORTS: [
        { name: 'brand', label: '品牌', type: 'text', placeholder: '例如：Nike' },
        { name: 'size', label: '尺寸', type: 'text', placeholder: '例如：42码、M号' },
        { name: 'sportType', label: '运动类型', type: 'text', placeholder: '例如：篮球、足球、跑步' },
        { name: 'conditionDetails', label: '状况详情', type: 'textarea', placeholder: '详细描述物品的使用状况、磨损情况等' },
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
        if (field.type === 'select') {
            const options = field.options.map(opt => 
                `<option value="${opt}">${opt}</option>`
            ).join('');
            return `
                <div class="form-group category-field-group">
                    <label for="${field.name}" class="form-label">${field.label}</label>
                    <select id="${field.name}" name="${field.name}" class="form-control">
                        <option value="">请选择</option>
                        ${options}
                    </select>
                </div>
            `;
        } else if (field.type === 'textarea') {
            return `
                <div class="form-group category-field-group">
                    <label for="${field.name}" class="form-label">${field.label}</label>
                    <textarea 
                        id="${field.name}" 
                        name="${field.name}" 
                        class="form-control" 
                        rows="3"
                        placeholder="${field.placeholder || ''}"
                    ></textarea>
                </div>
            `;
        } else {
            return `
                <div class="form-group category-field-group">
                    <label for="${field.name}" class="form-label">${field.label}</label>
                    <input 
                        type="${field.type}" 
                        id="${field.name}" 
                        name="${field.name}" 
                        class="form-control" 
                        placeholder="${field.placeholder || ''}"
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
        alert(`最多只能上传5张图片，您还可以上传${remainingSlots}张`);
        return;
    }

    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            alert(`图片 ${file.name} 超过5MB，请选择较小的图片`);
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert(`文件 ${file.name} 不是图片格式`);
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
        alert('请至少上传一张图片');
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

    // 添加图片（实际应该上传到服务器，这里先模拟）
    // 注意：实际实现中，图片应该先上传到服务器获取URL，然后再提交物品数据
    itemData.images = selectedImages.map(img => img.preview); // 临时使用base64，实际应该使用服务器URL

    try {
        // 显示加载状态
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '发布中...';

        // 调用API
        const response = await ItemAPI.createItem(itemData);
        
        if (response.success) {
            alert('物品发布成功！');
            window.location.href = `item-detail.html?id=${response.itemId || response.data?.id || response.id}`;
        } else {
            throw new Error(response.message || '发布失败');
        }
    } catch (error) {
        console.error('发布物品失败:', error);
        alert('发布失败：' + (error.message || '请稍后重试'));
        
        // 恢复按钮状态
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = '发布物品';
    }
});

