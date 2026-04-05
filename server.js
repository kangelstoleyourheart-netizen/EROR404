const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
// Подключаем нашего обновленного мульти-бота
const { scrapeAvito, scrapeNews } = require('./bot'); 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- НАСТРОЙКА ПОЧТЫ (ДЛЯ РЕГИСТРАЦИИ) ---
// ВНИМАНИЕ: Для Gmail нужно создать "Пароль приложения" в настройках аккаунта Google
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vash-email@gmail.com', // Твоя почта
        pass: 'abcd efgh ijkl mnop'   // Твой 16-значный пароль приложения
    }
});

// --- РОУТ: ОТПРАВКА КОДА НА ПОЧТУ ---
app.post('/api/send-code', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email не указан" });

    const code = Math.floor(1000 + Math.random() * 9000); // Генерируем 4 цифры
    console.log(`📧 Отправка кода ${code} на почту ${email}`);

    const mailOptions = {
        from: '"MultiSearch AI" <vash-email@gmail.com>',
        to: email,
        subject: 'Код подтверждения MultiSearch',
        text: `Ваш проверочный код: ${code}. Никому не сообщайте его!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Ошибка почты:", error);
            // Для хакатона: если почта не настроена, всё равно отвечаем успехом, чтобы не ломать демо
            return res.json({ success: true, message: 'Режим демо: код 1234 (почта не настроена)', demoCode: "1234" });
        }
        res.json({ success: true, message: 'Код отправлен!', code: code }); 
    });
});

// --- РОУТ: ПОИСК ТОВАРОВ (AVITO + YOULA) ---
app.get('/api/search', async (req, res) => {
    const query = req.query.q; 
    if (!query) return res.status(400).json({ error: "Пустой запрос" });

    console.log(`\n--- 🔎 Мульти-поиск техники: ${query} ---`);
    
    // Бот теперь возвращает массив сразу из нескольких источников
    const results = await scrapeAvito(query);
    res.json(results);
});

// --- РОУТ: МУЛЬТИ-НОВОСТИ (HABR + VC + CNEWS) ---
app.get('/api/news', async (req, res) => {
    const query = req.query.q || "технологии"; 
    
    console.log(`--- 📰 Сбор новостей по теме: ${query} ---`);
    const articles = await scrapeNews(query);
    res.json(articles);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`
    🚀 СЕРВЕР ЗАПУЩЕН: http://localhost:${PORT}
    ------------------------------------------
    🛒 Поиск товаров: /api/search?q=iphone
    📰 Новости: /api/news?q=ai
    📧 Почта: /api/send-code (POST)
    ------------------------------------------
    `);
});