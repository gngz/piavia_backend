


function getByIcao (db, icao, callback) {

    const sql = 'SELECT * FROM airports WHERE icao = ?';
    db.get(sql, [icao], (err,row) => {
        callback(row)
    })
  
}





module.exports = {
    getByIcao,
}