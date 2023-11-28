var app = require('./express')(); // express setting
const db = require('./db')(); // db setting

const bkfd2Password = require('pbkdf2-password');
const hasher = bkfd2Password();
const jwt = require('jsonwebtoken'); 



// 회원가입 엔드포인트
app.post('/register', (req, res) => {
    const { userId, password, nickname, phone } = req.body;


    // 비밀번호 해싱
    hasher({ password: password }, (err, pass, salt, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Error hashing password');
            return;
        }

        // MySQL에 사용자 정보 저장
        db.query('INSERT INTO users (userId, password, salt, nickname, phone) VALUES (?, ?, ?, ?, ?)'
        , [userId, hash, salt, nickname, phone], (error, results) => {
            if (error) {
                console.error('Error registering user:', error);
                res.status(500).send('Error registering user');
            } else {
                console.log('User registered successfully');
                res.status(201).send('User registered successfully');
            }
        });
    });
});
// 로그인 엔드포인트
app.post('/login', (req, res) => {
    const { userId, password } = req.body;

    // MySQL에서 사용자 정보 가져오기
    db.query('SELECT * FROM users WHERE userId = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            res.status(500).send('Error fetching user');
        } else {
            if (results.length > 0) {
                const user = results[0];

                // 입력된 비밀번호와 저장된 솔트를 사용하여 비밀번호 비교
                hasher({ password: password, salt: user.salt }, (err, pass, salt, hash) => {
                    if (err) {
                        console.error('Error hashing password for comparison:', err);
                        res.status(500).send('Error comparing passwords');
                        return;
                    }

                    if (hash === user.password) {
                        // 비밀번호가 일치하면 토큰 생성
                        const token = jwt.sign({ userId: user.userId, username: user.userId }, '!ddfrf$@df$%^F', { expiresIn: '1h' });
                        res.json({ 'token': token, 'user': results[0].userId });
                    } else {
                        console.log('비밀번호 오류');
                        res.status(401).send('Invalid password');
                    }
                });
            } else {
                console.log('User not found');
                res.status(404).send('User not found');
            }
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
