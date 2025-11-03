document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    let currentHighlight = -1;
    let highlights = [];
    let lastQuery = '';
    let rerunTimer = null;

    // Функція для видалення попередніх підсвічувань
    function clearHighlights() {
        const highlighted = document.querySelectorAll('.search-highlight');
        highlighted.forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });
        highlights = [];
        currentHighlight = -1;
    }

    // Функція для підсвічування тексту
    function highlightText(searchText) {
        if (!searchText) return;

        clearHighlights();

        lastQuery = searchText;
        const regex = new RegExp(searchText, 'gi');

        // Обмежуємо область пошуку контентними блоками, включно з постами
        const scopes = document.querySelectorAll('.content-left, .content-right, .posts-list');
        const roots = scopes.length ? Array.from(scopes) : [document.body];

        roots.forEach(root => {
            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        const p = node.parentNode;
                        return p && p.tagName !== 'SCRIPT' &&
                               p.tagName !== 'STYLE' &&
                               !(p.classList && p.classList.contains('search-input'))
                            ? NodeFilter.FILTER_ACCEPT
                            : NodeFilter.FILTER_REJECT;
                    }
                }
            );

            let node;
            // eslint-disable-next-line no-cond-assign
            while (node = walker.nextNode()) {
                if (!node.textContent) continue;
                if (!regex.test(node.textContent)) continue;
                const wrapper = document.createElement('span');
                wrapper.innerHTML = node.textContent.replace(regex, m => `<span class="search-highlight">${m}</span>`);
                node.parentNode.replaceChild(wrapper, node);
            }
        });

        highlights = document.querySelectorAll('.search-highlight');
        if (highlights.length > 0) {
            currentHighlight = 0;
            scrollToHighlight();
        }
    }

    // Функція для прокрутки до підсвіченого тексту
    function scrollToHighlight() {
        if (currentHighlight >= 0 && currentHighlight < highlights.length) {
            highlights[currentHighlight].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Додаємо активний клас для поточного підсвічування
            highlights.forEach(h => h.classList.remove('search-highlight-active'));
            highlights[currentHighlight].classList.add('search-highlight-active');
        }
    }

    // Обробник події натискання клавіш
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey && highlights.length > 0) {
                // Shift + Enter - перехід до попереднього результату
                currentHighlight = (currentHighlight - 1 + highlights.length) % highlights.length;
            } else if (highlights.length > 0) {
                // Enter - перехід до наступного результату
                currentHighlight = (currentHighlight + 1) % highlights.length;
            } else {
                // Якщо немає підсвічувань, створюємо нові
                highlightText(searchInput.value.trim());
                return;
            }
            scrollToHighlight();
        }
    });

    // Обробник кліку на іконку пошуку
    const searchIcon = document.querySelector('.search-icon');
    searchIcon.addEventListener('click', () => {
        const searchText = searchInput.value.trim();
        if (searchText.length >= 2) {
            highlightText(searchText);
        } else {
            clearHighlights();
            lastQuery = '';
        }
    });

    // Обробник події введення тексту (тільки очищення підсвічування)
    searchInput.addEventListener('input', () => {
        clearHighlights();
        lastQuery = '';
    });

    // Пере-підсвічування, якщо пости завантажилися/змінилися після пошуку
    const postsList = document.getElementById('postsList');
    if (postsList) {
        const observer = new MutationObserver(() => {
            if (!lastQuery || lastQuery.length < 2) return;
            clearTimeout(rerunTimer);
            rerunTimer = setTimeout(() => highlightText(lastQuery), 100);
        });
        observer.observe(postsList, { childList: true, subtree: true });
    }
    });
