

class User {
    constructor(username,name,password) {
        this.id = null;
        this.username = username;
        this.name = name;
        this.password = password;
        this.type = null;
    }

    setId(id) {
        this.id = id;
    }

    setType(type) {
        this.type = type;
    }

}


function getByUsername(db,username) {

    return new Promise(function(resolve,reject) {
        const sql = 'SELECT * FROM users WHERE username = ?';


        db.get(sql, [username], (err,row) => {
            if(err)
                reject(err)
            resolve(row)
        })
    })

}


module.exports = {
    User,
    getByUsername

}

