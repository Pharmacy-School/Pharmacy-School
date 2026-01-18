// script.js - النسخة المحدثة مع ميزة البحث وإدارة المقالات
document.addEventListener('DOMContentLoaded', function () {
    const categoryGrid = document.getElementById('categories-list');
    const latestArticlesEl = document.getElementById('latest-articles-list');
    const mainContent = document.getElementById('main-content');
    const backToTopBtn = document.getElementById('backToTop');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResultsSection = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');
    const closeSearchBtn = document.getElementById('closeSearch');
    const articlesMenuLink = document.getElementById('articlesMenuLink');

    let globalData = null;

    // Mobile Menu Toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Back to Top
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
        });
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Load Data
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            globalData = data;
            initApp(data);
        })
        .catch(err => console.error('Error loading data:', err));

    function initApp(data) {
        renderCategories(data.categories);
        renderLatestContent(data.categories);
        setupSearch();
        
        window.addEventListener('hashchange', () => handleRoute(data));
        handleRoute(data);
    }

    function renderCategories(categories) {
        if (!categoryGrid) return;
        categoryGrid.innerHTML = categories.map(cat => `
            <a href="#category/${cat.slug}" class="category-card">
                <i class="${cat.icon || 'fas fa-pills'}"></i>
                <h3>${cat.name}</h3>
                <span>${cat.articles.length} مقال • ${cat.videos.length} فيديو</span>
            </a>
        `).join('');
    }

    function renderLatestContent(categories) {
        if (!latestArticlesEl) return;
        const allItems = [];
        categories.forEach(cat => {
            cat.articles.forEach(a => allItems.push({...a, type: 'article', catName: cat.name}));
            cat.videos.forEach(v => allItems.push({...v, type: 'video', catName: cat.name}));
        });
        const latest = allItems.slice(-6).reverse();
        latestArticlesEl.innerHTML = latest.map(item => createCard(item)).join('');
    }

    function createCard(item) {
        const isArticle = item.type === 'article';
        const slug = isArticle ? item.slug : item.youtube_id;
        const href = isArticle ? `#article/${slug}` : `#video/${slug}`;
        const image = item.image || `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`;
        
        return `
            <a href="${href}" class="article-card">
                <div class="article-image-wrapper">
                    <img src="${image}" alt="${item.title}" class="article-image">
                    <span class="badge">${isArticle ? 'مقال' : 'فيديو'}</span>
                </div>
                <div class="article-content">
                    <small>${item.catName || ''}</small>
                    <h3>${item.title}</h3>
                    <div class="article-meta">
                        <span><i class="far fa-clock"></i> ${item.read_time || '5 دقائق'}</span>
                    </div>
                </div>
            </a>
        `;
    }

    function setupSearch() {
        const doSearch = () => {
            const query = searchInput.value.toLowerCase().trim();
            if (!query) return;

            const results = [];
            globalData.categories.forEach(cat => {
                cat.articles.forEach(a => {
                    if (a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query))
                        results.push({...a, type: 'article', catName: cat.name});
                });
                cat.videos.forEach(v => {
                    if (v.title.toLowerCase().includes(query))
                        results.push({...v, type: 'video', catName: cat.name});
                });
            });

            mainContent.classList.add('d-none');
            searchResultsSection.classList.remove('d-none');
            searchResultsList.innerHTML = results.length ? results.map(item => createCard(item)).join('') : '<p class="text-center w-100">لا توجد نتائج.</p>';
            window.scrollTo(0, 0);
        };

        searchBtn.addEventListener('click', doSearch);
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });
        closeSearchBtn.addEventListener('click', () => {
            searchResultsSection.classList.add('d-none');
            mainContent.classList.remove('d-none');
        });
    }

    if (articlesMenuLink) {
        articlesMenuLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '#all-articles';
        });
    }

    function handleRoute(data) {
        const hash = window.location.hash;
        if (navMenu) navMenu.classList.remove('active');
        searchResultsSection.classList.add('d-none');
        mainContent.classList.remove('d-none');

        if (hash.startsWith('#category/')) {
            const slug = decodeURIComponent(hash.replace('#category/', ''));
            const cat = data.categories.find(c => c.slug === slug);
            if (cat) showCategory(cat);
        } else if (hash.startsWith('#article/')) {
            const slug = decodeURIComponent(hash.replace('#article/', ''));
            let article = null;
            data.categories.forEach(cat => {
                const found = cat.articles.find(a => a.slug === slug);
                if (found) article = found;
            });
            if (article) showArticle(article);
        } else if (hash.startsWith('#video/')) {
            const id = hash.replace('#video/', '');
            let video = null;
            data.categories.forEach(cat => {
                const found = cat.videos.find(v => v.youtube_id === id);
                if (found) video = found;
            });
            if (video) showVideo(video);
        } else if (hash === '#all-articles') {
            showAllArticles(data);
        } else {
            showHome();
        }
    }

    function showHome() {
        mainContent.innerHTML = `
            <section id="home" class="hero">
                <div class="container text-center">
                    <div class="hero-content">
                        <h1>مكتبة الفيديوهات الصيدلانية</h1>
                        <p>وجهتك الموثوقة لتعلم الصيدلة بأسلوب مبسط وشيق</p>
                        <div class="hero-btns">
                            <a href="#categories" class="btn-primary">استكشف التصنيفات</a>
                        </div>
                    </div>
                </div>
            </section>
            <section class="section-padding"><div class="container"><h2 class="section-title">أحدث المحتوى</h2><div id="latest-articles-list" class="article-grid"></div></div></section>
            <section id="categories" class="section-padding bg-light"><div class="container"><h2 class="section-title">التصنيفات</h2><div id="categories-list" class="category-grid"></div></div></section>
        `;
        renderCategories(globalData.categories);
        renderLatestContent(globalData.categories);
        window.scrollTo(0, 0);
    }

    function showCategory(cat) {
        mainContent.innerHTML = `
            <section class="section-padding">
                <div class="container">
                    <a href="#" class="back-btn"><i class="fas fa-arrow-right"></i> الرئيسية</a>
                    <h2 class="section-title">${cat.name}</h2>
                    <div class="article-grid">
                        ${cat.articles.map(a => createCard({...a, type: 'article', catName: cat.name})).join('')}
                        ${cat.videos.map(v => createCard({...v, type: 'video', catName: cat.name})).join('')}
                    </div>
                </div>
            </section>
        `;
        window.scrollTo(0, 0);
    }

    function showArticle(article) {
        mainContent.innerHTML = `
            <div class="container my-5">
                <a href="javascript:history.back()" class="back-btn mb-4"><i class="fas fa-arrow-right"></i> العودة</a>
                <article class="article-page">
                    <h1>${article.title}</h1>
                    <img src="${article.image}" class="img-fluid rounded mb-4">
                    <div class="article-body" style="white-space: pre-wrap;">${article.content}</div>
                </article>
            </div>
        `;
        window.scrollTo(0, 0);
    }

    function showVideo(video) {
        mainContent.innerHTML = `
            <div class="container my-5">
                <a href="javascript:history.back()" class="back-btn mb-4"><i class="fas fa-arrow-right"></i> العودة</a>
                <h1 class="mb-4">${video.title}</h1>
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/${video.youtube_id}?autoplay=1" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        `;
        window.scrollTo(0, 0);
    }

    function showAllArticles(data) {
        const allArticles = [];
        data.categories.forEach(cat => {
            cat.articles.forEach(a => allArticles.push({...a, type: 'article', catName: cat.name}));
        });
        mainContent.innerHTML = `
            <section class="section-padding">
                <div class="container">
                    <a href="#" class="back-btn"><i class="fas fa-arrow-right"></i> الرئيسية</a>
                    <h2 class="section-title">جميع المقالات</h2>
                    <div class="article-grid">${allArticles.map(a => createCard(a)).join('')}</div>
                </div>
            </section>
        `;
        window.scrollTo(0, 0);
    }
});
