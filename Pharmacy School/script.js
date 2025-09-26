// script.js
document.addEventListener('DOMContentLoaded', function () {
  const categoryGrid = document.getElementById('category-grid');
  const latestArticlesEl = document.getElementById('latest-articles-list');
  const mainContent = document.getElementById('main-content');

  // زر العودة للأعلى
  const backToTopBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopBtn.style.display = 'block';
    } else {
      backToTopBtn.style.display = 'none';
    }
  });

  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // تحميل البيانات
  fetch('data.json')
    .then(response => {
      if (!response.ok) throw new Error('فشل في تحميل البيانات');
      return response.json();
    })
    .then(data => {
      // عرض التصنيفات
      if (categoryGrid) {
        data.categories.forEach(cat => {
          const card = document.createElement('a');
          card.href = `#category/${encodeURIComponent(cat.slug)}`;
          card.className = 'category-card';

          const imgSrc = cat.image || 'https://via.placeholder.com/80/003399/FFFFFF?text=💊';
          card.innerHTML = `
            <img src="${imgSrc}" alt="${cat.name}" loading="lazy">
            <h3>${cat.name}</h3>
            <p>${cat.articles?.length || 0} مقال • ${cat.videos?.length || 0} فيديو</p>
          `;

          card.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = `#category/${encodeURIComponent(cat.slug)}`;
            setTimeout(() => {
              mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          });

          categoryGrid.appendChild(card);
        });
      }

      // عرض أحدث 3 مقالات
      if (latestArticlesEl) {
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

        latest.forEach(art => {
          const articleCard = document.createElement('div');
          articleCard.className = 'article-card';
          articleCard.innerHTML = `
            <h4><a href="#article/${art.id}">${art.title}</a></h4>
            <p><i class="far fa-clock"></i> ${art.read_time} دقيقة</p>
          `;

          const articleLink = articleCard.querySelector('a');
          articleLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = `#article/${art.id}`;
            setTimeout(() => {
              mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          });

          latestArticlesEl.appendChild(articleCard);
        });
      }

      // معالجة الروابط الداخلية
      window.addEventListener('hashchange', () => loadContent(data));
      loadContent(data);
    })
    .catch(err => {
      console.error('خطأ في تحميل البيانات:', err);
      if (categoryGrid) {
        categoryGrid.innerHTML = '<p style="color: red; text-align: center; font-size: 1.2rem;">فشل في تحميل قاعدة البيانات. تأكد من رفع ملف data.json</p>';
      }
    });

  function loadContent(data) {
    const hash = window.location.hash.substring(1);
    if (!mainContent) return;

    if (hash.startsWith('category/')) {
      const slug = decodeURIComponent(hash.split('/')[1]);
      const category = data.categories.find(c => c.slug === slug);
      if (!category) {
        mainContent.innerHTML = '<h2 style="text-align: center; color: #003399;">التصنيف غير موجود</h2>';
        mainContent.classList.add('show');
        return;
      }

      let articlesHTML = '';
      if (category.articles && category.articles.length > 0) {
        articlesHTML = `
          <div class="articles-list">
            <h3>مقالات</h3>
            ${category.articles.map(art => `
              <div class="article-item">
                <h4>${art.title}</h4>
                <p><i class="far fa-clock"></i> وقت القراءة: ${art.read_time} دقيقة</p>
                <hr>
                <p>${art.content.substring(0, 200)}...</p>
                <a href="#article/${art.id}" class="btn-read-more">اقرأ المقال كاملاً</a>
              </div>
            `).join('')}
          </div>
        `;
      }

      let videosHTML = '';
      if (category.videos && category.videos.length > 0) {
        videosHTML = `
          <div class="videos-list mt-4">
            <h3>فيديوهات</h3>
            <div class="video-grid">
              ${category.videos.map(vid => `
                <div class="video-item">
                  <iframe width="100%" height="250" src="https://www.youtube.com/embed/${vid.youtube_id}" frameborder="0" allowfullscreen loading="lazy"></iframe>
                  <h5>${vid.title}</h5>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      mainContent.innerHTML = `
        <h2 class="text-center mb-4">${category.name}</h2>
        ${articlesHTML}
        ${videosHTML}
        <a href="#categories" class="btn-back">العودة للتصنيفات</a>
      `;
      mainContent.classList.add('show');
    } else if (hash.startsWith('article/')) {
      const id = hash.split('/')[1];
      let article = null;
      let categoryName = '';

      for (let cat of data.categories) {
        article = cat.articles?.find(a => a.id == id);
        if (article) {
          categoryName = cat.name;
          break;
        }
      }

      if (!article) {
        mainContent.innerHTML = '<h2 style="text-align: center; color: #003399;">المقال غير موجود</h2>';
        mainContent.classList.add('show');
        return;
      }

      mainContent.innerHTML = `
        <h2 class="text-center mb-4">${article.title}</h2>
        <p style="text-align: center; color: #666;"><i class="far fa-clock"></i> وقت القراءة: ${article.read_time} دقيقة</p>
        <hr>
        <div class="article-full-content" style="line-height: 2; font-size: 1.1rem;">
          ${article.content.replace(/\r\n/g, '<br>')}
        </div>
        <div class="social-share mt-4" style="text-align: center; margin: 30px 0;">
          <p>شارك المقال:</p>
          <div style="display: flex; justify-content: center; gap: 15px; margin-top: 10px;">
            <a href="#" class="social-icon" style="color: #1877F2; font-size: 1.5rem;"><i class="fab fa-facebook"></i></a>
            <a href="#" class="social-icon" style="color: #1DA1F2; font-size: 1.5rem;"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-icon" style="color: #25D366; font-size: 1.5rem;"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
        <a href="#categories" class="btn-back">العودة للتصنيفات</a>
      `;
      mainContent.classList.add('show');
    } else {
      mainContent.classList.remove('show');
    }
  }
});