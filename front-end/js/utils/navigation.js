/**
 * ============================================
 * 导航工具 - Navigation Utilities
 * 根据登录状态更新导航栏显示
 * ============================================
 */

let navigationInitialized = false;

function getLabelText(element, isLoggedIn) {
    if (!element) return '';
    
    const lang = (typeof I18n !== 'undefined' && typeof I18n.getLang === 'function')
        ? I18n.getLang()
        : 'en';
        
    const baseAttr = isLoggedIn ? 'labelLoggedIn' : 'labelLoggedOut';
    const langAttr = `${baseAttr}${lang === 'zh' ? 'Zh' : 'En'}`;
    
    if (element.dataset[langAttr]) {
        return element.dataset[langAttr];
    }
    
    if (element.dataset[baseAttr]) {
        return element.dataset[baseAttr];
    }
    
    if (typeof I18n !== 'undefined' && typeof I18n.t === 'function') {
        const fallbackKey = isLoggedIn ? 'common.nav.profile' : 'common.nav.login';
        return I18n.t(fallbackKey);
    }
    
    return isLoggedIn ? 'Profile' : 'Log In';
}

function toggleAuthElements(isLoggedIn) {
    const loggedInElements = document.querySelectorAll('[data-auth="logged-in"]');
    const loggedOutElements = document.querySelectorAll('[data-auth="logged-out"]');
    
    loggedInElements.forEach(el => {
        el.style.display = isLoggedIn ? '' : 'none';
    });
    
    loggedOutElements.forEach(el => {
        el.style.display = isLoggedIn ? 'none' : '';
    });
}

function updateProfileMenu(isLoggedIn) {
    const profileMenuLabel = document.getElementById('profileMenuLabel');
    const profileMenuToggle = document.getElementById('profileMenuToggle');
    
    if (profileMenuLabel) {
        profileMenuLabel.textContent = getLabelText(profileMenuLabel, isLoggedIn);
    }
    
    if (profileMenuToggle) {
        profileMenuToggle.setAttribute('href', isLoggedIn ? '/pages/profile.html' : '/pages/login.html');
    }
}

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
    toggleAuthElements(isLoggedIn);
    updateProfileMenu(isLoggedIn);
}

function bindLogoutHandler() {
    const logoutLink = document.getElementById('logoutLink');
    if (!logoutLink) return false;
    
    logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        
        const confirmText = (typeof I18n !== 'undefined' && typeof I18n.t === 'function')
            ? I18n.t('common.logoutConfirm')
            : '确定要退出登录吗？';
        
        if (typeof clearAuth === 'function' && confirm(confirmText)) {
            clearAuth();
            updateNavigation();
            window.location.href = '/pages/login.html';
        }
    });
    
    return true;
}

/**
 * 初始化导航（页面加载时调用）
 */
function initNavigation() {
    updateNavigation();
    
    if (!navigationInitialized) {
        navigationInitialized = bindLogoutHandler();
    }
}

// 页面加载或导航渲染时初始化
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initNavigation);
    document.addEventListener('navbar:rendered', initNavigation);
}

