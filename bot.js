const puppeteer = require('puppeteer');

// --- УМНАЯ РЕЗЕРВНАЯ БАЗА (Выдает 10 товаров по категориям) ---
function getSmartFallback(searchQuery) {
    const q = searchQuery.toLowerCase();
    let templates = [];

    if (q.includes('телевизор') || q.includes('тв') || q.includes('tv')) {
        templates = [
            { title: "Телевизор Xiaomi Mi TV A2 43\"", price: "22 990 ₽" },
            { title: "Телевизор Samsung UE50CU7100UXRU 50\"", price: "44 500 ₽" },
            { title: "Телевизор LG 43UR71006LB 43\"", price: "36 000 ₽" },
            { title: "Телевизор Hisense 55A6K 55\"", price: "34 990 ₽" },
            { title: "Телевизор TCL 50P635 50\"", price: "27 500 ₽" },
            { title: "Телевизор Haier 65 Smart TV S1 65\"", price: "64 900 ₽" },
            { title: "Телевизор Philips 50PUS8108/60 50\"", price: "49 990 ₽" },
            { title: "Телевизор Sony Bravia KD-55X80K 55\"", price: "95 000 ₽" },
            { title: "Телевизор KIVI 32H750NB 32\"", price: "14 500 ₽" },
            { title: "Телевизор DEXP 43U7000 43\"", price: "18 990 ₽" }
        ];
    } else if (q.includes('телефон') || q.includes('смартфон') || q.includes('iphone')) {
        templates = [
            { title: "Apple iPhone 15 Pro Max 256GB", price: "124 990 ₽" },
            { title: "Samsung Galaxy S24 Ultra 512GB", price: "119 000 ₽" },
            { title: "Xiaomi 14 12/512GB", price: "89 990 ₽" },
            { title: "Apple iPhone 13 128GB", price: "59 990 ₽" },
            { title: "POCO X6 Pro 8/256GB", price: "29 500 ₽" },
            { title: "Realme 12 Pro+ 12/512GB", price: "41 990 ₽" },
            { title: "Google Pixel 8 8/128GB", price: "64 000 ₽" },
            { title: "Honor 90 8/256GB", price: "38 990 ₽" },
            { title: "Tecno Pova 5 8/256GB", price: "15 990 ₽" },
            { title: "Infinix Note 30 Pro 8/256GB", price: "18 500 ₽" }
        ];
    } else if (q.includes('планшет') || q.includes('ipad') || q.includes('tab')) {
        templates = [
            { title: "Apple iPad Pro 11 (2022) 128GB", price: "85 900 ₽" },
            { title: "Samsung Galaxy Tab S9 128GB", price: "79 990 ₽" },
            { title: "Xiaomi Pad 6 8/256GB", price: "34 500 ₽" },
            { title: "Apple iPad Air (2022) 64GB", price: "55 000 ₽" },
            { title: "Lenovo Tab P11 Gen 2", price: "24 990 ₽" },
            { title: "Huawei MatePad 11.5 6/128GB", price: "22 990 ₽" },
            { title: "Honor Pad 9 8/256GB", price: "29 990 ₽" },
            { title: "Samsung Galaxy Tab A9+", price: "19 500 ₽" },
            { title: "Realme Pad Mini 4/64GB", price: "14 000 ₽" },
            { title: "Redmi Pad SE 6/128GB", price: "16 990 ₽" }
        ];
    } else if (q.includes('машин') || q.includes('авто') || q.includes('car')) {
        templates = [
            { title: "Geely Monjaro 2.0 AT (238 л.с.)", price: "3 800 000 ₽" },
            { title: "Haval Jolion 1.5T DCT", price: "2 300 000 ₽" },
            { title: "Lada Vesta Cross 1.6 MT", price: "1 750 000 ₽" },
            { title: "Chery Tiggo 7 Pro Max", price: "2 700 000 ₽" },
            { title: "Toyota Camry 2.5 AT", price: "4 500 000 ₽" },
            { title: "Kia K5 2.0 AT", price: "3 200 000 ₽" },
            { title: "Omoda C5 1.5T CVT", price: "2 500 000 ₽" },
            { title: "Hyundai Tucson 2.0 AT", price: "3 900 000 ₽" },
            { title: "Changan CS55 Plus", price: "2 650 000 ₽" },
            { title: "Exeed LX 1.5 CVT", price: "2 950 000 ₽" }
        ];
    }

    // Если категория не распознана, генерируем 10 стандартных ответов
    if (templates.length === 0) {
        for (let i = 1; i <= 10; i++) {
            templates.push({ title: `${searchQuery} (Вариант ${i})`, price: "Уточнить цену" });
        }
    }

    // Превращаем шаблоны в правильный формат для фронтенда
    return templates.map((item, index) => ({
        id: Math.random(),
        title: item.title,
        price: item.price,
        platform: "Резервная база",
        url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(searchQuery)}`,
        shortDesc: "Автоматическая выдача из резервного каталога (включилась защита от ботов)."
    }));
}

// --- 1. ПОИСК ТОВАРОВ ЧЕРЕЗ ВКЛАДКУ "ТОВАРЫ" В ПОИСКОВИКЕ ---
async function scrapeAvito(searchQuery) {
    console.log(`🛒 [ПОИСК ТОВАРОВ] Ищем по запросу: ${searchQuery}`);
    
    // Генерируем 10 умных резервных товаров
    const fallbackData = getSmartFallback(searchQuery);

    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        const url = `https://www.google.com/search?tbm=shop&hl=ru&q=${encodeURIComponent(searchQuery)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        const items = await page.evaluate(() => {
            const results = [];
            const cards = document.querySelectorAll('.sh-dgr__grid-result, .sh-dgr__content, .sh-pr__product-results');
            
            // Пытаемся собрать до 15 товаров (если какие-то окажутся кривыми)
            for (let i = 0; i < Math.min(cards.length, 15); i++) {
                const card = cards[i];
                const titleElement = card.querySelector('h3, h4');
                const linkElement = card.querySelector('a');
                const priceElement = card.querySelector('span b, .a8Pemb, span[data-auto="price"]');
                const platformElement = card.querySelector('.a1W0ex, .IuHnof, [data-merchant-name]');
                
                if (titleElement && linkElement) {
                    const title = titleElement.innerText.trim();
                    const link = linkElement.getAttribute('href'); 
                    const fullUrl = link.startsWith('http') ? link : 'https://www.google.com' + link;
                    
                    const priceText = priceElement ? priceElement.innerText.trim() : "Уточнить цену";
                    const platformText = platformElement ? platformElement.innerText.trim() : "Магазин из поиска";

                    results.push({
                        id: Math.random(),
                        title: title,
                        price: priceText,
                        platform: platformText,
                        url: fullUrl,
                        shortDesc: "Найдено через глобальный поиск во вкладке «Товары»."
                    });
                }
            }
            return results;
        });

        await browser.close();

        // Если реальных результатов меньше 2 (капча или странный ответ), отдаем наши 10 резервных
        if (items.length < 2) {
            console.log("⚠️ Поисковик не отдал достаточно результатов, включаем резерв.");
            return fallbackData;
        }

        // Возвращаем строго первые 10 успешных результатов парсинга
        return items.slice(0, 10);

    } catch (e) {
        console.log(`[!] Ошибка парсинга поисковика: ${e.message}. Включаем резерв.`);
        if (browser) await browser.close();
        return fallbackData; 
    }
}

