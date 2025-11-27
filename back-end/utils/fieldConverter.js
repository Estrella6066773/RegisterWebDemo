/**
 * 字段名称转换工具
 */

/**
 * 将 snake_case 转换为 camelCase
 * @param {string} str - snake_case 字符串
 * @returns {string} camelCase 字符串
 */
function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * 将 camelCase 转换为 snake_case
 * @param {string} str - camelCase 字符串
 * @returns {string} snake_case 字符串
 */
function toSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * 转换对象的所有键名从 snake_case 到 camelCase
 * @param {Object} obj - 原始对象
 * @returns {Object} 转换后的对象
 */
function convertKeysToCamelCase(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysToCamelCase(item));
    }

    const converted = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const camelKey = toCamelCase(key);
            converted[camelKey] = convertKeysToCamelCase(obj[key]);
        }
    }
    return converted;
}

/**
 * 转换物品数据
 * @param {Object|Array} item - 物品数据
 * @returns {Object|Array} 转换后的物品数据
 */
function convertItemData(item) {
    if (Array.isArray(item)) {
        return item.map(convertItemData);
    }

    if (!item || typeof item !== 'object') {
        return item;
    }

    const converted = convertKeysToCamelCase(item);
    
    // 特殊处理：确保日期字段是数字（时间戳）
    if (converted.postDate && typeof converted.postDate === 'number') {
        // 已经是时间戳，保持不变
    }
    
    // 特殊处理：确保 images 是数组
    if (converted.images && typeof converted.images === 'string') {
        try {
            converted.images = JSON.parse(converted.images);
        } catch (e) {
            converted.images = [];
        }
    }
    
    return converted;
}

/**
 * 转换对象的所有键名从 camelCase 到 snake_case
 * @param {Object} obj - 原始对象
 * @returns {Object} 转换后的对象
 */
function convertKeysToSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysToSnakeCase(item));
    }

    const converted = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const snakeKey = toSnakeCase(key);
            converted[snakeKey] = convertKeysToSnakeCase(obj[key]);
        }
    }
    return converted;
}

/**
 * 转换前端发送的物品数据为后端格式
 * @param {Object} itemData - 前端发送的物品数据（camelCase）
 * @returns {Object} 后端格式的物品数据（snake_case）
 */
function convertItemDataFromFrontend(itemData) {
    // 字段映射表（前端camelCase -> 后端snake_case）
    const fieldMap = {
        courseCode: 'course_code',
        moduleName: 'module_name',
        // 电子产品字段：兼容简单命名和更语义化命名
        model: 'model_number',
        modelNumber: 'model_number',
        warrantyStatus: 'warranty_status',
        purchaseDate: 'original_purchase_date',
        originalPurchaseDate: 'original_purchase_date',
        accessories: 'accessories_included',
        accessoriesIncluded: 'accessories_included',
        itemType: 'item_type',
        assemblyRequired: 'assembly_required',
        conditionDetails: 'condition_details',
        clothingBrand: 'clothing_brand',
        materialType: 'material_type',
        sportsBrand: 'sports_brand',
        sizeDimensions: 'size_dimensions',
        sportType: 'sport_type',
        sportsConditionDetails: 'sports_condition_details'
    };

    const converted = { ...itemData };
    
    // 转换字段名
    for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
        if (converted.hasOwnProperty(camelKey)) {
            converted[snakeKey] = converted[camelKey];
            delete converted[camelKey];
        }
    }

    return converted;
}

module.exports = {
    convertKeysToCamelCase,
    convertKeysToSnakeCase,
    convertItemData,
    convertItemDataFromFrontend,
    toCamelCase,
    toSnakeCase
};

