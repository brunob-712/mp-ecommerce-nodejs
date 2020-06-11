var express = require('express');
var exphbs = require('express-handlebars');
const mercadopago = require('mercadopago');

const mercadoPagoPreference = (price, title, picture_url) => {
    return new Promise((resolve, reject) => {
        mercadopago.configure({
            access_token: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398'
        });

        let preference = {
            items: [
                {
                    id: 1234,
                    title: title,
                    currency_id: "ARS",
                    unit_price: price,
                    quantity: 1,
                    description: "Dispositivo móvil de Tienda e-commerce",
                    picture_url: picture_url,
                    external_reference: "brunob712@hotmail.com",
                }
            ],
            payment_methods: {
                excluded_payment_methods: [
                    {
                        id: "amex"
                    }
                ],
                excluded_payment_types: [
                    {
                        id: "atm"
                    }
                ],
                installments: 6
            }
        };
        mercadopago.preferences.create(preference)
            .then((response) => {
                // Este valor reemplazará el string "$$init_point$$" en tu HTML
                // global.init_point = response.body.init_point;
                resolve(response.body.init_point);
                console.log(response.body.init_point);
            }).catch(function (error) {
                console.log(error);
                reject(error);
            });
    })
}

var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    mercadoPagoPreference(parseInt(req.query.price), req.query.title, req.query.img)
        .then((init_point) => {
            req.query.init_point = init_point;
            res.render('detail', req.query);
        })
});

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.listen(process.env.PORT || 3000, console.log("server running on port 3000"));
