const express = require('express');
const app = express();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

// body - parser 설정
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

var passport = require('passport'); // passport 모듈
var LocalStrategy = require('passport-local'); // 로컬 인증

// db 셋업
var mysql = require('mysql2');
var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'rlawogml1!',
    database: 'o2',
});
db.connect(function (err) {
    if (err) throw err;
    console.log('DB Connected');
});

var options = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'rlawogml1!',
    database: 'o2'
};

var sessionStore = new MySQLStore(options);

app.use(session({
    secret: 'fjkejfi3j$$%$Ffe',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

// passport 초기화
app.use(passport.initialize());
// app.use(passport.session());
/// passport 인증
// 최초 로그인시에만
// passport.serializeUser(function (user, done) { // user - 아래 passport.use done()에서 넘어온 user
//     done(null, user.authId); // 입력받은 user의 authId를 session에 저장
//     console.log('여기1');
// });

// // 한번 로그인 된 다음부터
// passport.deserializeUser(function (id, done) { // id - serializer에서 저장한 session 데이터
//     var sql = 'SELECT * from users WHERE authID=?';
//     connection.query(sql, [id], function (err, results) {
//         if (err) {
//             console.log(err);
//             done('There is no user');
//         } else {
//             done(null, results[0]);
//         }
//     })
//     console.log('여기2');
// });
// passport의 local strategy 객체를 통해 입력받은 정보와 같은 유저가 있는지 확인
passport.use(new LocalStrategy(
    function (ID, password, done) {
        var id = ID;
        var pwd = password;
        var sql = 'SELECT * FROM users WHERE authID=?';
        console.log(ID);
        db.query(sql, ['local:' + id], function (err, results) {
            if (results.length == 0) {
                return done('There is no user');
            }
            return hasher({ password: pwd, salt: results[0].salt }, function (err, pass, salt, hash) {
                if (hash === results[0].password) {
                    done(null, results[0]);
                } else {
                    done('Password Error');
                }
            })
        });
    }
));




// 라우트 및 엔드포인트 정의
app.get('/data', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});

app.post('/login', passport.authenticate('local'), (req, res) => {
    console.log('HI');
    res.json(req.user);
});

app.post('/register', (req, res) => {
    const { name, ID, password, phoneNum } = req.body;

    hasher({ password: password }, function (err, pass, salt, hash) { // 비밀번호 암호화
        var user = {
            authId: 'local:' + ID,
            password: hash,
            salt: salt,
            name: name,
            phoneNum: phoneNum
        };
        const query = 'INSERT INTO users SET ?';
        db.query(query, user, (err, result) => {
            if (err) {
                console.error('MySQL query error:', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            console.log('User registered:', result);
        });
    })
    res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
