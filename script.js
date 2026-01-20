document.addEventListener('DOMContentLoaded', function () {
    const mainContent = document.getElementById('main-content');
    const backToTopBtn = document.getElementById('backToTop');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const searchInput = document.getElementById('searchInput');
    const searchWrapper = document.getElementById('searchWrapper');
    const searchToggleBtn = document.getElementById('searchToggleBtn');
    const searchResultsSection = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');
    const closeSearchBtn = document.getElementById('closeSearch');
    const articlesMenuLink = document.getElementById('articlesMenuLink');

    let globalData = null;

    // تحميل البيانات مع منع التخزين المؤقت (Cache Busting)
    fetch('data.json?v=' + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            globalData = data;
            initApp(data);
        })
        .catch(err => {
            console.error('خطأ في تحميل البيانات:', err);
            document.getElementById('latest-articles-list').innerHTML = '<p class="text-center">عذراً، تعذر تحميل البيانات حالياً.</p>';
        });

    function initApp(data) {
        setupSearch();
        window.addEventListener('hashchange', () => handleRoute(data));
        handleRoute(data);
    }

    // خوارزمية البحث التقريبي
    function getSimilarity(s1, s2) {
        let longer = s1.toLowerCase(), shorter = s2.toLowerCase();
        if (s1.length < s2.length) { longer = s2; shorter = s1; }
        let longerLength = longer.length;
        if (longerLength === 0) return 1.0;
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    function editDistance(s1, s2) {
        let costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    function setupSearch() {
        if (!searchToggleBtn) return;
        searchToggleBtn.addEventListener('click', () => {
            searchWrapper.classList.toggle('active');
            if (searchWrapper.classList.contains('active')) {
                searchInput.focus();
            } else if (searchInput.value.trim()) {
                doSearch();
            }
        });

        const doSearch = () => {
            const query = searchInput.value.toLowerCase().trim();
            if (!query) return;
            let results = [];
            globalData.categories.forEach(cat => {
                const items = [...(cat.articles || []), ...(cat.videos || [])];
                items.forEach(item => {
                    let score = item.title.toLowerCase().includes(query) ? 1 : getSimilarity(query, item.title);
                    if (score > 0.4) results.push({...item, type: item.youtube_id ? 'video' : 'article', catName: cat.name, score: score});
                });
            });
            results.sort((a, b) => b.score - a.score);
            renderSearchResults(results.slice(0, 6));
        };

        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });
    }

    function renderSearchResults(results) {
        mainContent.classList.add('d-none');
        searchResultsSection.classList.remove('d-none');
        searchResultsList.innerHTML = results.length ? results.map(item => createCard(item)).join('') : '<p class="text-center w-100">لا توجد نتائج قريبة.</p>';
        window.scrollTo(0, 0);
    }

    function createCard(item) {
        const isArticle = item.type === 'article';
        const slug = isArticle ? item.slug : item.youtube_id;
        const href = isArticle ? `#article/${slug}` : `#video/${slug}`;
        const image = item.image || (item.youtube_id ? `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg` : 'https://via.placeholder.com/400x250' );
        return `
            <a href="${href}" class="article-card">
                <div class="article-image-wrapper">
                    <img src="${image}" alt="${item.title}" class="article-image" onerror="this.src='https://via.placeholder.com/400x250'">
                    <span class="badge">${isArticle ? 'مقال' : 'فيديو'}</span>
                </div>
                <div class="article-content">
                    <small>${item.catName || ''}</small>
                    <h3>${item.title}</h3>
                </div>
            </a>
        `;
    }

    function handleRoute(data ) {
        const hash = window.location.hash;
        searchResultsSection.classList.add('d-none');
        mainContent.classList.remove('d-none');
        if (hash.startsWith('#category/')) {
            const cat = data.categories.find(c => c.slug === decodeURIComponent(hash.replace('#category/', '')));
            if (cat) showCategory(cat);
        } else if (hash.startsWith('#article/')) {
            let art = null;
            data.categories.forEach(c => { const found = c.articles?.find(a => a.slug === decodeURIComponent(hash.replace('#article/', ''))); if(found) art = found; });
            if (art) showArticle(art);
        } else if (hash.startsWith('#video/')) {
            let vid = null;
            data.categories.forEach(c => { const found = c.videos?.find(v => v.youtube_id === hash.replace('#video/', '')); if(found) vid = found; });
            if (vid) showVideo(vid);
        } else {
            showHome();
        }
    }

    function showHome() {
        mainContent.innerHTML = `
            <section id="home" class="hero">
                <div class="container text-center">
                    <h1>مكتبة الفيديوهات الصيدلانية</h1>
                    <p>وجهتك الموثوقة لتعلم الصيدلة بأسلوب مبسط</p>
                    <a href="#categories" class="btn-primary">استكشف التصنيفات</a>
                </div>
            </section>
            <section class="section-padding"><div class="container"><h2 class="section-title">أحدث المحتوى</h2><div id="latest-articles-list" class="article-grid"></div></div></section>
            <section id="categories" class="section-padding bg-light"><div class="container"><h2 class="section-title">التصنيفات</h2><div id="categories-list" class="category-grid"></div></div></section>
        `;
        const catGrid = document.getElementById('categories-list');
        const latestGrid = document.getElementById('latest-articles-list');
        catGrid.innerHTML = globalData.categories.map(cat => `
            <a href="#category/${cat.slug}" class="category-card">
                <i class="${cat.icon || 'fas fa-pills'}"></i>
                <h3>${cat.name}</h3>
            </a>
        `).join('');
        const all = [];
        globalData.categories.forEach(c => {
            c.articles?.forEach(a => all.push({...a, type:'article', catName:c.name}));
            c.videos?.forEach(v => all.push({...v, type:'video', catName:c.name}));
        });
        latestGrid.innerHTML = all.slice(-6).reverse().map(i => createCard(i)).join('');
    }

    function showCategory(cat) {
        mainContent.innerHTML = `<section class="section-padding"><div class="container"><h2 class="section-title">${cat.name}</h2><div class="article-grid">
            ${(cat.articles || []).map(a => createCard({...a, type:'article', catName:cat.name})).join('')}
            ${(cat.videos || []).map(v => createCard({...v, type:'video', catName:cat.name})).join('')}
        </div></div></section>`;
    }

    function showArticle(art) {
        mainContent.innerHTML = `<div class="container my-5"><h1>${art.title}</h1><div style="white-space: pre-wrap;">${art.content}</div></div>`;
    }

    function showVideo(vid) {
        mainContent.innerHTML = `<div class="container my-5"><h1>${vid.title}</h1><iframe width="100%" height="500" src="https://www.youtube.com/embed/${vid.youtube_id}" frameborder="0" allowfullscreen></iframe></div>`;
    }
} );
