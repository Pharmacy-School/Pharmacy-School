// ==========================================
// Pharmacy School - script.js (ULTRA FIX VERSION)
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ---------- المراجع للعناصر ----------
    const categoryGrid = document.getElementById("category-grid");
    const latestArticlesEl = document.getElementById("latest-articles-list");
    const mainContent = document.getElementById("main-content");
    const backToTopBtn = document.getElementById("backToTop");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const searchResultsSection = document.getElementById("search-results");
    const searchResultsList = document.getElementById("search-results-list");
    const noSearchResults = document.getElementById("no-search-results");
    const closeSearchBtn = document.getElementById("closeSearch");
    const dynamicContentView = document.getElementById("dynamic-content-view");
    const dynamicContentArea = document.getElementById("dynamic-content-area");
    const backToHomeBtn = document.getElementById("backToHomeBtn");
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navMenu = document.getElementById("navMenu");

    // Video Modal Elements
    const videoModal = document.getElementById("videoModal");
    const closeButton = document.querySelector(".close-button");
    const youtubeVideoPlayer = document.getElementById("youtubeVideoPlayer");

    let allData = null; 

    // المسار الأساسي (تأكد من مطابقته لاسم المستودع)
    const BASE_PATH = "/Pharmacy-School"; 

    // ---------- دالة لتنظيف المسارات وإصلاح مشكلة الروابط المزدوجة ----------
    function getCorrectImagePath(path) {
        if (!path) return "";
        
        // تنظيف المسار من المسافات الزائدة في البداية والنهاية
        let cleanPath = path.trim();

        // إذا كان الرابط يبدأ بـ http أو https، فهو رابط خارجي كامل، لا تضف له أي شيء
        if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
            return cleanPath;
        }

        // إذا كان يبدأ بـ ./ أو /، قم بتنظيفه
        cleanPath = cleanPath.replace(/^\.\//, "").replace(/^\//, "");

        // العودة بالمسار الكامل للمستودع
        return `${BASE_PATH}/${cleanPath}`;
    }

    // ---------- دالة لتوليد SVG placeholder ----------
    function generatePlaceholderSVG(text) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
            <rect width="100%" height="100%" fill="#eee"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">${text}</text>
        </svg>`;
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }

    // ---------- وظائف الـ Modal للفيديوهات ----------
    function openVideoModal(youtubeId) {
        if (!youtubeId) return;
        youtubeVideoPlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
        videoModal.style.display = "flex";
        document.body.style.overflow = "hidden"; // منع التمرير عند فتح الفيديو
    }

    function closeVideoModal() {
        youtubeVideoPlayer.src = ""; 
        videoModal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    if (closeButton) closeButton.addEventListener("click", closeVideoModal);
    window.addEventListener("click", (e) => { if (e.target == videoModal) closeVideoModal(); });
    
    // جعل الدالة متاحة عالمياً للـ onclick
    window.openVideoModal = openVideoModal;

    // ---------- تحميل البيانات ----------
    async function loadData() {
        const paths = [`${BASE_PATH}/data.json`, "data.json", "./data.json"];
        let success = false;

        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    allData = await response.json();
                    renderCategories(allData); 
                    renderLatestArticles(allData); 
                    handleHashChange(); // معالجة الهاش الحالي عند التحميل
                    window.addEventListener("hashchange", handleHashChange);
                    success = true;
                    break;
                }
            } catch (e) { console.error(`Failed to load from ${path}`); }
        }

        if (!success) {
            if (categoryGrid) categoryGrid.innerHTML = `<div class="info-message">⚠️ فشل تحميل البيانات. تأكد من وجود ملف data.json.</div>`;
        }
    }

    // ---------- عرض التصنيفات ----------
    function renderCategories(data) {
        if (!categoryGrid) return;
        categoryGrid.innerHTML = ""; 
        data.categories.forEach(cat => {
            const card = document.createElement("a");
            card.href = `#category/${encodeURIComponent(cat.slug)}`;
            card.className = "category-card";
            
            let iconHtml = "";
            if (cat.icon) {
                iconHtml = `<i class="${cat.icon} fa-3x"></i>`;
            } else {
                const imgSrc = getCorrectImagePath(cat.image || "");
                iconHtml = `<img src="${imgSrc || generatePlaceholderSVG(cat.name)}" class="category-image-icon" onerror="this.src='${generatePlaceholderSVG(cat.name)}'"/>`;
            }

            card.innerHTML = `
                ${iconHtml}
                <h3>${cat.name}</h3>
                <p>${cat.articles?.length || 0} مقال • ${cat.videos?.length || 0} فيديو</p>
            `;
            categoryGrid.appendChild(card);
        });
    }

    // ---------- عرض أحدث المحتويات ----------
    function renderLatestArticles(data) {
        if (!latestArticlesEl) return;
        const all = [];
        data.categories.forEach(cat => {
            if (cat.articles) cat.articles.forEach(a => all.push({...a, type:'article', catName: cat.name}));
            if (cat.videos) cat.videos.forEach(v => all.push({...v, type:'video', catName: cat.name}));
        });
        
        const latest = all.sort((a,b) => (b.id||0)-(a.id||0)).slice(0, 3);
        latestArticlesEl.innerHTML = "";

        latest.forEach(item => {
            const card = document.createElement("div");
            card.className = "article-card";
            
            if (item.type === 'article') {
                const imgSrc = getCorrectImagePath(item.image);
                card.innerHTML = `
                    <a href="#article/${item.id}">
                        <div class="article-image-wrapper">
                            <img src="${imgSrc}" onerror="this.src='${generatePlaceholderSVG(item.title)}'"/>
                            <span class="badge">مقال</span>
                        </div>
                        <div class="article-content">
                            <h3>${item.title}</h3>
                            <div class="article-meta"><span>${item.catName}</span></div>
                        </div>
                    </a>`;
            } else {
                const thumb = item.image ? getCorrectImagePath(item.image) : `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg`;
                card.innerHTML = `
                    <div class="video-card-item" onclick="openVideoModal('${item.youtube_id}')" style="cursor:pointer">
                        <div class="article-image-wrapper">
                            <img src="${thumb}" onerror="this.src='https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg'"/>
                            <span class="badge" style="background:red">فيديو</span>
                        </div>
                        <div class="article-content">
                            <h3>${item.title}</h3>
                            <div class="article-meta"><span>مشاهدة الفيديو</span></div>
                        </div>
                    </div>`;
            }
            latestArticlesEl.appendChild(card);
        });
    }

    // ---------- معالجة تغيير الهاش (Hash Navigation) ----------
    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        const homeSection = document.getElementById("home");
        const latestSection = document.getElementById("latest-articles");
        const catsSection = document.getElementById("categories");

        if (!hash || hash === "home") {
            homeSection.classList.remove("d-none");
            latestSection.classList.remove("d-none");
            catsSection.classList.remove("d-none");
            dynamicContentView.classList.add("d-none");
            searchResultsSection.classList.add("d-none");
            window.scrollTo(0, 0);
            return;
        }

        homeSection.classList.add("d-none");
        latestSection.classList.add("d-none");
        catsSection.classList.add("d-none");
        dynamicContentView.classList.remove("d-none");
        
        renderDynamicContent(hash);
    }

    // ---------- عرض المحتوى الديناميكي ----------
    function renderDynamicContent(hash) {
        dynamicContentArea.innerHTML = "";

        if (hash.startsWith("category/")) {
            const slug = decodeURIComponent(hash.split("/")[1]);
            const cat = allData.categories.find(c => c.slug === slug);
            if (!cat) return;

            let html = `<div class="category-header"><h2>${cat.name}</h2></div>`;
            
            if (cat.videos?.length > 0) {
                html += `<h3><i class="fas fa-video"></i> فيديوهات</h3><div class="video-grid">`;
                cat.videos.forEach(v => {
                    const thumb = v.image ? getCorrectImagePath(v.image) : `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
                    html += `
                        <div class="video-card" onclick="openVideoModal('${v.youtube_id}')">
                            <img src="${thumb}" onerror="this.src='https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg'"/>
                            <span class="video-title">${v.title}</span>
                        </div>`;
                });
                html += `</div>`;
            }

            if (cat.articles?.length > 0) {
                html += `<h3><i class="fas fa-file-alt"></i> مقالات</h3><div class="article-list-simple">`;
                cat.articles.forEach(a => {
                    html += `<div class="article-item-simple"><a href="#article/${a.id}">${a.title}</a><span>${a.read_time || 5} دقائق</span></div>`;
                });
                html += `</div>`;
            }
            dynamicContentArea.innerHTML = html;

        } else if (hash.startsWith("article/")) {
            const id = parseInt(hash.split("/")[1]);
            let article = null;
            allData.categories.forEach(c => {
                const found = c.articles?.find(a => a.id === id);
                if (found) article = found;
            });

            if (article) {
                const imgSrc = getCorrectImagePath(article.image);
                dynamicContentArea.innerHTML = `
                    <div class="article-full">
                        <h2>${article.title}</h2>
                        ${imgSrc ? `<img src="${imgSrc}" class="article-full-img" onerror="this.style.display='none'"/>` : ""}
                        <div class="article-body-content">${article.content}</div>
                    </div>`;
            }
        }
        window.scrollTo(0, 0);
    }

    // ---------- العودة للرئيسية ----------
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener("click", () => {
            window.location.hash = "";
        });
    }

    // ---------- تشغيل البحث ----------
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const q = searchInput.value.trim().toLowerCase();
            if (!q) return;
            
            searchResultsList.innerHTML = "";
            const results = [];
            allData.categories.forEach(c => {
                c.articles?.forEach(a => { if(a.title.toLowerCase().includes(q)) results.push({...a, type:'article'}) });
                c.videos?.forEach(v => { if(v.title.toLowerCase().includes(q)) results.push({...v, type:'video'}) });
            });

            if (results.length > 0) {
                searchResultsSection.classList.remove("d-none");
                homeSection.classList.add("d-none");
                // ... (إضافة نتائج البحث هنا)
            }
        });
    }

    loadData();
});
