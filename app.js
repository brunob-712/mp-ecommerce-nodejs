const express = require('express');
const exphbs = require('express-handlebars');
const mercadopago = require('mercadopago');

const mercadoPagoPreference = (baseUrl, price, title, picture_url) => {
    return new Promise((resolve, reject) => {
        mercadopago.configure({
            access_token: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398',
            integrator_id: "dev_24c65fb163bf11ea96500242ac130004"
        });

        let preference = {
            notification_url: `${baseUrl}/notifications`,
            payer: {
                phone: { area_code: '11', number: 22223333 },
                address: { zip_code: '1111', street_name: 'False', street_number: 123 },
                email: 'test_user_63274575@testuser.com',
                identification: { number: '', type: '' },
                name: 'Lalo',
                surname: 'Landa'
            },
            // redirect_urls: {
            //     failure: `${baseUrl}/failure`,
            //     pending: `${baseUrl}/pending`,
            //     success: `${baseUrl}/success`
            // },
            back_urls: {
                success: `${baseUrl}/success`,
                pending: `${baseUrl}/pending`,
                failure: `${baseUrl}/failure`
            },
            "auto_return": "approved",
            items: [
                {
                    id: 1234,
                    title: title,
                    currency_id: "ARS",
                    unit_price: price,
                    quantity: 1,
                    description: "Dispositivo móvil de Tienda e-commerce",
                    picture_url: picture_url.replace("./", "https://brunob-712-mp-commerce-nodejs.herokuapp.com/"),
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
                resolve(response.body.id);
                console.log(response.body);
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
    const baseUrl = req.protocol + "://" + req.headers.host;
    mercadoPagoPreference(baseUrl, parseInt(req.query.price), req.query.title, req.query.img)
        .then((id) => {
            req.query.id = id;
            res.render('detail', req.query);
        })
});

app.get('/success', (req, res) => {
    res.render('success', req.query);
});
app.get('/pending', (req, res) => {
    res.render('pending', req.query);
});
app.get('/failure', (req, res) => {
    res.render('failure', req.query);
});

app.post("/notifications", (req, res) => {
    console.log(req.body); // Call your action on the request here
    res.status(200).end(); // Responding is important
    // var http = require('http');
    // var server = http.createServer(function (request, response) {

    //     response.writeHead(200, { "Content-Type": "text\plain" });
    //     if (request.method == "GET") {
    //         response.end("received GET request.")
    //     }
    //     else if (request.method == "POST") {
    //         response.end("received POST request.");
    //     }
    //     else {
    //         response.end("Undefined request .");
    //     }
    // });

    // server.listen(8000);
    // console.log("Server running on port 8000");
});


app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.listen(process.env.PORT || 3000, console.log("server running on port 3000"));
