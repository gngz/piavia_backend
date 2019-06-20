const userController = require("./lib/user");
const adsb = require("./lib/adsb");
const aviation = require("./lib/aviation");

const express = require('express')
const app = express()
const port = 9090;

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/adsb', (req, res) =>{ 
    
    res.type('json');
    res.set("Access-Control-Allow-Origin" ,"*")
    res.send(adsb.getFlights())
})

app.get('/adsb/:lat_a/:long_a/:lat_b/:long_b', (req, res) =>{ 
    res.type('json')
    res.set("Access-Control-Allow-Origin" ,"*")
    res.send(adsb.getFlightsBounded(req.params.lat_a,req.params.long_a,req.params.lat_b,req.params.long_b))
})


app.get('/history', (req, res) => {
    res.type('json')
    res.set("Access-Control-Allow-Origin" ,"*")
    res.send(adsb.getHistory())

})

app.get('/history/:hex', function (req, res) {
    res.type('json')
    res.set("Access-Control-Allow-Origin" ,"*")
    res.send(adsb.getHistoryByFlight(req.params.hex))
});


app.get('/aircraft/:hex', function (req, res) {
    res.type('json')
    res.set("Access-Control-Allow-Origin" ,"*")
    res.send(aviation.getAircraftData(req.params.hex))
});

app.get('/airport/:icao', function (req, res) {
    res.type('json')
    res.set("Access-Control-Allow-Origin" ,"*")

    aviation.getAirportData(req.params.icao, function(data) {
        res.send(data) 
    })
   
});

app.get('/photo/:hex', function (req, res) {
    res.type('json')
    res.set("Access-Control-Allow-Origin" ,"*")

    aviation.getAircraftPhoto(req.params.hex, function(data) {
        res.send(data) 
    })
   
});

app.get('/weather/metar/:icao', function (req, res) {
    res.type('json')
    res.set("Access-Control-Allow-Origin" ,"*")

    aviation.getMetar(req.params.icao, function(data) {
        res.send(data) 
    })
   
});

app.get('/weather/taf/:icao', function (req, res) {
    res.type('json')
    res.set("Access-Control-Allow-Origin" ,"*")
    
    aviation.getTAF(req.params.icao, function(data) {
        res.send(data) 
    })
   
});



app.listen(port, () => {});


console.log("Welcome to PiAvia")