// --- 2. ПОИСК НОВОСТЕЙ (БЕЗ ИЗМЕНЕНИЙ) ---
async function scrapeNews(searchQuery) {
    console.log(`📰 [NEWS] Ищем новости по запросу: ${searchQuery}`);
    let browser;
    let allNews = [];

    const fallbackNews = [
        {
            id: Math.random(),
            title: `Главные тренды по запросу: ${searchQuery}`,
            url: `https://habr.com/ru/search/?q=${encodeURIComponent(searchQuery)}`,
            platform: "Habr (Архив)",
            shortDesc: "Прямое подключение к новостям сейчас недоступно из-за долгого ответа серверов. Выводим архивную сводку."
        },
        {
            id: Math.random(),
            title: `Что эксперты говорят про ${searchQuery} в этом году`,
            url: `https://vc.ru/search/v2/content/relevant?query=${encodeURIComponent(searchQuery)}`,
            platform: "VC.ru (Архив)",
            shortDesc: "Подборка мнений и аналитики из резервной базы Всезнайки."
        }
    ];

    try {
        browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        const sources = [
            { name: "Habr", url: `https://habr.com/ru/search/?q=${encodeURIComponent(searchQuery)}&target_type=posts&order=date` },
            { name: "CNews", url: `https://www.cnews.ru/search?search=${encodeURIComponent(searchQuery)}` },
            { name: "VC.ru", url: `https://vc.ru/search/v2/content/relevant?query=${encodeURIComponent(searchQuery)}` }
        ];

        for (let site of sources) {
            try {
                await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
                const articles = await page.evaluate((siteName) => {
                    let results = [];
                    if (siteName === "Habr") {
                        const nodes = document.querySelectorAll('article.tm-articles-list__item');
                        nodes.forEach(el => {
                            const titleNode = el.querySelector('h2 a');
                            const bodyNode = el.querySelector('.tm-article-body, .tm-article-snippet__snippet');
                            if(titleNode) {
                                results.push({
                                    title: titleNode.innerText.trim(),
                                    url: titleNode.href,
                                    platform: siteName,
                                    shortDesc: bodyNode ? bodyNode.innerText.substring(0, 150).replace(/\n/g, ' ') + "..." : "Полный текст читайте в источнике."
                                });
                            }
                        });
                    } else {
                        const links = Array.from(document.querySelectorAll('a')).filter(a => a.innerText.trim().length > 40);
                        links.forEach(a => {
                            results.push({
                                title: a.innerText.replace(/\n/g, ' ').trim().substring(0, 100) + "...",
                                url: a.href,
                                platform: siteName,
                                shortDesc: `Свежая новость по вашему запросу. Нажмите, чтобы прочитать подробнее на портале ${siteName}.`
                            });
                        });
                    }
                    return results;
                }, site.name);
                
                const uniqueArticles = Array.from(new Map(articles.map(item => [item.url, item])).values());
                allNews = [...allNews, ...uniqueArticles.slice(0, 15)]; 
            } catch (e) { 
                console.log(`⚠️ Пропуск источника: ${site.name}`); 
            }
        }

        await browser.close();
        
        if (allNews.length === 0) return fallbackNews;

        return allNews.slice(0, 30).map(item => ({ ...item, id: Math.random() }));

    } catch (e) {
        console.log(`[!] Глобальная ошибка парсинга новостей. Включаем резерв.`);
        if (browser) await browser.close();
        return fallbackNews;
    }
}

module.exports = { scrapeAvito, scrapeNews };
