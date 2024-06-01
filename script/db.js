module.exports = function () {
    //db 셋업
    var mysql = require('mysql2');
    var db = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '0000',
        database: 'animogram',
    });
    db.connect(function (err) {
        if (err) throw err;
        console.log('DB Connected');
    });

    return db
}