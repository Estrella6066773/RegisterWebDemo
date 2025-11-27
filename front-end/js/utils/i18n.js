
(function () {
    const STORAGE_KEY = 'appLang';
    const DEFAULT_LANG = 'en';
    const SUPPORTED_LANGS = ['zh', 'en'];
    const TEXT_MAP = window.I18N_TEXT_MAP || {};
    const PRESERVE_ATTR = 'data-i18n-preserve';

    const MESSAGE_MAP = {
        zh: {
            common: {
                logoutConfirm: '确定要退出登录吗？',
            },
        },
        en: {
            common: {
                logoutConfirm: 'Are you sure you want to log out?',
            },
        },
    };

    let currentLang = DEFAULT_LANG;

    /**
     * 从元素中获取文本或 HTML
     */
    function getElementContent(el) {
        return el.getAttribute('data-i18n-type') === 'html'
            ? el.innerHTML
            : el.textContent;
    }

    /**
     * 设置元素文本或 HTML
     */
    function setElementContent(el, value) {
        if (value === null || value === undefined) return;
        if (el.getAttribute('data-i18n-type') === 'html') {
            el.innerHTML = value;
        } else {
            el.textContent = value;
        }
    }

    /**
     * 缓存中文默认值，避免重复填写
     */
    function cacheDefaultTexts() {
        const elements = document.querySelectorAll('[data-i18n-en], [data-i18n-zh], [data-i18n-key]');
        elements.forEach((el) => {
            if (el.hasAttribute(PRESERVE_ATTR)) return;
            if (!el.hasAttribute('data-i18n-zh')) {
                el.setAttribute('data-i18n-zh', getElementContent(el).trim());
            }
        });
    }

    function getTextFromMap(key, lang = currentLang) {
        if (!key) return null;
        const langMap = TEXT_MAP[lang];
        if (!langMap) return null;
        return Object.prototype.hasOwnProperty.call(langMap, key)
            ? langMap[key]
            : null;
    }

    /**
     * 通用属性翻译（placeholder、value 等）
     */
    function applyAttributeTranslations(attrName) {
        const selector = `[data-i18n-${attrName}-zh], [data-i18n-${attrName}-en], [data-i18n-${attrName}-key]`;
        document.querySelectorAll(selector).forEach((el) => {
            if (el.hasAttribute(PRESERVE_ATTR)) return;
            const zhAttr = `data-i18n-${attrName}-zh`;
            const enAttr = `data-i18n-${attrName}-en`;
            const keyAttr = `data-i18n-${attrName}-key`;

            if (!el.hasAttribute(zhAttr)) {
                const currentValue = el.getAttribute(attrName) || '';
                el.setAttribute(zhAttr, currentValue);
            }

            const key = el.getAttribute(keyAttr);
            if (key) {
                if (currentLang === 'zh') {
                    const zhValue = el.getAttribute(zhAttr);
                    if (zhValue !== null) {
                        el.setAttribute(attrName, zhValue);
                    }
                } else {
                    const mapped = getTextFromMap(key);
                    if (mapped !== null) {
                        el.setAttribute(attrName, mapped);
                    }
                }
                return;
            }

            const targetAttr = currentLang === 'zh' ? zhAttr : enAttr;
            const value = el.getAttribute(targetAttr);
            if (value !== null) {
                el.setAttribute(attrName, value);
            }
        });
    }

    /**
     * 应用页面文本翻译
     */
    function applyTranslations() {
        cacheDefaultTexts();

        const elements = document.querySelectorAll('[data-i18n-zh], [data-i18n-en], [data-i18n-key]');
        elements.forEach((el) => {
            if (el.hasAttribute(PRESERVE_ATTR)) return;
            const key = el.getAttribute('data-i18n-key');
            if (key) {
                if (currentLang === 'zh') {
                    // 中文：优先使用 data-i18n-zh 属性，如果没有则从 TEXT_MAP 获取
                    const zhValue = el.getAttribute('data-i18n-zh');
                    if (zhValue !== null && zhValue !== '') {
                        setElementContent(el, zhValue);
                    } else {
                        const mappedValue = getTextFromMap(key, 'zh');
                        if (mappedValue !== null) {
                            setElementContent(el, mappedValue);
                        }
                    }
                } else {
                    // 英文：从 TEXT_MAP 获取
                    const mappedValue = getTextFromMap(key, 'en');
                    if (mappedValue !== null) {
                        setElementContent(el, mappedValue);
                    }
                }
                return;
            }

            // 处理只有 data-i18n-zh 或 data-i18n-en 属性的元素
            const targetAttr = `data-i18n-${currentLang}`;
            const value = el.getAttribute(targetAttr);
            if (value !== null) {
                setElementContent(el, value);
            }
        });

        applyAttributeTranslations('placeholder');
        applyAttributeTranslations('value');
        applyAttributeTranslations('aria-label');
        applyAttributeTranslations('alt');

        document.documentElement.setAttribute('lang', currentLang === 'zh' ? 'zh-CN' : 'en');
        updateToggleButton();
    }

    /**
     * 读取存储语言
     */
    function getStoredLanguage() {
        const stored = window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
        if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
        return DEFAULT_LANG;
    }

    /**
     * 保存语言
     */
    function persistLanguage(lang) {
        try {
            if (window.localStorage) {
                localStorage.setItem(STORAGE_KEY, lang);
            }
        } catch (err) {
            // 忽略存储失败
        }
    }

    /**
     * 更新切换按钮文本
     */
    function updateToggleButton() {
        const toggle = document.getElementById('languageToggle');
        if (!toggle) return;
        const nextLangLabel = currentLang === 'zh' ? 'EN' : '中';
        toggle.textContent = nextLangLabel;

        const ariaAttr = currentLang === 'zh'
            ? '切换到英文'
            : 'Switch to Chinese';
        toggle.setAttribute('aria-label', ariaAttr);
    }

    /**
     * 初始化切换按钮
     */
    function initToggleButton() {
        const toggle = document.getElementById('languageToggle');
        if (!toggle || toggle.dataset.i18nBound === 'true') return;
        toggle.addEventListener('click', () => {
            const nextLang = currentLang === 'zh' ? 'en' : 'zh';
            setLanguage(nextLang, true);
        });
        toggle.dataset.i18nBound = 'true';
        updateToggleButton();
    }

    /**
     * 设置语言
     */
    function setLanguage(lang, persist = false) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            lang = DEFAULT_LANG;
        }
        currentLang = lang;
        if (persist) {
            persistLanguage(lang);
        }
        applyTranslations();
        // 触发语言切换事件，让其他模块可以响应
        document.dispatchEvent(new CustomEvent('i18n:languageChanged', { 
            detail: { lang: currentLang } 
        }));
    }

    /**
     * 获取动态消息
     */
    function translate(key, fallback = '') {
        // 首先尝试从 TEXT_MAP 中获取（包含所有翻译）
        const textFromMap = getTextFromMap(key, currentLang);
        if (textFromMap !== null) {
            return textFromMap;
        }

        // 如果 TEXT_MAP 中没有，尝试从 MESSAGE_MAP 中获取
        const segments = key.split('.');
        let cursor = MESSAGE_MAP[currentLang];
        for (const segment of segments) {
            if (!cursor || typeof cursor !== 'object') {
                cursor = null;
                break;
            }
            cursor = cursor[segment];
        }

        if (typeof cursor === 'string') return cursor;

        // 使用中文作为默认回退（从 TEXT_MAP）
        const zhTextFromMap = getTextFromMap(key, 'zh');
        if (zhTextFromMap !== null) {
            return zhTextFromMap;
        }

        // 最后尝试从 MESSAGE_MAP 的中文版本获取
        let zhCursor = MESSAGE_MAP['zh'];
        for (const segment of segments) {
            if (!zhCursor || typeof zhCursor !== 'object') {
                zhCursor = null;
                break;
            }
            zhCursor = zhCursor[segment];
        }
        if (typeof zhCursor === 'string') return zhCursor;

        return fallback || key;
    }

    /**
     * 初始化
     */
    function init() {
        currentLang = getStoredLanguage();
        applyTranslations();
        initToggleButton();
    }

    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', init);
        document.addEventListener('navbar:rendered', () => {
            initToggleButton();
            updateToggleButton();
        });
    }

    window.I18n = {
        getLang: () => currentLang,
        setLang: (lang) => setLanguage(lang, true),
        t: translate,
        refresh: applyTranslations,
        preserve: (target) => {
            if (!target) return;
            const elements = Array.isArray(target) || NodeList.prototype.isPrototypeOf(target)
                ? target
                : typeof target === 'string'
                    ? document.querySelectorAll(target)
                    : [target];
            elements.forEach((el) => {
                if (el && el.setAttribute) {
                    el.setAttribute(PRESERVE_ATTR, 'true');
                }
            });
        },
    };
})();


