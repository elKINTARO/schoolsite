document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.content-right');
    if (!container) return;

    // Replace existing content with a list container
    container.innerHTML = '<div class="posts-list" id="postsList"></div>';
    const list = document.getElementById('postsList');

    try {
        const resp = await fetch('http://localhost:8000/api/posts/');
        const payload = await resp.json();
        const results = payload.results || [];

        if (results.length === 0) {
            list.innerHTML = '<div class="post-container"><div class="post-content"><p>Поки що немає публікацій.</p></div></div>';
            return;
        }

        results.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'post-container';
            const date = new Date(post.created_at);
            const dateStr = date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });

            postEl.innerHTML = `
                <div class="post-header-with-label">
                    <div class="post-header">
                        <div class="post-avatar"></div>
                        <div class="post-info">
                            <h3 class="post-title">${escapeHtml(post.title)}</h3>
                            <div class="post-meta">
                                <span class="post-author">${escapeHtml(post.author || 'Редактор')}</span>
                                <span class="post-date">${dateStr}</span>
                            </div>
                        </div>
                    </div>
                </div>
                ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Зображення посту"></div>` : ''}
                <div class="post-content"><p>${escapeHtml(post.content).replace(/\n/g, '<br>')}</p></div>
            `;
            list.appendChild(postEl);
        });
    } catch (e) {
        list.innerHTML = '<div class="post-container"><div class="post-content"><p>Не вдалося завантажити пости. Перевірте підключення до серверу.</p></div></div>';
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
});


