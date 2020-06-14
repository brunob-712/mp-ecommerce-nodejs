const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const mercadopago = require('mercadopago');

const mercadoPagoPreference = (req, baseUrl, price, title, picture_url) => {
    return new Promise((resolve, reject) => {
        mercadopago.configure({
            access_token: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398',
            integrator_id: "dev_24c65fb163bf11ea96500242ac130004"
        });
        console.log("picture_url: ", picture_url);
        const editedPictureUrl = req.query.image ? encodeURIComponent(picture_url.replace("./", "https://brunob-712-mp-commerce-nodejs.herokuapp.com/")) : "";
        const back_params = `img=${encodeURIComponent(picture_url)}&title=${title}&price=${price}&unit=1`;
        console.log("back_params:", back_params);
        console.log(`req.query:
        ${JSON.stringify(req.query)}
        `)
        let preference = {
            notification_url: "https://brunob-712-mp-commerce-nodejs.herokuapp.com/notifications",
            payer: {
                phone: { area_code: '11', number: 22223333 },
                address: { zip_code: '1111', street_name: 'False', street_number: 123 },
                email: 'test_user_63274575@testuser.com',
                identification: { number: '471923173', type: '' },
                name: 'Lalo',
                surname: 'Landa'
            },
            back_urls: {
                success: `https://brunob-712-mp-commerce-nodejs.herokuapp.com/success/${back_params}`,
                pending: `https://brunob-712-mp-commerce-nodejs.herokuapp.com/pending/${back_params}`,
                failure: `https://brunob-712-mp-commerce-nodejs.herokuapp.com/failure/${back_params}`
            },
            // "auto_return": "approved",
            items: [
                {
                    id: 1234,
                    title: title,
                    description: "Dispositivo móvil de Tienda e-commerce",
                    picture_url: editedPictureUrl,
                    quantity: 1,
                    unit_price: price,
                    currency_id: "ARS",
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
        console.log("req.query.price: ", req.query.price)
        if (req.query.price) {
            console.log("preference:", preference)
            mercadopago.preferences
                .create(preference)
                .then((response) => {
                    resolve(response.body.id);
                }).catch(function (error) {
                    console.log(error);
                    reject(error);
                });
        }
    })
}

var app = express();
app.use(bodyParser.json());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    const baseUrl = req.protocol + "://" + req.headers.host;
    if (req.query.img) {
        mercadoPagoPreference(req, baseUrl, parseInt(req.query.price), req.query.title, req.query.img)
            .then((id) => {
                req.query.id = id;
                res.render('detail', req.query);
            })
    } else {
        res.render('detail', req.query);
    }
});

app.get('/success', (req, res) => {
    res.render('success', req.query)
});
app.get('/pending', (req, res) => {
    res.render('pending', req.query);
});
app.get('/failure', (req, res) => {
    res.render('failure', req.query);
});

app.post("/notifications", (req, res, next) => {
    console.log(req.body)
    res.status(200).send("OK").end();
});


app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.listen(process.env.PORT || 3000, console.log("server running on port 3000"));
