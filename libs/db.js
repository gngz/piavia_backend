	
const sqlite3 = require('sqlite3').verbose();
var db;

function connect(location, callback) {
    db = new sqlite3.Database(location, err => {
        callback(err);
    })
}

function getConn() {
    return db;
}

function close() {
    db.close();
}

module.exports = {
    connect,
    getConn,
    close
}