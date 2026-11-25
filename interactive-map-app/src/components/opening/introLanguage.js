// Opening language selector. Keep the surrounding React component unchanged.
export const INTRO_LANGUAGE_KEY = 'cart470.language';

const FRENCH = {
    begin: 'Touchez pour commencer',
    skip: 'Passer l’introduction',
    title: 'L’archipel d’Hochelaga',
    paragraphs: [
        'Au confluent du fleuve Saint-Laurent et de la rivière des Outaouais, des centaines d’îles et d’îlots forment l’archipel d’Hochelaga.',
        'Ensemble, elles forment un paysage de voies navigables, de lieux et d’histoires à découvrir.'
    ],
    explore: 'Explorer l’archipel',
    replay: 'Revoir l’animation'
};

export function getIntroLanguage() {
    try {
        return sessionStorage.getItem(INTRO_LANGUAGE_KEY) === 'fr' ? 'fr' : 'en';
    } catch {
        return 'en';
    }
}

// Change text nodes in place rather than replacing React-managed elements.
// Store the original English copy, including any icons or whitespace.
function bindCopy(element, french, preserveArrow = false) {
    if (!element) return () => {};
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.nodeValue.trim() || node.parentElement?.closest('svg, [aria-hidden="true"]')) {
                return NodeFilter.FILTER_REJECT;
            }
            // Standalone replay icons should remain untouched.
            if (preserveArrow && /^[↻⟳↺⟲]+$/u.test(node.nodeValue.trim())) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    const original = [];
    while (walker.nextNode()) {
        original.push({ node: walker.currentNode, text: walker.currentNode.nodeValue });
    }
    const originalLabel = element.getAttribute('aria-label');
    return (lang) => {
        original.forEach(({ node, text }, index) => {
            if (lang === 'en') {
                node.nodeValue = text;
            } else if (index === 0) {
                const arrow = preserveArrow ? text.match(/^\s*[↻⟳↺⟲]\s*/u)?.[0] ?? '' : '';
                node.nodeValue = arrow + french;
            } else {
                node.nodeValue = '';
            }
        });
        if (originalLabel !== null) {
            element.setAttribute('aria-label', lang === 'fr' ? french : originalLabel);
        }
    };
}

export function createIntroLanguage(stage, attract, overlay, skipButton) {
    let language = getIntroLanguage();
    const originalStageLang = stage.getAttribute('lang');
    const copy = [
        bindCopy(attract.querySelector('button'), FRENCH.begin),
        bindCopy(skipButton, FRENCH.skip),
        bindCopy(overlay.querySelector('#intro-title') || overlay.querySelector('h2'), FRENCH.title),
        ...FRENCH.paragraphs.map((text, index) =>
            bindCopy(overlay.querySelectorAll('#intro-copy p')[index], text)),
        bindCopy(overlay.querySelector('.intro-overlay__explore'), FRENCH.explore),
        bindCopy(overlay.querySelector('.intro-overlay__replay'), FRENCH.replay, true)
    ];

    const toggle = document.createElement('div');
    toggle.className = 'intro-language-toggle';
    toggle.setAttribute('role', 'group');
    const buttons = ['en', 'fr'].map((code) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'intro-language-toggle__button';
        button.textContent = code.toUpperCase();
        button.lang = code;
        button.setAttribute('aria-label', code === 'en' ? 'English' : 'Français');
        toggle.append(button);
        return button;
    });

    function apply() {
        stage.lang = language;
        toggle.setAttribute('aria-label', language === 'fr' ? 'Choisir la langue' : 'Choose language');
        copy.forEach((update) => update(language));
        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.lang === language));
        });
    }

    function select(event) {
        event.stopPropagation();
        if (toggle.hidden) return;
        const next = event.currentTarget.lang;
        if (next === language) return;
        language = next;
        try { sessionStorage.setItem(INTRO_LANGUAGE_KEY, language); } catch { /* Storage is optional. */ }
        apply();
        // Optional integration point for the main React map.
        window.dispatchEvent(new CustomEvent('cart470:languagechange', { detail: { language } }));
    }

    buttons.forEach((button) => button.addEventListener('click', select));
    stage.append(toggle);
    apply();

    return {
        getLanguage: () => language,
        show() { toggle.hidden = false; },
        hide() { toggle.hidden = true; },
        dispose() {
            buttons.forEach((button) => button.removeEventListener('click', select));
            toggle.remove();
            copy.forEach((update) => update('en'));
            if (originalStageLang === null) stage.removeAttribute('lang');
            else stage.setAttribute('lang', originalStageLang);
        }
    };
}
