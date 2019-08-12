const request = require('request');
var parse = require('xml2js').parseString;




module.exports.getMetar = function (icao) {

    return new Promise(function (resolve,reject) {
        request(`https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${icao}&mostRecent=true&hoursBeforeNow=1`,function(error,response,body) {
            if(error)
                reject(error)
            

            parse(body, {explicitArray : false , mergeAttrs : true},function (err, result) {
                if(err)
                    reject(err)

                resolve(result.response.data.METAR)
            })
           
        })

    })
}


module.exports.getTaf = function (icao) {

    return new Promise(function (resolve,reject) {
        request(`https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&stationString=${icao}&mostRecent=true&hoursBeforeNow=1`,function(error,response,body) {
            if(error)
                reject(error)
            

            parse(body, {explicitArray : false , mergeAttrs : true},function (err, result) {
                if(err)
                    reject(err)

                resolve(result.response.data.TAF)
            })
           
        })

    })
}
