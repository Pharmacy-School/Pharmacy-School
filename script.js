// script.js - Improved Version
document.addEventListener('DOMContentLoaded', function () {
    const categoryGrid = document.getElementById('categories-list');
    const latestArticlesEl = document.getElementById('latest-articles-list');
    const mainContent = document.getElementById('main-content');
    const backToTopBtn = document.getElementById('backToTop');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    // Mobile Menu Toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Back to Top Button Logic
    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 400) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Data Loading
    let globalData = null;

    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('فشل في تحميل البيانات');
            return response.json();
        })
        .then(data => {
            globalData = data;
            initApp(data);
        })
        .catch(error => {
            console.error('Error:', error);
            if (latestArticlesEl) latestArticlesEl.innerHTML = '<p class="text-center">حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقاً.</p>';
        });

    function initApp(data) {
        renderCategories(data.categories);
        renderLatestContent(data.categories);
        
        // Routing
        window.addEventListener('hashchange', () => handleRoute(data));
        handleRoute(data);
    }

    function renderCategories(categories) {
        if (!categoryGrid) return;
        categoryGrid.innerHTML = '';
        
        categories.forEach(cat => {
            const card = document.createElement('a');
            card.href = `#category/${cat.slug}`;
            card.className = 'category-card';

            const iconClass = cat.icon || 'fas fa-pills';
            const articlesCount = cat.articles ? cat.articles.length : 0;
            const videosCount = cat.videos ? cat.videos.length : 0;

            card.innerHTML = `
                <i class="${iconClass}"></i>
                <h3>${cat.name}</h3>
                <span>${articlesCount} مقال • ${videosCount} فيديو</span>
            `;

            categoryGrid.appendChild(card);
        });
    }

    function renderLatestContent(categories) {
        if (!latestArticlesEl) return;
        latestArticlesEl.innerHTML = '';

        const allItems = [];
        categories.forEach(cat => {
            // Add articles
            if (cat.articles) {
                cat.articles.forEach(art => {
                    allItems.push({ ...art, type: 'article', categorySlug: cat.slug });
                });
            }
            // Add videos
            if (cat.videos) {
                cat.videos.forEach(vid => {
                    allItems.push({ ...vid, type: 'video', categorySlug: cat.slug });
                });
            }
        });

        // Get latest 6 items (assuming they are added in order)
        const latest = allItems.slice(-6).reverse();

        latest.forEach(item => {
            const card = document.createElement('a');
            const slug = item.slug || (item.youtube_id ? `video-${item.youtube_id}` : 'item');
            card.href = item.type === 'article' ? `#article/${slug}` : `#video/${item.youtube_id}`;
            card.className = 'article-card';
            
            const badgeText = item.type === 'article' ? 'مقال' : 'فيديو';
            const imageSrc = item.image || (item.youtube_id ? `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg` : 'https://via.placeholder.com/400x250');

            card.innerHTML = `
                <div class="article-image-wrapper">
                    <img src="${imageSrc}" alt="${item.title}" class="article-image" loading="lazy">
                    <span class="badge">${badgeText}</span>
                </div>
                <div class="article-content">
                    <h3>${item.title}</h3>
                    <div class="article-meta">
                        <span><i class="far fa-clock"></i> ${item.read_time || item.duration || '5 دقائق'}</span>
                        <span>اقرأ المزيد <i class="fas fa-chevron-left"></i></span>
                    </div>
                </div>
            `;

            latestArticlesEl.appendChild(card);
        });
    }

    function handleRoute(data) {
        const hash = window.location.hash;
        
        // Close mobile menu on navigation
        if (navMenu) navMenu.classList.remove('active');
        
        if (hash.startsWith('#category/')) {
            const slug = decodeURIComponent(hash.replace('#category/', ''));
            const category = data.categories.find(c => c.slug === slug);
            if (category) showCategory(category);
        } else if (hash.startsWith('#article/')) {
            const slug = decodeURIComponent(hash.replace('#article/', ''));
            let article = null;
            data.categories.forEach(cat => {
                const found = cat.articles?.find(a => a.slug === slug);
                if (found) article = found;
            });
            if (article) showArticle(article);
        } else if (hash.startsWith('#video/')) {
            const id = hash.replace('#video/', '');
            let video = null;
            data.categories.forEach(cat => {
                const found = cat.videos?.find(v => v.youtube_id === id);
                if (found) video = found;
            });
            if (video) showVideo(video);
        } else {
            showHome();
        }
    }

    function showHome() {
        mainContent.style.display = 'block';
        const dynamicPage = document.getElementById('dynamic-page');
        if (dynamicPage) dynamicPage.remove();
        window.scrollTo(0, 0);
    }

    function showCategory(category) {
        mainContent.style.display = 'none';
        let dynamicPage = document.getElementById('dynamic-page');
        if (dynamicPage) dynamicPage.remove();

        dynamicPage = document.createElement('div');
        dynamicPage.id = 'dynamic-page';
        document.body.insertBefore(dynamicPage, document.querySelector('.footer'));

        let itemsHtml = '';
        
        // Combine articles and videos for this category
        const items = [];
        if (category.articles) category.articles.forEach(a => items.push({...a, type: 'article'}));
        if (category.videos) category.videos.forEach(v => items.push({...v, type: 'video'}));

        items.forEach(item => {
            const slug = item.slug || (item.youtube_id ? `video-${item.youtube_id}` : '');
            const href = item.type === 'article' ? `#article/${slug}` : `#video/${item.youtube_id}`;
            const imageSrc = item.image || (item.youtube_id ? `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg` : '');
            
            itemsHtml += `
                <a href="${href}" class="article-card">
                    <div class="article-image-wrapper">
                        <img src="${imageSrc}" alt="${item.title}" class="article-image">
                        <span class="badge">${item.type === 'article' ? 'مقال' : 'فيديو'}</span>
                    </div>
                    <div class="article-content">
                        <h3>${item.title}</h3>
                        <div class="article-meta">
                            <span><i class="far fa-clock"></i> ${item.read_time || item.duration || '5 دقائق'}</span>
                        </div>
                    </div>
                </a>
            `;
        });

        dynamicPage.innerHTML = `
            <section class="section-padding">
                <div class="container">
                    <a href="#" class="back-btn"><i class="fas fa-arrow-right"></i> العودة للرئيسية</a>
                    <div class="section-header">
                        <h2 class="section-title">${category.name}</h2>
                    </div>
                    <div class="article-grid">
                        ${itemsHtml || '<p class="text-center">لا يوجد محتوى في هذا التصنيف حالياً.</p>'}
                    </div>
                </div>
            </section>
        `;
        window.scrollTo(0, 0);
    }

    function showArticle(article) {
        mainContent.style.display = 'none';
        let dynamicPage = document.getElementById('dynamic-page');
        if (dynamicPage) dynamicPage.remove();

        dynamicPage = document.createElement('div');
        dynamicPage.id = 'dynamic-page';
        document.body.insertBefore(dynamicPage, document.querySelector('.footer'));

        dynamicPage.innerHTML = `
            <article class="article-page">
                <div class="container">
                    <a href="javascript:history.back()" class="back-btn"><i class="fas fa-arrow-right"></i> العودة</a>
                    <header class="article-header">
                        <h1>${article.title}</h1>
                    </header>
                    <img src="${article.image}" alt="${article.title}" class="article-full-image">
                    <div class="article-body">
                        ${article.content}
                    </div>
                </div>
            </article>
        `;
        window.scrollTo(0, 0);
    }

    function showVideo(video) {
        mainContent.style.display = 'none';
        let dynamicPage = document.getElementById('dynamic-page');
        if (dynamicPage) dynamicPage.remove();

        dynamicPage = document.createElement('div');
        dynamicPage.id = 'dynamic-page';
        document.body.insertBefore(dynamicPage, document.querySelector('.footer'));

        dynamicPage.innerHTML = `
            <article class="article-page">
                <div class="container">
                    <a href="javascript:history.back()" class="back-btn"><i class="fas fa-arrow-right"></i> العودة</a>
                    <header class="article-header">
                        <h1>${video.title}</h1>
                    </header>
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/${video.youtube_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    <div class="article-body text-center">
                        <p>شاهد الفيديو التعليمي الكامل حول ${video.title} من خلال مشغل يوتيوب أعلاه.</p>
                    </div>
                </div>
            </article>
        `;
        window.scrollTo(0, 0);
    }
});
