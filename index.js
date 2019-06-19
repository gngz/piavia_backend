const userController = require("./lib/user");
const adsb = require("./lib/adsb");

const express = require('express')
const app = express()
const port = 9090;

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/adsb', (req, res) =>{ 
    
    res.set("Access-Control-Allow-Origin" ,"*")
    res.send(adsb.getFlights())})

app.get('/history', (req, res) => res.send(adsb.getHistory()))

app.get('/history/:hex', function (req, res) {
    res.set("Access-Control-Allow-Origin" ,"*")
    res.send(adsb.getHistoryByFlight(req.params.hex))
});

app.listen(port, () => {});


console.log("Welcome to PiAvia")
