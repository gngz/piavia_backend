const net = require('net');
const client = new net.Socket();

var decFlight = [];
var posHistory = [];

client.connect(30003,'192.168.1.99', function () {
   
});

client.on('data', function(data) {

    var raw = data.toString().split(',');


    if(data == undefined || String(data).trim().length == 0)
        return;

    var hexcode = raw[4];

    addParam(hexcode,"callsign",raw[10])
    addParam(hexcode,"alt",raw[11])
    addParam(hexcode,"gs",raw[12])
    addParam(hexcode,"hdg",raw[13])
    addParam(hexcode,"lat",raw[14])
    addParam(hexcode,"long",raw[15])
    addParam(hexcode,"vs",raw[16])
    addParam(hexcode,"squawk",raw[17])
    addParam(hexcode,"emergency",raw[19])
    addParam(hexcode,"ident",raw[20])
    if(typeof raw[21] == "string"){
        addParam(hexcode,"onground",raw[21].substr(0,1))
    } 

    var lastDate = raw[6];
    
    var lastTime = String(raw[7]).substr(0,8);

    addParam(hexcode,"lastMsg", lastDate + " " + lastTime)

    var msgType = raw[1];
 
    if(msgType === "3") addHistory(hexcode,raw[14],raw[15],raw[11])
});

/*
    Function to add information from an aircraft to aircraft information array
*/

function addParam(hex,name,value) {

    var exists = false;
    var pos = 0;

    decFlight.forEach(function (val, idx) {
        if(val.hex === hex) {
            exists = true;
            pos = idx;
        }
    });

    if(!exists) {
         decFlight.push({"hex" : hex})
        
    }  else {
        if( value !== "") {
            decFlight[pos][name] = value;
        }
        

    }

    
}

/*
    Function to add position to aircraft position history array
*/

function addHistory(hex,lat,long,alt) {
    var pos = {lat,long,alt};
    var exists = false;
    var idx = 0

    posHistory.forEach(function(val,index) {
        if(val.hex === hex) {
            exists = true;
            idx = index;
        }
    });

    if(!exists) {
        var index = posHistory.push({hex})
        posHistory[index-1].pos = [];
        posHistory[index-1].pos.push(pos);
    } else {

        posHistory[idx].pos.push(pos)
    }
    
}

/*

    Function to remove bad aircraft messages and timedout aircraft information/position.

*/

function dataMaintenance() {
    decFlight.forEach(function (val, idx, self) {
        var secs = Math.floor((new Date().getTime() - new Date(val.lastMsg).getTime()) / 1000)
        
        if(val.hex.length !== 6) { // Remove bad decoded messages
            decFlight = arrayRemove(decFlight,val.hex);
            posHistory = arrayRemove(posHistory,val.hex);
        }
        
        if(secs > 59) { // Clean aircraft history that doesnt sends messages since a minute ago

            decFlight = arrayRemove(decFlight,val.hex);
            posHistory = arrayRemove(posHistory,val.hex);
            
        }


    });
}






function prettyPrint() {
  
    
    console.clear();
    console.log("PiAvia Information")
    console.log("HEXCODE\t\tCALLSIGN\tALTITUDE  \tHEADING  \tGROUNDSPEED\tLATITUDE\tLONGITUDE\tTi\t")
    decFlight.forEach(function (data ) {
        var icao24 = data.hex;
        var callsign = (data.callsign == undefined ? "--------": data.callsign); 
        var altitude = (data.alt == undefined ? "-----": data.alt); 
        var heading = (data.hdg == undefined ? "---": data.hdg); 
        var groundspeed = (data.gs == undefined ? "---": data.gs);
        var latitude = (data.lat == undefined ? "--------": data.lat);
        var longitude = (data.long == undefined ? "--------": data.long);

        var secs = Math.floor((new Date().getTime() - new Date(data.lastMsg).getTime()) / 1000)
        //console.log(data.hex, "\t\t" ,data.callsign, "\t" , data.alt , "\t" , data.hdg , "\t" ,data.gs, "\t" ,data.lat, "\t" , data.long, "\t" , secs, "\t" )
        console.log(`${data.hex}\t\t${callsign}\t${altitude}\t\t${heading}\t\t${groundspeed}\t\t${latitude}\t${longitude}\t${secs}`)
    })
    
    
}


function deleteHistory(hex) {
    posHistory.forEach( function(data) {
        if(data.hex === hex) {
            delete data;
        }
    });
}

module.exports.getFlights = function() {

    return JSON.stringify(decFlight);
}

module.exports.getFlightsBounded = function(lat_a,long_a,lat_b,long_b) {
    var filtered = decFlight.filter(function (val) {
        return (Number(val.lat) <= Number(lat_a) && Number(val.lat) >= Number(lat_b)) && (Number(val.long) >= Number(long_a) && Number(val.long) <= Number(long_b));
    });

    return JSON.stringify(filtered);
}

module.exports.getHistory = function() {

    return JSON.stringify(posHistory);
}

module.exports.getHistoryByFlight = function (hex) {
   
    var history = "{}";

    posHistory.forEach( function(data) {
    
            if(data.hex === hex) {
                found = true;
                history = data;
            }
    })

    return history;
}


module.exports.runPrettyPrint = function() {
    setInterval(prettyPrint,1000)
}

function arrayRemove(arr, value) {

    return arr.filter(function(ele){
        return ele.hex != value;
    });
 
 }
 

/*
   
*/


setInterval(dataMaintenance,250)


