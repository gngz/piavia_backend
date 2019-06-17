const net = require('net');
const client = new net.Socket();


var decFlight = [];
var posHistory = [];

client.connect(30003,'192.168.1.99', function () {
   
});

client.on('data', function(data) {

    var raw = data.toString().split(',');

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
    addParam(hexcode,"onground",raw[21].substr(0,1))

    var lastDate = raw[6];
    var lastTime =  raw[7].substr(0,8);

    addParam(hexcode,"lastMsg", lastDate + " " + lastTime)

    var msgType = raw[1];
 
    if(msgType === "3") addHistory(hexcode,raw[14],raw[15])
});


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
        var index =  decFlight.push({"hex" : hex})
        
    }  else {
        if( value !== "") {
            decFlight[pos][name] = value;
        }

    }

    
}

function addHistory(hex,lat,long) {
    var pos = {lat,long};
    var exists = false;
    var idx = 0

    posHistory.forEach(function(val,index) {
        if(val.hex === hex) {
            exists = true;
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

function dataMaintenance() {
    decFlight.forEach(function (val, idx, self) {
        var secs = Math.floor((new Date().getTime() - new Date(val.lastMsg).getTime()) / 1000)
        if(secs > 59) {

            decFlight = arrayRemove(decFlight,val.hex);
            posHistory = arrayRemove(posHistory,val.hex);
            
        }
    });
}


setInterval(dataMaintenance,250)

setInterval(prettyPrint,1000)



function prettyPrint() {
  
    
    console.clear();
 

    decFlight.forEach(function (data ) {
        var secs = Math.floor((new Date().getTime() - new Date(data.lastMsg).getTime()) / 1000)
        console.log(data.hex, data.callsign, data.alt, data.hdg ,data.gs,data.lat, data.long, secs)
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

function arrayRemove(arr, value) {

    return arr.filter(function(ele){
        return ele.hex != value;
    });
 
 }
 