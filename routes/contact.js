const express = require('express');
const router = express.Router();
const { ContactMessage } = require('../models');

router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        await ContactMessage.create({ name, email, message });
        req.flash('success', 'Сообщение успешно отправлено!');
        res.redirect('/contact');
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        req.flash('error', 'Ошибка при отправке сообщения');
        res.redirect('/contact');
    }
});

module.exports = router; 