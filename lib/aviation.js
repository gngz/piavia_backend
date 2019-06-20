// All aviation data related 

const https = require('http');
const aircraftDB = require('../data/aircrafts.json')
const request = require('request');
var parseString = require('xml2js').parseString;



module.exports.getAircraftData = function (hex) {
    return aircraftDB[hex];
}

module.exports.getAirportData = function (icao, callback) {
    request(`http://www.airport-data.com/api/ap_info.json?icao=${icao}`, (err, res, body) => {
        if (err) { return console.log(err); }
        callback(JSON.parse(body));
    });
}


module.exports.getAircraftPhoto = function (hex, callback) {
    request(`http://www.airport-data.com/api/ac_thumb.json?m=${hex}&n=1`, (err, res, body) => {
        if (err) { return console.log(err); }
        callback(JSON.parse(body));
    });
}



module.exports.getMetar = function (icao, callback) {
    request(`https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${icao}&hoursBeforeNow=1`, (err, res, body) => {
        if (err) { return console.log(err); }

        parseString(body, function (err, result) {
            if (err) {return console.log(err); }
            
            callback(result.response.data[0].METAR[0]);
        });

       
    });
}



module.exports.getTAF = function (icao, callback) {
    request(`https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&stationString=${icao}&hoursBeforeNow=1`, (err, res, body) => {
        if (err) { return console.log(err); }

        parseString(body, function (err, result) {
            if (err) {return console.log(err); }
            
            callback(result.response.data[0].TAF[0]);
        });

       
    });
}