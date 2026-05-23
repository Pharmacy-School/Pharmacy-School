// ==========================================
// Pharmacy School - script.js
// تم التعديل والإصلاح بالكامل
// ==========================================

document.addEventListener('DOMContentLoaded', function () {

    // ---------- المراجع للعناصر ----------
    const categoryGrid = document.getElementById('category-grid');
    const latestArticlesEl = document.getElementById('latest-articles-list');
    const mainContent = document.getElementById('main-content');
    const backToTopBtn = document.getElementById('backToTop');

    // ---------- المسار الأساسي للموقع على GitHub Pages ----------
    // بما أن الموقع في مجلد فرعي، لازم نضيف اسم المجلد
    const BASE_PATH = '/Pharmacy-School';

    // ---------- زر العودة للأعلى ----------
    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            // عرض التصنيفات
            renderCategories(data);
            // عرض أحدث 3 مقالات
            renderLatestArticles(data);
            // معالجة التنقل الداخلي
            window.addEventListener('hashchange', () => loadContent(data));
            // تحميل المحتوى المبدئي حسب الرابط
            loadContent(data);
        })
        .catch(err => {
            console.error('خطأ في تحميل البيانات:', err);
            if (categoryGrid) {
                categoryGrid.innerHTML = `
                    <div class="error-msg">
                        <p>⚠️ فشل في تحميل البيانات. تأكد من وجود ملف data.json في المسار الصحيح.</p>
                        <p style="font-size:0.9rem; margin-top:10px;">المسار المفروض يكون: <code>${BASE_PATH}/data.json</code></p>
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

            // صورة افتراضية لو مفيش صورة
            const imgSrc = cat.image
                ? BASE_PATH + '/' + cat.image
                : 'https://via.placeholder.com/80/003399/FFFFFF?text=' + encodeURIComponent(cat.name);

            card.innerHTML = `
                <img src="${imgSrc}" alt="${cat.name}" style="width:80px; height:80px; border-radius:50%; object-fit:cover;" />
                <h3>${cat.name}</h3>
                <p>${cat.articles?.length || 0} مقال • ${cat.videos?.length || 0} فيديو</p>
            `;

            card.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.hash = `#category/${encodeURIComponent(cat.slug)}`;
                mainContent?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            categoryGrid.appendChild(card);
        });
    }

    // ---------- عرض أحدث المقالات ----------
    function renderLatestArticles(data) {
        if (!latestArticlesEl) return;
        const allArticles = [];
        data.categories.forEach(cat => {
            if (cat.articles) {
                cat.articles.forEach(art => {
                    art.categorySlug = cat.slug;
                    allArticles.push(art);
                });
            }
        });
        const latest = allArticles
            .sort((a, b) => b.id - a.id)
            .slice(0, 3);

        latestArticlesEl.innerHTML = ''; // تنظيف
        latest.forEach(art => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            articleCard.innerHTML = `
                <a href="#article/${art.id}" class="article-link">
                    <h4>${art.title}</h4>
                    <span>${art.read_time || 5} دقيقة قراءة</span>
                </a>
            `;
            const link = articleCard.querySelector('a');
            link.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.hash = `#article/${art.id}`;
                mainContent?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            latestArticlesEl.appendChild(articleCard);
        });
    }

    // ---------- تحميل المحتوى حسب الرابط ----------
    function loadContent(data) {
        if (!mainContent) return;

        const hash = window.location.hash.substring(1); // إزالة #

        // لو الرابط فاضي، نعرض رسالة ترحيب أو نفضي المحتوى
        if (!hash) {
            mainContent.innerHTML = '';
            mainContent.classList.remove('show');
            return;
        }

        // --- عرض تصنيف ---
        if (hash.startsWith('category/')) {
            const slug = decodeURIComponent(hash.split('/')[1]);
            const category = data.categories.find(c => c.slug === slug);

            if (!category) {
                mainContent.innerHTML = '<p>التصنيف غير موجود.</p>';
                mainContent.classList.add('show');
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
                            <img src="${thumb}" alt="${video.title}" />
                            <a href="https://www.youtube.com/watch?v=${video.youtube_id}" target="_blank">${video.title}</a>
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

            mainContent.innerHTML = html;
            mainContent.classList.add('show');
        }
        // --- عرض مقال منفرد ---
        else if (hash.startsWith('article/')) {
            const articleId = parseInt(hash.split('/')[1], 10);
            // البحث في كل التصنيفات
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
                mainContent.innerHTML = '<p>المقال غير موجود.</p>';
                mainContent.classList.add('show');
                return;
            }

            const imgSrc = foundArticle.image
                ? BASE_PATH + '/' + foundArticle.image
                : '';
            let html = `<h2>${foundArticle.title}</h2>`;
            if (imgSrc) {
                html += `<img src="${imgSrc}" alt="${foundArticle.title}" style="max-width:100%; height:auto; margin-bottom:1rem;" />`;
            }
            html += `<p>${foundArticle.content || 'لا يوجد محتوى.'}</p>`;
            html += `<p><em>وقت القراءة: ${foundArticle.read_time || 5} دقائق</em></p>`;
            mainContent.innerHTML = html;
            mainContent.classList.add('show');
        } else {
            mainContent.innerHTML = '<p>الصفحة غير موجودة.</p>';
            mainContent.classList.add('show');
        }
    }

    // ---------- إعادة ربط أحداث التنقل بعد تحميل المحتوى ----------
    // (اختياري - لتأكيد عمل الروابط الديناميكية)
    window.addEventListener('click', function (e) {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            window.location.hash = href;
        }
    });

});
