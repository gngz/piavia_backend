
var port = 9090;
var interactive_mode = false;
parseArgs(process.argv);

console.log("Welcome to PiAvia")
console.log("Loading modules")

const adsb = require("./lib/adsb");
const userController = require("./lib/user");
const aviation = require("./lib/aviation");

const express = require('express')
const app = express()


if(interactive_mode) {
    adsb.runPrettyPrint();
}

app.get('/', (req, res) => res.send('PiAvia Backend Root'))

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



app.listen(port, () => {
    console.log("PiAvia listening on port:", port)
});



function printHelp() {

    console.log("Usage: piavia [options] <input>");
    console.log();
    console.log("-h\t\tPrint usage information.")
    console.log("-v\t\tPrint PiAvia version.")
    console.log("-i\t\tRun PiAvia in interactive mode.")
    console.log("-p <port>\tSet PiAvia port.")
}


function printVersion() {

    console.log("PiAvia - Version 0.0.1");
}

function parseArgs(argv) {
    if(argv.length > 2) {

        var arg_help = false;
        var arg_port = false;
        var arg_inter = false;
        var arg_version = false;
        var new_port;
        
        argv.forEach((val, index)=> {
            if(val == "-h")
                arg_help = true;
    
            if(val == "-p") {
                arg_port = true;
                new_port = argv[index+1];    
            }
               
    
            if(val == "-i")
                arg_inter = true;
    
            if(val == "-v")
                arg_version = true;
        })
    
        if(arg_help) {
            printHelp();
            process.exit();
        }
    
        if(arg_version) {
            printVersion();
            process.exit();
        }
    
        if(arg_inter) {
            interactive_mode = true;
        }
    
        if(arg_port) {
            if(!isNaN(new_port)){
                    port = new_port;
            } else {
                console.log("Write a valid port value.")
                process.exit();
            }
        }
    
    
    }
}