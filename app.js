require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const { sequelize } = require('./models');
const contactRoutes = require('./routes/contact');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const app = express();

// Настройка шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Настройка сессий
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 дней
}));

app.use(flash());

// Глобальные переменные для шаблонов
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.cartCount = (req.session.cart || []).reduce((sum, item) => sum + item.quantity, 0);
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use('/delivery', require('./routes/delivery'));
app.use('/auth', require('./routes/auth'));
app.use('/contact', contactRoutes);

// Error handling
app.use((req, res, next) => {
    res.status(404).render('error', { 
        message: 'Страница не найдена',
        layout: 'layouts/main'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Внутренняя ошибка сервера',
        layout: 'layouts/main'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('База данных подключена');
        console.log(`Сервер запущен на порту ${PORT}`);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}); 