

(function () {
    function renderNavbar() {
        if (typeof document === 'undefined') return;

        const header = document.getElementById('siteHeader');
        if (!header) return;

        const activeKey = (document.body && document.body.dataset.navActive) || 'home';

        header.innerHTML = `
            <div class="header">
                <div class="container">
                    <div class="header-content">
                        <a href="/index.html" class="logo" data-i18n-key="common.nav.logo">学生港湾</a>
                        <nav class="nav">
                            <a href="/index.html" class="nav-link" data-nav-item="home" data-i18n-key="common.nav.home">首页</a>
                            <div class="nav-dropdown" data-nav-item="browse">
                                <a href="/pages/items.html" class="nav-link nav-dropdown-toggle" data-i18n-key="common.nav.items">浏览宝贝 ▾</a>
                                <div class="dropdown-menu">
                                    <a href="/pages/items.html" class="dropdown-item" data-i18n-key="common.nav.items">浏览宝贝</a>
                                    <a href="/pages/my-items.html" class="dropdown-item" data-i18n-key="common.nav.myItems">我的宝贝</a>
                                    <a href="/pages/post-item.html" class="dropdown-item" data-i18n-key="common.nav.postItem">发布物品</a>
                                </div>
                            </div>
                            <div class="nav-dropdown nav-profile" data-nav-item="profile">
                                <a href="/pages/profile.html" class="nav-link nav-dropdown-toggle" id="profileMenuToggle">
                                    <span
                                        id="profileMenuLabel"
                                        data-label-logged-in="Profile"
                                        data-label-logged-out="Not Logged In"
                                        data-label-logged-in-zh="个人中心"
                                        data-label-logged-out-zh="未登录"
                                        data-label-logged-in-en="Profile"
                                        data-label-logged-out-en="Not Logged In"
                                        data-i18n-key="common.nav.profile"
                                        data-i18n-zh="个人中心"
                                    >Profile</span> ▾
                                </a>
                                <div class="dropdown-menu" id="profileMenu">
                                    <a href="/pages/profile.html" class="dropdown-item" id="profileLink" data-auth="logged-in" data-i18n-key="common.nav.profile">个人资料</a>
                                    <a href="#" class="dropdown-item" id="logoutLink" data-auth="logged-in" data-i18n-key="common.nav.logout">退出登录</a>
                                    <a href="/pages/login.html" class="dropdown-item" id="loginLink" data-auth="logged-out" data-i18n-key="common.nav.login">登录</a>
                                    <a href="/pages/register.html" class="dropdown-item" id="registerLink" data-auth="logged-out" data-i18n-key="common.nav.signup">注册</a>
                                </div>
                            </div>
                            <button type="button" class="lang-toggle" id="languageToggle" aria-label="切换到英文">EN</button>
                        </nav>
                    </div>
                </div>
            </div>
        `;

        const activeContainer = header.querySelector(`[data-nav-item="${activeKey}"]`);
        if (activeContainer) {
            const activeNav = activeContainer.classList.contains('nav-link')
                ? activeContainer
                : activeContainer.querySelector('.nav-link');
            if (activeNav) {
                activeNav.classList.add('active');
            }
        }

        if (window.I18n && typeof window.I18n.refresh === 'function') {
            window.I18n.refresh();
        }

        document.dispatchEvent(new CustomEvent('navbar:rendered'));
    }

    document.addEventListener('DOMContentLoaded', renderNavbar);
})();


