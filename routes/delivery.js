const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('delivery/index', {
        title: 'Доставка',
        deliveryInfo: {
            regions: [
                {
                    name: 'Москва и Московская область',
                    price: 'Бесплатно',
                    time: '1-2 дня'
                },
                {
                    name: 'Санкт-Петербург',
                    price: 'Бесплатно',
                    time: '2-3 дня'
                },
                {
                    name: 'Другие регионы России',
                    price: 'от 500 ₽',
                    time: '3-7 дней'
                }
            ],
            methods: [
                {
                    name: 'Курьерская доставка',
                    description: 'Доставка до двери в удобное для вас время'
                },
                {
                    name: 'Пункты выдачи',
                    description: 'Более 1000 пунктов выдачи по всей России'
                },
                {
                    name: 'Почта России',
                    description: 'Доставка в любой населенный пункт'
                }
            ],
            conditions: [
                'Минимальная сумма заказа - 3000 ₽',
                'Бесплатная доставка при заказе от 10000 ₽',
                'Возможность отслеживания заказа',
                'Страхование отправлений'
            ]
        }
    });
});

module.exports = router; 