/**
 * ============================================
 * 导航工具 - Navigation Utilities
 * 根据登录状态更新导航栏显示
 * ============================================
 */

/**
 * 更新导航栏显示状态
 * 根据登录状态显示/隐藏相应的导航项
 */
function updateNavigation() {
    if (typeof isAuthenticated === 'undefined') {
        console.warn('isAuthenticated 函数未定义，请确保已加载 auth.js');
        return;
    }
    
    const isLoggedIn = isAuthenticated();
    
    // 获取导航元素
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const profileDropdown = document.querySelector('.nav-dropdown');
    const logoutLink = document.getElementById('logoutLink');
    
    if (isLoggedIn) {
        // 已登录：隐藏登录和注册按钮，显示个人中心和退出登录
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'block';
        if (profileDropdown) profileDropdown.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        // 未登录：显示登录和注册按钮，隐藏个人中心和退出登录
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
        if (profileDropdown) profileDropdown.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

/**
 * 初始化导航（页面加载时调用）
 */
function initNavigation() {
    // 更新导航显示
    updateNavigation();
    
    // 监听登录状态变化（如果使用事件）
    // 当用户登录或登出时，可以调用 updateNavigation() 更新导航
}

// 页面加载时自动初始化导航
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
    });
}

