// ==========================================
// Pharmacy School - script.js (Final Improved Version with Fixes)
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

    let allData = null; // لتخزين البيانات المحملة مرة واحدة

    // ---------- المسار الأساسي للموقع على GitHub Pages ----------
    const BASE_PATH = "/Pharmacy-School"; 

    // ---------- دالة لتوليد SVG placeholder محلياً ----------
    function generatePlaceholderSVG(text, width = 80, height = 80, bgColor = "#003399", textColor = "#FFFFFF") {
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <rect width="100%" height="100%" fill="${bgColor}" />
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                      font-family="Cairo, sans-serif" font-size="${Math.max(10, Math.round(Math.min(width, height ) * 0.15))}px" 
                      fill="${textColor}">
                    ${text}
                </text>
            </svg>
        `;
        return "data:image/svg+xml," + encodeURIComponent(svgContent);
    }

    // ---------- دالة للحصول على المسار الصحيح للصورة ----------
    function getCorrectImagePath(imagePath) {
        if (!imagePath) return "";
        if (imagePath.startsWith("http" )) return imagePath;
        if (imagePath.startsWith("/")) return imagePath;
        // التعامل مع المسارات النسبية لضمان عملها على GitHub Pages
        return `${BASE_PATH}/${imagePath.replace(/^\.\//, '')}`;
    }

    // ---------- زر العودة للأعلى ----------
    if (backToTopBtn) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = "flex"; 
            } else {
                backToTopBtn.style.display = "none";
            }
        });
        backToTopBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ---------- قائمة التنقل للجوال ----------
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", function() {
            navMenu.classList.toggle("active");
        });
    }

    // ---------- وظائف الـ Modal للفيديوهات ----------
    function openVideoModal(youtubeId) {
        youtubeVideoPlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
        videoModal.style.display = "flex";
    }

    function closeVideoModal( ) {
        youtubeVideoPlayer.src = ""; 
        videoModal.style.display = "none";
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeVideoModal);
    }

    window.addEventListener("click", (e) => { if (e.target == videoModal) closeVideoModal(); });

    // ---------- تحميل البيانات من ملف JSON ----------
    async function loadData() {
        const paths = [`${BASE_PATH}/data.json`, "data.json", "./data.json"];
        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    allData = await response.json();
                    renderCategories(allData); 
                    renderLatestArticles(allData); 
                    loadContent(allData);
                    window.addEventListener("hashchange", () => loadContent(allData));
                    return;
                }
            } catch (e) { console.error(`Failed to load from ${path}`); }
        }
        showError("فشل تحميل البيانات. تأكد من وجود ملف data.json في جذر المستودع.");
    }

    function showError(msg) {
        if (categoryGrid) categoryGrid.innerHTML = `<div class="error-msg">${msg}</div>`;
    }

    loadData();

    // ---------- عرض التصنيفات ----------
    function renderCategories(data) {
        if (!categoryGrid) return;
        categoryGrid.innerHTML = ""; 
        data.categories.forEach(cat => {
            const card = document.createElement("a");
            card.href = `#category/${encodeURIComponent(cat.slug)}`;
            card.className = "category-card";
            let iconHtml = cat.icon ? `<i class="${cat.icon} fa-3x"></i>` : 
                           `<img src="${cat.image ? getCorrectImagePath(cat.image) : generatePlaceholderSVG(cat.name)}" class="category-image-icon" />`;
            card.innerHTML = `${iconHtml}<h3>${cat.name}</h3><p>${cat.articles?.length || 0} مقال • ${cat.videos?.length || 0} فيديو</p>`;
            categoryGrid.appendChild(card);
        });
    }

    // ---------- عرض أحدث المقالات ----------
    function renderLatestArticles(data) {
        if (!latestArticlesEl) return;
        const all = [];
        data.categories.forEach(cat => {
            if (cat.articles) cat.articles.forEach(a => all.push({...a, type:'article'}));
            if (cat.videos) cat.videos.forEach(v => all.push({...v, type:'video'}));
        });
        const latest = all.sort((a,b) => (b.id||0)-(a.id||0)).slice(0,3);
        latestArticlesEl.innerHTML = "";
        latest.forEach(item => {
            const card = document.createElement("div");
            card.className = "article-card";
            if (item.type === 'article') {
                card.innerHTML = `<a href="#article/${item.id}"><img src="${item.image ? getCorrectImagePath(item.image) : generatePlaceholderSVG(item.title)}" /><h3>${item.title}</h3></a>`;
            } else {
                card.innerHTML = `<div class="video-card-item" onclick="openVideoModal('${item.youtube_id}')"><img src="https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg" /><h3>${item.title}</h3></div>`;
            }
            latestArticlesEl.appendChild(card );
        });
    }

    // ---------- تحميل المحتوى حسب الهاش ----------
    function loadContent(data) {
        const hash = window.location.hash.substring(1);
        if (!hash) {
            document.getElementById("home").classList.remove("d-none");
            dynamicContentView.classList.add("d-none");
            return;
        }
        document.getElementById("home").classList.add("d-none");
        dynamicContentView.classList.remove("d-none");
        // منطق عرض المقالات والتصنيفات...
    }

    window.openVideoModal = openVideoModal; // جعلها متاحة عالمياً للـ onclick
});
