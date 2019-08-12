
function getByCallsign (db, callsign, callback) {

    return new Promise(function(resolve,reject) {
        const sql = 'SELECT * FROM routes WHERE callsign = ?';
        db.get(sql, [callsign], (err,row) => {
            if(err)
                reject(err)
            resolve(row)
        })
    })

   
  
}


module.exports = {
    getByCallsign,
}