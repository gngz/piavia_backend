
function getByIcao24 (db, icao24) {

    return new Promise(function(resolve,reject) {
        const sql = 'SELECT * FROM aircraft WHERE icao24 = ? COLLATE NOCASE';


        db.get(sql, [icao24], (err,row) => {
            if(err) 
                reject(err)
                
            resolve(row)
        })
    })

    

  
}


function insertAircraft(db, aircraft) {
    const icao24 = aircraft.icao24;
    const reg = aircraft.regid;
    const type = aircraft.type;
    const model = aircraft.model;
    const operator = aircraft.operator;
    const remarks = aircraft.remarks;

    const sql = "INSERT INTO aircraft(icao24,regid,type,model,operator,remarks) VALUES (?,?,?,?,?,?)"

    db.run(sql,[icao24,reg,type,model,operator,remarks], function(err) {

    })

}


module.exports = {
    getByIcao24,
}