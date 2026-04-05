let products = [];
let news = [];
let currentMode = 'products'; 
let isRegistration = false; 
let displayedNewsCount = 10; // Сколько новостей показывать изначально

const resultsGrid = document.getElementById('results-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const tabs = document.querySelectorAll('.tab-btn');

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Новые элементы управления новостями
const searchBox = document.getElementById('search-box');
const newsControls = document.getElementById('news-controls');
const loadMoreBtn = document.getElementById('load-more-btn');
const resetSearchBtn = document.getElementById('reset-search-btn');

function init() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('current-user-name').innerText = user.username;
        document.getElementById('account-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-block';
    }
    
    if (localStorage.getItem('darkTheme') === 'false') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        if (themeToggle) themeToggle.checked = false; 
        if (themeIcon) themeIcon.innerText = "☀️";
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        if (themeToggle) themeToggle.checked = true; 
        if (themeIcon) themeIcon.innerText = "🌙";
    }
    updateBackground(); 
}

function updateBackground() {
    const container = document.getElementById('stars-container');
    if (!container) return;
    container.innerHTML = ''; 

    if (document.body.classList.contains('dark-theme')) {
        for (let i = 0; i < 150; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 3 + 'px';
            star.style.width = size; star.style.height = size;
            star.style.top = Math.random() * 100 + '%';
            star.style.left = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(star);
        }
    } else {
        for (let i = 0; i < 6; i++) {
            const ray = document.createElement('div');
            ray.className = 'ray';
            ray.style.left = (Math.random() * 100) + '%';
            ray.style.width = (40 + Math.random() * 60) + 'px';
            ray.style.animationDuration = (4 + Math.random() * 4) + 's';
            ray.style.animationDelay = (Math.random() * 2) + 's';
            container.appendChild(ray);
        }
        for (let i = 0; i < 8; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            const width = 100 + Math.random() * 150;
            cloud.style.width = width + 'px';
            cloud.style.height = (width * 0.35) + 'px'; 
            cloud.style.top = (Math.random() * 70) + '%'; 
            cloud.style.animationDuration = (35 + Math.random() * 50) + 's';
            cloud.style.animationDelay = '-' + (Math.random() * 50) + 's';
            container.appendChild(cloud);
        }
    }
}

if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            localStorage.setItem('darkTheme', 'true');
            if (themeIcon) themeIcon.innerText = "🌙";
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('darkTheme', 'false');
            if (themeIcon) themeIcon.innerText = "☀️";
        }
        updateBackground(); 
    });
}

// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
tabs.forEach(tab => {
    tab.addEventListener('click', async (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.getAttribute('data-type');
        
        if (currentMode === 'news') {
            searchInput.placeholder = "Ищем новости IT...";
            if (news.length === 0) {
                // Если новостей нет, показываем поиск
                searchBox.style.display = 'flex';
                newsControls.style.display = 'none';
                await startSearch("новости технологий");
            } else {
                // Если новости есть, прячем поиск и показываем кнопку "Еще"
                searchBox.style.display = 'none';
                newsControls.style.display = 'block';
                renderItems(news);
            }
        } else {
            // В товарах поиск нужен всегда
            searchInput.placeholder = "Поиск по Авито и Юле...";
            searchBox.style.display = 'flex';
            newsControls.style.display = 'none';
            renderItems(products);
        }
    });
});

async function startSearch(query) {
    resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;"><h2>🤖 Всезнайка сканирует источники...</h2></div>`;
    newsControls.style.display = 'none'; // Прячем кнопки во время загрузки

    const endpoint = currentMode === 'products' ? 'search' : 'news';
    try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (currentMode === 'products') {
            products = data;
            searchBox.style.display = 'flex';
        } else {
            news = data;
            displayedNewsCount = 10; // Сбрасываем счетчик до 10
            searchBox.style.display = 'none'; // ПРЯЧЕМ ПОИСК
            newsControls.style.display = 'block'; // ПОКАЗЫВАЕМ "ЕЩЕ"
        }
        renderItems(data);
    } catch (e) {
        resultsGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:red;">Ошибка сервера.</p>';
    }
}

searchBtn.onclick = () => {
    const query = searchInput.value.trim();
    if (query) startSearch(query);
};

// ЛОГИКА КНОПОК ПОД НОВОСТЯМИ
if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
        displayedNewsCount += 5; // Добавляем 5 новостей
        renderItems(news);
    };
}

if (resetSearchBtn) {
    resetSearchBtn.onclick = () => {
        searchBox.style.display = 'flex'; // Возвращаем поиск
        newsControls.style.display = 'none'; // Прячем кнопки
        resultsGrid.innerHTML = ''; // Очищаем экран
        news = []; // Сбрасываем старые новости
        searchInput.value = '';
        searchInput.focus();
    };
}

