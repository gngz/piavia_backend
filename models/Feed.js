const net = require('net');
const client = new net.Socket();

var flightInformation = [];
var flightHistroy = [];


flightInformation.push({
    icao24 : "4952A2",
    callsign: "TAP1696",
    altitude : 1650,
    heading: 0 ,
    vspeed : 1500,
    gspeed: 200,
    latitude: 0 ,
    longitude: 0 ,
    squawk: 0,
    onGround: adsbBool(0),
    ident: adsbBool(0),
    lastMsg: Date.now()
})

function connect(hostname, port) {
    client.connect(port,hostname,function () {
        console.log("Connected to adsb feed") // Fix the output message
    })
}

function getFlightHistory() {
    return flightHistroy.slice();
}

function getFlightHistoryByIcao24(icao24) {
    icao24 = icao24.toUpperCase()
    var historyObj= flightHistroy.find(flight => flight.icao24 == icao24)

    if (historyObj) {

        return historyObj.history
    }
        
   
   
        return []
}


function getFlightFeed() {
    return flightInformation.slice();
}

function getFlightFeedByCoords(posA,posB) {
    let feed = getFlightFeed()

    feed = feed.filter((flight) => {
        
        return (flight.latitude <= posA.latitude && flight.latitude >= posB.latitude) &&
                (flight.longitude >= posA.longitude && flight.longitude <= posB.longitude)
    })

    return feed
}

function getFlightByIcao24(icao24){
    icao24 = icao24.toUpperCase()
    return Object.assign({},flightInformation.find(flight => flight.icao24 == icao24))
}

client.on('data', function(data) {
    
    var message = data.toString().split(',')
    
    const msgType = message[0]

    if(msgType === "MSG") {

        const transType = Number(message[1]);
        const icao24 = message[4];

        

     


        var callsign = message[10].trim() || null
        var altitude = Number(message[11]) 
        var gspeed = Number(message[12])
        var heading = Number(message[13])
        
        var vspeed = Number(message[16])
        var squawk = Number(message[17])
        var onGround = adsbBool(Number(message[21]))
        var ident = adsbBool(Number(20))
        

        var latitude = message[14]
        var longitude = message[15]

        if(latitude == "" && longitude == "") {
            latitude = null
            longitude = null
        } else {
            latitude = Number(latitude)
            longitude = Number(longitude)
        }

        var flight  = exists(flightInformation,icao24)

        if(!flight) {
            flight = {  icao24,
                        "callsign" : null,
                        "altitude" : null,
                        "gpseed"   : null,
                        "heading"  : null,
                        "vspeed"   : null,
                        "squawk"   : null,
                        "onGround" : null,
                        "ident"    : null,
                    };
            flightInformation.push(flight);
        }

        
        if(transType == 1) {
            flight.callsign = callsign;
        } else if (transType == 2) {
            flight.altitude = altitude;
            flight.gspeed = gspeed;
            flight.heading = heading;
            flight.latitude = latitude ;
            flight.longitude = longitude ;
            flight.onGround = onGround;
        } else if (transType == 3) {
            flight.altitude = altitude;
            flight.latitude = latitude ;
            flight.longitude = longitude;
            flight.isGround = onGround;
            flight.ident = ident;
        } else if (transType == 4) {
            flight.gspeed = gspeed;
            flight.heading = heading;
            flight.vspeed = vspeed;
        } else if (transType == 5) {
            flight.altitude = altitude;
            flight.isGround = onGround;
            flight.ident = ident;
        } else if (transType == 6) {
            flight.altitude = altitude;
            flight.isGround = onGround;
            flight.squawk = squawk;
            flight.ident = ident;
        } else if (transType == 7) {
            flight.altitude = altitude;
            flight.isGround = onGround;
        } else if (transType == 8) {
            flight.isGround = onGround;
        }
        
        flight.lastMsg = Date.now()  
      
    }

})

client.on('close', function() {
    console.log('Connection closed with adsb feed') // fix

})

function adsbBool(val) {
    return val == -1 ? true : false
}

function exists(array = [], icao24) {
   return array.find(value => value.icao24 == icao24) 
}

function maintenance() {
    flightInformation.forEach((flight, idx) => {
        var secs = Math.floor( (Date.now() - flight.lastMsg) / 1000);
        if(secs >= 60) {
            flightInformation.splice(idx,1)
            historyIdx = flightHistroy.findIndex(history => history.icao24 == flight.icao24)
            //flightHistroy.splice(historyIdx,1)

        }
            
    })
}

function history() {
    console.clear()
    flightInformation.forEach(val => {
        
        console.log(val.icao24, val.callsign, Math.floor((Date.now() - val.lastMsg)/1000 ) )
    })


    flightInformation.forEach(flight => {
        if(flight.icao24 && flight.altitude && flight.heading && flight.latitude && flight.longitude) {
            

            
            var histObj  = exists(flightHistroy,flight.icao24)

         
        
            var obj = {
    
                altitude  : flight.altitude,
                heading   : flight.heading,
                latitude  : flight.latitude,
                longitude : flight.longitude,
            }


            if(!histObj) {
                obj.id = 0
                flightHistroy.push({
                    icao24 : flight.icao24,
                    history : [obj]
                });
            } else {
                const newid = histObj.history.slice(-1)[0].id + 1
                obj.id = newid;
                histObj.history.push(obj)
            }
            
            

        }
    })

}

setInterval(maintenance,500)
setInterval(history,1000)



module.exports = {
    connect,
    getFlightFeed,
    getFlightHistory,
    getFlightByIcao24,
    getFlightHistoryByIcao24,
    getFlightFeedByCoords
}

