document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    let currentHighlight = -1;
    let highlights = [];
    let lastQuery = '';
    let rerunTimer = null;


    // Функція для очищення всіх виділень
    function clearHighlights(rootElement = document.body) {
        const spansToClear = rootElement.querySelectorAll('.search-highlight');
        spansToClear.forEach(span => {
            const parent = span.parentNode;
            // Розгортаємо span, зберігаючи його дочірні вузли (оригінальний текст)
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
            }
            parent.removeChild(span);
            parent.normalize(); // Об'єднуємо сусідні текстові вузли
        });
        highlights = []; // Clear the global highlights array
        currentHighlight = -1;
    }

    // Функція для екранування спеціальних символів регулярних виразів
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the matched substring
    }

    function highlightText(searchText, rootElement = document.body) {
        if (!searchText) return;

        lastQuery = searchText; // Update lastQuery here

        const regex = new RegExp(escapeRegExp(searchText), 'gi');

        // Clear highlights only within the specified rootElement
        clearHighlights(rootElement);

        const roots = [rootElement]; // Use the provided rootElement for traversal

        roots.forEach(root => {
            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Only accept text nodes that are not empty
                        if (node.nodeValue.trim().length > 0) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_REJECT;
                    }
                },
                false
            );

            const textNodes = [];
            let node;
            while ((node = walker.nextNode())) {
                textNodes.push(node);
            }

            textNodes.forEach(node => {
                const parent = node.parentNode;
                const text = node.nodeValue;
                const fragments = [];

                regex.lastIndex = 0; // Reset regex lastIndex for each text node
                let lastIndex = 0;
                let match;

                // Find all matches in the current text node
                while ((match = regex.exec(text)) !== null) {
                    // Add text before the match
                    if (match.index > lastIndex) {
                        fragments.push(document.createTextNode(text.substring(lastIndex, match.index)));
                    }

                    // Add the highlighted span
                    const span = document.createElement('span');
                    span.className = 'search-highlight';
                    span.textContent = match[0];
                    fragments.push(span);

                    lastIndex = regex.lastIndex;
                }

                // Add any remaining text after the last match
                if (lastIndex < text.length) {
                    fragments.push(document.createTextNode(text.substring(lastIndex)));
                }

                // Replace the original text node with the new fragments
                if (fragments.length > 0) {
                    node.replaceWith(...fragments);
                }
            });
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
            const searchText = searchInput.value.trim();
            const postContent = document.querySelector('.post-content');

            if (searchText.length >= 2) {
                if (e.shiftKey && highlights.length > 0) {
                    // Shift + Enter - перехід до попереднього результату
                    currentHighlight = (currentHighlight - 1 + highlights.length) % highlights.length;
                } else if (highlights.length > 0) {
                    // Enter - перехід до наступного результату
                    currentHighlight = (currentHighlight + 1) % highlights.length;
                } else {
                    // Якщо немає підсвічувань, створюємо нові
                    if (postContent) {
                        highlightText(searchText, postContent);
                    } else {
                        highlightText(searchText);
                    }
                }
                scrollToHighlight();
            } else {
                clearHighlights(postContent || document.body);
                lastQuery = '';
            }
        }
    });

    // Обробник кліку на іконку пошуку
    const searchIcon = document.querySelector('.search-icon');
    searchIcon.addEventListener('click', () => {
        const searchText = searchInput.value.trim();
        const postContent = document.querySelector('.post-content');
        if (searchText.length >= 2) {
            if (postContent) {
                highlightText(searchText, postContent);
            } else {
                highlightText(searchText);
            }
        } else {
            clearHighlights(postContent || document.body);
            lastQuery = '';
        }
    });



    // Initial highlighting if there's a query in the input field on page load
    const initialSearchText = searchInput.value.trim();
    if (initialSearchText) {
        const postContent = document.querySelector('.post-content');
        if (postContent) {
            highlightText(initialSearchText, postContent);
        } else {
            highlightText(initialSearchText);
        }
    }

    // Rerun highlighting when the page content might have changed (e.g., dynamic loading)
    // This is a simplified example; a more robust solution might involve MutationObserver
    // or specific event listeners for content changes.
    // For now, we'll assume a simple timer for demonstration.
    // You might want to adjust this based on your application's needs.
    // For example, if you have a single-page application, you might want to re-run
    // highlighting after a route change or content update.
    // This is a placeholder for more sophisticated content change detection.
    // The current implementation will re-run highlighting every 100ms if lastQuery is set.
    // This is not ideal for performance but serves as a basic example.
    // Consider using a MutationObserver for more efficient content change detection.
    // For example:
    // const observer = new MutationObserver(mutations => {
    //     if (lastQuery) {
    //         highlightText(lastQuery);
    //     }
    // });
    // observer.observe(document.body, { childList: true, subtree: true });

    // Clear any existing rerun timer
    if (rerunTimer) {
        clearTimeout(rerunTimer);
    }
    // Set a new rerun timer
    rerunTimer = setTimeout(() => {
        if (lastQuery) {
            const postContent = document.querySelector('.post-content');
            if (postContent) {
                highlightText(lastQuery, postContent);
            } else {
                highlightText(lastQuery);
            }
        }
    }, 100);
});