function renderItems(items) {
    resultsGrid.innerHTML = '';
    if (!items || items.length === 0) {
        resultsGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Ничего не найдено.</p>';
        if (newsControls) newsControls.style.display = 'none';
        return;
    }

    // Обрезаем массив до нужного количества (10, 15, 20...)
    const itemsToRender = currentMode === 'news' ? items.slice(0, displayedNewsCount) : items;

    // Если показали все доступные новости, прячем кнопку "Еще"
    if (currentMode === 'news' && loadMoreBtn) {
        if (displayedNewsCount >= items.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
    }

    itemsToRender.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const priceHTML = item.price 
            ? `<div class="card-price-box">
                 <span class="price-label">Цена: </span>
                 <span class="price-value">${item.price}</span>
               </div>` 
            : `<div class="card-date">🕒 Актуальная новость</div>`;
        
        card.innerHTML = `
            <h3>${item.title}</h3>
            ${priceHTML}
            <p class="card-source">Источник: ${item.platform}</p>
            <p class="card-desc">${item.shortDesc}</p>
            <button class="modern-btn card-btn">Перейти на сайт</button>
        `;
        
        card.addEventListener('click', () => { 
            if (item.url && item.url.startsWith('http')) window.open(item.url, '_blank'); 
            else alert("К сожалению, источник заблокировал прямую ссылку.");
        });
        
        resultsGrid.appendChild(card);
    });
}

// УПРАВЛЕНИЕ АККАУНТОМ И GOOGLE AUTH
const accountBtn = document.getElementById('account-btn');
const choiceModal = document.getElementById('choice-modal');
const authModal = document.getElementById('auth-modal');
const aboutBtn = document.getElementById('about-us-btn');
const contactModal = document.getElementById('contact-modal');

if (accountBtn) accountBtn.onclick = () => choiceModal.style.display = 'flex';
if(document.getElementById('close-choice')) document.getElementById('close-choice').onclick = () => choiceModal.style.display = 'none';

if(document.getElementById('choose-login')) document.getElementById('choose-login').onclick = () => { isRegistration = false; openAuth("Вход"); };
if(document.getElementById('choose-reg')) document.getElementById('choose-reg').onclick = () => { isRegistration = true; openAuth("Регистрация"); };

function openAuth(title) {
    choiceModal.style.display = 'none'; 
    authModal.style.display = 'flex';
    document.getElementById('auth-title').innerText = title;
    document.getElementById('auth-error').innerText = ''; 
}

if(document.getElementById('back-to-choice')) document.getElementById('back-to-choice').onclick = () => { 
    authModal.style.display = 'none'; choiceModal.style.display = 'flex'; 
};

// Функция для НАСТОЯЩЕГО Google-входа
function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

window.handleGoogleLogin = function(response) {
    const userData = decodeJWT(response.credential);
    const realUser = { username: userData.name, email: userData.email, avatar: userData.picture };
    
    document.getElementById('auth-modal').style.display = 'none';
    localStorage.setItem('currentUser', JSON.stringify(realUser));
    location.reload();
}

window.onload = function () {
    if (window.google) {
        google.accounts.id.initialize({
            client_id: "ТВОЙ_CLIENT_ID_ОТ_GOOGLE", // Замени на свой Client ID!
            callback: handleGoogleLogin
        });
        
        const btnContainer = document.getElementById("google-btn-container");
        if(btnContainer) {
            google.accounts.id.renderButton(btnContainer, { theme: "outline", size: "large", width: "100%" });
        }
    }
};

if(document.getElementById('auth-submit')) document.getElementById('auth-submit').onclick = async () => {
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');
    if (!username || !password) return errorEl.innerText = "Заполните все поля";

    try {
        const response = await fetch('http://localhost:3000/api/auth', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (result.success) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            location.reload();
        } else errorEl.innerText = result.error;
    } catch (e) { errorEl.innerText = "Сервер недоступен"; }
};

if(document.getElementById('logout-btn')) document.getElementById('logout-btn').onclick = () => { 
    localStorage.removeItem('currentUser'); location.reload(); 
};

if (aboutBtn) aboutBtn.onclick = () => contactModal.style.display = 'flex';
if (document.getElementById('close-contact')) document.getElementById('close-contact').onclick = () => contactModal.style.display = 'none';

window.addEventListener('click', (event) => {
    if (event.target == contactModal) contactModal.style.display = "none";
    if (event.target == choiceModal) choiceModal.style.display = "none";
    if (event.target == authModal) authModal.style.display = "none";
});

init();