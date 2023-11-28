var app = require('./express')(); // express setting
const db = require('./db')(); // db setting

const bkfd2Password = require('pbkdf2-password');
const hasher = bkfd2Password();
const jwt = require('jsonwebtoken'); 



// 회원가입 엔드포인트
app.post('/signup', (req, res) => {
    const { userId, password, name, phone } = req.body;

    console.log(userId);
    // 비밀번호 해싱
    hasher({ password: password }, (err, pass, salt, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Error hashing password');
            return;
        }

        // MySQL에 사용자 정보 저장
        db.query('INSERT INTO users (userId, password, salt, name, phone) VALUES (?, ?, ?, ?, ?)'
        , [userId, hash, salt, name, phone], (error, results) => {
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
                        console.log('성공');
                        const token = jwt.sign({ userId: user.userId, password: user.password }, '!ddfrf$@df$%^F', { expiresIn: '1h' });
                        res.json({ 'token': token, 'userId': results[0].userId, 'name': results[0].name });
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
// 펫 추가 엔드포인트
app.post('/addpet', (req, res) => {
    const { userId, petName, breed, age } = req.body;
    // MySQL에 사용자의 펫정보 저장
    db.query('INSERT INTO pet (userId, petName, breed, age) VALUES (?, ?, ?, ?)'
        , [userId, petName, breed, age], (error, results) => {
            if (error) {
                console.error('Error add pet:', error);
                res.status(500).send('Error add pet');
            } else {
                console.log('Add pet successfully');
                res.status(201).send('Add pet successfully');
            }
        });

});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
