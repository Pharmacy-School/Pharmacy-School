// ==========================================
// Pharmacy School - script.js (Improved Version)
// ==========================================

document.addEventListener('DOMContentLoaded', function () {

    // ---------- المراجع للعناصر ----------
    const categoryGrid = document.getElementById('category-grid');
    const latestArticlesEl = document.getElementById('latest-articles-list');
    const mainContent = document.getElementById('main-content');
    const backToTopBtn = document.getElementById('backToTop');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResultsSection = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');
    const noSearchResults = document.getElementById('no-search-results');
    const closeSearchBtn = document.getElementById('closeSearch');
    const dynamicContentView = document.getElementById('dynamic-content-view');
    const dynamicContentArea = document.getElementById('dynamic-content-area');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    let allData = null; // لتخزين البيانات المحملة مرة واحدة

    // ---------- المسار الأساسي للموقع على GitHub Pages ----------
    // تأكد من أن هذا المسار صحيح ويعكس مسار مشروعك على GitHub Pages
    const BASE_PATH = '/Pharmacy-School'; 

    // ---------- دالة لتوليد SVG placeholder محلياً ----------
    function generatePlaceholderSVG(text, width = 80, height = 80, bgColor = '#003399', textColor = '#FFFFFF') {
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <rect width="100%" height="100%" fill="${bgColor}" />
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                      font-family="Cairo, sans-serif" font-size="${Math.max(10, Math.round(Math.min(width, height) * 0.15))}px" 
                      fill="${textColor}">
                    ${text}
                </text>
            </svg>
        `;
        return 'data:image/svg+xml,' + encodeURIComponent(svgContent);
    }

    // ---------- زر العودة للأعلى ----------
    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex'; // استخدام flex بدلاً من block للتوسيط
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------- قائمة التنقل للجوال ----------
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // إغلاق القائمة عند النقر على رابط
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // ---------- تحميل البيانات من ملف JSON ----------
    fetch(BASE_PATH + '/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('فشل تحميل البيانات - حالة HTTP: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            allData = data; // تخزين البيانات للوصول إليها لاحقاً
            renderCategories(allData); // عرض التصنيفات
            renderLatestArticles(allData); // عرض أحدث 3 مقالات
            
            // معالجة التنقل الداخلي عند تحميل الصفحة أو تغيير الهاش
            window.addEventListener('hashchange', () => loadContent(allData));
            loadContent(allData); // تحميل المحتوى المبدئي حسب الرابط
        })
        .catch(err => {
            console.error('خطأ في تحميل البيانات:', err);
            if (categoryGrid) {
                categoryGrid.innerHTML = `
                    <div class="error-msg info-message">
                        <p>⚠️ فشل في تحميل البيانات. تأكد من وجود ملف data.json في المسار الصحيح.</p>
                        <p style="font-size:0.9rem; margin-top:10px;">المسار المفروض يكون: <code>${BASE_PATH}/data.json</code></p>
                    </div>`;
            }
            if (latestArticlesEl) {
                latestArticlesEl.innerHTML = `
                    <div class="error-msg info-message">
                        <p>⚠️ فشل في تحميل أحدث المقالات. الرجاء التحقق من ملف data.json.</p>
                    </div>`;
            }
        });

    // ---------- عرض التصنيفات ----------
    function renderCategories(data) {
        if (!categoryGrid) return;
        categoryGrid.innerHTML = ''; // تنظيف الشبكة
        data.categories.forEach(cat => {
            const card = document.createElement('a');
            card.href = `#category/${encodeURIComponent(cat.slug)}`;
            card.className = 'category-card';

            const imgSrc = cat.image 
                ? BASE_PATH + '/' + cat.image 
                : generatePlaceholderSVG(cat.name);

            card.innerHTML = `
                <img src="${imgSrc}" alt="${cat.name}" />
                <h3>${cat.name}</h3>
                <p>${cat.articles?.length || 0} مقال • ${cat.videos?.length || 0} فيديو</p>
            `;

            categoryGrid.appendChild(card);
        });
    }

    // ---------- عرض أحدث المقالات والفيديوهات ----------
    function renderLatestArticles(data) {
        if (!latestArticlesEl) return;
        const allContent = [];
        data.categories.forEach(cat => {
            if (cat.articles) {
                cat.articles.forEach(art => {
                    allContent.push({ ...art, type: 'article', categorySlug: cat.slug });
                });
            }
            if (cat.videos) {
                cat.videos.forEach(vid => {
                    allContent.push({ ...vid, type: 'video', categorySlug: cat.slug });
                });
            }
        });

        const latest = allContent
            .sort((a, b) => (b.id || 0) - (a.id || 0)) // تأكد من وجود ID لكل عنصر
            .slice(0, 3); // عرض أحدث 3 عناصر

        latestArticlesEl.innerHTML = ''; // تنظيف
        if (latest.length === 0) {
            latestArticlesEl.innerHTML = '<div class="info-message">لا توجد مقالات أو فيديوهات حديثة لعرضها.</div>';
            return;
        }

        latest.forEach(item => {
            const card = document.createElement('div');
            card.className = 'article-card'; // يمكن إعادة تسمية الكلاس ليكون أكثر عمومية
            let itemHtml = '';

            if (item.type === 'article') {
                itemHtml = `
                    <a href="#article/${item.id}" class="article-link">
                        <h4>${item.title}</h4>
                        <span>${item.read_time || 5} دقيقة قراءة</span>
                    </a>
                `;
            } else if (item.type === 'video') {
                const thumb = item.image 
                    ? BASE_PATH + '/' + item.image 
                    : `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg`;
                itemHtml = `
                    <a href="https://www.youtube.com/watch?v=${item.youtube_id}" target="_blank" class="article-link">
                        <div class="article-image-wrapper">
                            <img src="${thumb}" alt="${item.title}" class="article-image" />
                            <span class="badge">فيديو</span>
                        </div>
                        <div class="article-content">
                            <h3>${item.title}</h3>
                            <div class="article-meta">
                                <span>مشاهدة على يوتيوب</span>
                            </div>
                        </div>
                    </a>
                `;
            }
            card.innerHTML = itemHtml;
            latestArticlesEl.appendChild(card);
        });
    }

    // ---------- وظيفة البحث ----------
    function performSearch(query) {
        searchResultsList.innerHTML = '';
        noSearchResults.classList.add('d-none');
        searchResultsSection.classList.remove('d-none');
        dynamicContentView.classList.add('d-none');

        if (!query) {
            searchResultsSection.classList.add('d-none');
            return;
        }

        const normalizedQuery = query.toLowerCase();
        const results = [];

        allData.categories.forEach(cat => {
            // البحث في الفيديوهات
            cat.videos.forEach(video => {
                if (video.title.toLowerCase().includes(normalizedQuery)) {
                    results.push({ ...video, type: 'video', categorySlug: cat.slug });
                }
            });
            // البحث في المقالات
            cat.articles.forEach(article => {
                if (article.title.toLowerCase().includes(normalizedQuery) || 
                    (article.content && article.content.toLowerCase().includes(normalizedQuery))) {
                    results.push({ ...article, type: 'article', categorySlug: cat.slug });
                }
            });
        });

        if (results.length > 0) {
            results.forEach(item => {
                const card = document.createElement('div');
                card.className = 'article-card';
                let itemHtml = '';

                if (item.type === 'article') {
                    itemHtml = `
                        <a href="#article/${item.id}" class="article-link">
                            <h4>${item.title}</h4>
                            <span>${item.read_time || 5} دقيقة قراءة</span>
                        </a>
                    `;
                } else if (item.type === 'video') {
                    const thumb = item.image 
                        ? BASE_PATH + '/' + item.image 
                        : `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg`;
                    itemHtml = `
                        <a href="https://www.youtube.com/watch?v=${item.youtube_id}" target="_blank" class="article-link">
                            <div class="article-image-wrapper">
                                <img src="${thumb}" alt="${item.title}" class="article-image" />
                                <span class="badge">فيديو</span>
                            </div>
                            <div class="article-content">
                                <h3>${item.title}</h3>
                                <div class="article-meta">
                                    <span>مشاهدة على يوتيوب</span>
                                </div>
                            </div>
                        </a>
                    `;
                }
                card.innerHTML = itemHtml;
                searchResultsList.appendChild(card);
            });
        } else {
            noSearchResults.classList.remove('d-none');
        }

        // إخفاء الأقسام الرئيسية الأخرى
        document.getElementById('home').classList.add('d-none');
        document.getElementById('latest-articles').classList.add('d-none');
        document.getElementById('categories').classList.add('d-none');
    }

    // ---------- معالجة أحداث البحث ----------
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => performSearch(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }

    // ---------- إغلاق نتائج البحث ----------
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            searchResultsSection.classList.add('d-none');
            // إعادة إظهار الأقسام الرئيسية
            document.getElementById('home').classList.remove('d-none');
            document.getElementById('latest-articles').classList.remove('d-none');
            document.getElementById('categories').classList.remove('d-none');
            searchInput.value = ''; // مسح حقل البحث
            window.location.hash = ''; // العودة للصفحة الرئيسية
        });
    }

    // ---------- تحميل المحتوى حسب الرابط (الهاش) ----------
    function loadContent(data) {
        if (!mainContent || !data) return;

        const hash = window.location.hash.substring(1); // إزالة #

        // إخفاء جميع الأقسام الرئيسية وعرض المحتوى الديناميكي فقط
        document.getElementById('home').classList.add('d-none');
        document.getElementById('latest-articles').classList.add('d-none');
        document.getElementById('categories').classList.add('d-none');
        searchResultsSection.classList.add('d-none');
        dynamicContentView.classList.remove('d-none');
        dynamicContentArea.innerHTML = ''; // تنظيف منطقة المحتوى الديناميكي

        if (!hash) {
            // إذا كان الهاش فارغاً، نعود للصفحة الرئيسية
            document.getElementById('home').classList.remove('d-none');
            document.getElementById('latest-articles').classList.remove('d-none');
            document.getElementById('categories').classList.remove('d-none');
            dynamicContentView.classList.add('d-none');
            return;
        }

        // --- عرض تصنيف ---
        if (hash.startsWith('category/')) {
            const slug = decodeURIComponent(hash.split('/')[1]);
            const category = data.categories.find(c => c.slug === slug);

            if (!category) {
                dynamicContentArea.innerHTML = '<div class="info-message">التصنيف غير موجود.</div>';
                return;
            }

            let html = `<h2>${category.name}</h2>`;

            // عرض الفيديوهات
            if (category.videos && category.videos.length > 0) {
                html += '<h3>🎥 فيديوهات</h3><div class="video-grid">';
                category.videos.forEach(video => {
                    const thumb = video.image 
                        ? BASE_PATH + '/' + video.image 
                        : `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
                    html += `
                        <div class="video-card">
                            <a href="https://www.youtube.com/watch?v=${video.youtube_id}" target="_blank">
                                <img src="${thumb}" alt="${video.title}" />
                                <span>${video.title}</span>
                            </a>
                        </div>`;
                });
                html += '</div>';
            }

            // عرض المقالات
            if (category.articles && category.articles.length > 0) {
                html += '<h3>📄 مقالات</h3><ul>';
                category.articles.forEach(art => {
                    html += `<li><a href="#article/${art.id}">${art.title}</a> (${art.read_time || 5} دقائق)</li>`;
                });
                html += '</ul>';
            }
            
            if ((!category.videos || category.videos.length === 0) && (!category.articles || category.articles.length === 0)) {
                html += '<div class="info-message">لا توجد فيديوهات أو مقالات في هذا التصنيف حالياً.</div>';
            }

            dynamicContentArea.innerHTML = html;
            dynamicContentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // --- عرض مقال منفرد ---
        else if (hash.startsWith('article/')) {
            const articleId = parseInt(hash.split('/')[1], 10);
            let foundArticle = null;
            for (let cat of data.categories) {
                if (cat.articles) {
                    const art = cat.articles.find(a => a.id === articleId);
                    if (art) {
                        foundArticle = art;
                        break;
                    }
                }
            }

            if (!foundArticle) {
                dynamicContentArea.innerHTML = '<div class="info-message">المقال غير موجود.</div>';
                return;
            }

            const imgSrc = foundArticle.image 
                ? BASE_PATH + '/' + foundArticle.image 
                : ''; // لا نستخدم placeholder SVG للمقالات الفردية حالياً
            
            let html = `
                <h2 class="article-title">${foundArticle.title}</h2>
            `;
            if (imgSrc) {
                html += `<img src="${imgSrc}" alt="${foundArticle.title}" class="article-full-image" />`;
            }
            html += `
                <div class="article-body">
                    ${foundArticle.content || 'لا يوجد محتوى لهذا المقال.'}
                    <p><em>وقت القراءة: ${foundArticle.read_time || 5} دقائق</em></p>
                </div>
            `;
            dynamicContentArea.innerHTML = html;
            dynamicContentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // --- عرض صفحة المقالات العامة ---
        else if (hash === 'articles') {
            let allArticles = [];
            data.categories.forEach(cat => {
                if (cat.articles) {
                    cat.articles.forEach(art => {
                        allArticles.push({ ...art, categorySlug: cat.slug });
                    });
                }
            });

            if (allArticles.length === 0) {
                dynamicContentArea.innerHTML = '<h2>المقالات</h2><div class="info-message">لا توجد مقالات لعرضها حالياً.</div>';
                return;
            }

            let html = '<h2>جميع المقالات</h2><div class="article-grid">';
            allArticles.sort((a, b) => b.id - a.id).forEach(art => {
                html += `
                    <div class="article-card">
                        <a href="#article/${art.id}" class="article-link">
                            <h4>${art.title}</h4>
                            <span>${art.read_time || 5} دقيقة قراءة</span>
                        </a>
                    </div>
                `;
            });
            html += '</div>';
            dynamicContentArea.innerHTML = html;
            dynamicContentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        else {
            dynamicContentArea.innerHTML = '<div class="info-message">الصفحة المطلوبة غير موجودة.</div>';
        }
    }

    // ---------- العودة للصفحة الرئيسية من المحتوى الديناميكي ----------
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            window.location.hash = ''; // مسح الهاش للعودة للصفحة الرئيسية
            // إعادة إظهار الأقسام الرئيسية
            document.getElementById('home').classList.remove('d-none');
            document.getElementById('latest-articles').classList.remove('d-none');
            document.getElementById('categories').classList.remove('d-none');
            dynamicContentView.classList.add('d-none');
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // ---------- معالجة النقر على الروابط الداخلية (تحسين) ----------
    document.addEventListener('click', function (e) {
        // إغلاق قائمة الجوال إذا كانت مفتوحة
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }

        // معالجة الروابط الداخلية التي تبدأ بـ #
        if (e.target.matches('a[href^="#"]')) {
            const href = e.target.getAttribute('href');
            // تجنب معالجة الروابط التي هي مجرد # أو #home أو #categories هنا، لأن loadContent سيتعامل معها
            if (href === '#' || href === '#home' || href === '#categories' || href === '#articles') {
                e.preventDefault(); // منع السلوك الافتراضي للمتصفح
                window.location.hash = href.substring(1); // تحديث الهاش
                mainContent?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (href.startsWith('#article/') || href.startsWith('#category/')) {
                e.preventDefault(); // منع السلوك الافتراضي للمتصفح
                window.location.hash = href.substring(1); // تحديث الهاش
                // التمرير سيتم بواسطة loadContent
            }
        }
    });

});
