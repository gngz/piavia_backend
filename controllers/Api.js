var port = 9090;
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

const path = require('path');
const db = require("../libs/db")
const auth = require("../libs/auth")


const AircraftModel = require("../models/Aircraft")
const AirportModel = require("../models/Airports")
const RouteModel = require("../models/Routes")
const WeatherModel = require("../models/Weather")
const UsersModel = require("../models/Users")
const FeedModel = require("../models/Feed")
const key = "12asdada45"

FeedModel.connect("192.168.1.99","30003")


app.use(function (req,res,next) {
    res.set("X-Powered-By" , "PiAvia Backend Server");
    next()
})

// CORS Middleware

app.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin" ,"*")
    res.set("Access-Control-Allow-Headers" ,"*")
    next()
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('PiAvia Backend Root')) 


function protectedRoute (req,res,next) {
    var token = req.headers['x-access-token'];

    jwt.verify(token,key,function(err,decoded) {
        if(err) {
            if(err.name ==  'TokenExpiredError') {
                res.json( {"error" : "TOKEN_EXPIRED"})
            } else {
                res.status(401).json( {"error" : "NOT_AUTHENTICATED"})
            }
        }
        
        req.userdata = decoded;
        next();
    })
}



app.get('/prot',protectedRoute, (req,res)=> {

    res.send("PROTEGIDO")
})


app.post('/login', async (req, res) =>{
   
    const username = req.body.username;
    const password = req.body.password;
    const remember = req.body.remember;

    let conn = db.getConn()

    try {
       var user_data = await  UsersModel.getByUsername(conn,username)


       if(user_data) {
            if(bcrypt.compareSync(password,user_data.password)){
                if(remember) {
                    var token = jwt.sign({username},key,{ expiresIn: '30 days'});
                } else {
                    var token = jwt.sign({username},key,{ expiresIn: '1 hour'});
                }
                

                res.json({
                    username,
                    token
                })
            } else {
                res.status(401).json( {"error" : "WRONG_USER_PASSWORD"})
            }

            
       } else {
            res.status(401).json( {"error" : "USER_NOT_FOUND"})
       }

    } catch (ex) {
        res.json( {"error" : ex})

    }
    



})


app.get('/feed', (req,res) => {
    let data = FeedModel.getFlightFeed() ;

    data = data.filter(flight => {
        return flight.latitude != undefined && flight.longitude != undefined
    })

    res.json(data)
})


app.get("/feed/:latA/:longA/:latB/:longB", (req,res) => {  

    const latA = req.params.latA
    const longA = req.params.longA
    const latB = req.params.latB
    const longB = req.params.longB

    if(isNaN(latA) && isNaN(latB) && isNaN (longA) && isNaN(longB)) {
        res.status(400).json({"error" : "Invalid positions"})
    } else {
        let data =  FeedModel.getFlightFeedByCoords({"latitude": latA, "longitude" : longA} , {"latitude" : latB, "longitude" : longB});

        res.json(data)
    }

})



app.get('/weather/metar/:icao',  (req, res) => { 
    res.type('json')
    const icao = req.params.icao

    let icao_valid = icao.match(/^[A-Z]{4}$/i)

    if(icao_valid) {

        WeatherModel.getMetar(icao).then(response => {
            if(response != null) {
                res.send(response)
            } else {
                res.status(400).send({"error" : "ICAO_DONT_EXISTS"})
            }
            
        })


    } else {
        res.status(400).send({"error" : "ICAO_NOT_VALID"})
    }
})

app.get('/weather/taf/:icao',  (req, res) => { 
    res.type('json')
    const icao = req.params.icao

    let icao_valid = icao.match(/^[A-Z]{4}$/i)

    if(icao_valid) {

        WeatherModel.getTaf(icao).then(response => {
            if(response != null) {
                res.send(response)
            } else {
                res.status(400).send({"error" : "ICAO_DONT_EXISTS"})
            }
            
        })


    } else {
        res.status(400).send({"error" : "ICAO_NOT_VALID"})
    }
})

// TO DO

app.get('/flight/:icao24',  async (req, res) => {
    const icao24 = req.params.icao24

    let conn = db.getConn()
    let icao24_valid = icao24.match(/^[a-fA-F0-9]{0,6}$/)
   

    if(icao24_valid) {

        try {
            flight_data = FeedModel.getFlightByIcao24(icao24)
            flight_history = FeedModel.getFlightHistoryByIcao24(icao24)
            aircraft_data =  await AircraftModel.getByIcao24(conn, icao24.toLowerCase());
            route_data = await RouteModel.getByCallsign(conn, flight_data.callsign)

            if(route_data) delete route_data.callsign;
            if(flight_data) {
                delete flight_data.icao24
                delete flight_data.lastMsg
            }

    
            res.json({ aircraft : aircraft_data || {icao24}, route : route_data  || {}, flight: flight_data, history: flight_history})
        } catch (ex) {
            console.log(ex)
        }
   
        
    } else {
        res.status(400).send({"error" : "ICAO_NOT_VALID"})
    }

})


app.get('/airport/:icao', (req, res) => {
    const icao = req.params.icao
    let conn = db.getConn()


    let icao_valid = icao.match(/^[A-Z]{4}$/i)


    if(icao_valid) {
        AirportModel.getByIcao(conn,icao, (airport) => {
            if(airport) {
                res.send(airport);
            } else {
                res.json({"error" : "ICAO_DONT_EXISTS"});
            }
        })
    } else {
        res.status(400).send({"error" : "ICAO_NOT_VALID"})
    }

    
})



module.exports.run = function (callback) {
    app.listen(port,callback)
    // check database

    

    const MAIN_DBPFOLDER = path.resolve(__dirname,"..");
    const DB_PATH =  MAIN_DBPFOLDER  + "/aviation.db"


    db.connect(DB_PATH, err => {
        if(!err) {
            console.log("Sucessfull connection with database");
        } else {
            console.error("Error connecting to database");
        }
    });
}