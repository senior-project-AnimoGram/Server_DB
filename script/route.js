
var app = require('./express')(); // express setting
const db = require('./db')(); // db setting
const upload = require('./image_storage')(); // image_starage setting
const { execSync } = require('child_process');
const fs = require("fs");

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
// 사용자 관련 정보(사용자 정보 + 펫 정보) 가져오기 엔드포인트
app.post('/getuserinfo', (req, res) => {
    const { userId } = req.body;
    console.log(userId);
    var response = {};
    // 사용자 정보(id, 이름, 전화번호) 가져오기
    db.query('SELECT userId, name, phone from users where userId = ?', [userId],
        (error, results) => {
            if (error) {
                console.error('Error fetching user:', error);
                res.status(500).send('Error fetching user');
            } else {
                if (results.length > 0) {
                    const user = results[0];
                    if (error) {
                        console.error(error);
                        res.status(500).send(error);
                        return;
                    }
                    response.userId = user.userId;
                    response.name = user.name;
                    response.phone = user.phone;
                } else {
                    console.log('User not found');
                    res.status(404).send('User not found');
                }
            }
        }
    );
    // 펫 정보 가져오기
    db.query('SELECT petName, breed, age from pet where userId = ?', [userId],
        (error, results) => {
            if (error) {
                console.error('Error fetching user:', error);
                res.status(500).send('Error fetching user');
            } else {
                if (results.length > 0) {
                    const pet = results[0];

                    if (error) {
                        console.error(error);
                        res.status(500).send(error);
                        return;
                    }
                    response.petName = pet.petName;
                    response.breed = pet.breed;
                    response.age = pet.age;

                    res.json(response);
                } else {
                    console.log('Pet not found');
                    res.status(404).send('Pet not found');
                }
            }
        }
    );
});
// 글 추가 엔드포인트
app.post('/addpost', upload.single('image'), (req, res) => {
    // 이미지 업로드 후의 로직
    console.log('Image uploaded successfully');

    // 업로드된 이미지의 정보는 req.file에서 확인 가능
    const { filename, path } = req.file;
    const { title, content, userId } = req.body;

    db.query("INSERT INTO post (userId, title, content, imageName, imagePath) VALUES (?, ?, ?, ?, ?)",
        [userId, title, content, filename, path], (error, results) => {
            if (error) {
                console.error('Error add post: ', error);
                res.status(500).send('Error add post: ', error);
            } else {
                console.log('Add post Success');
                res.status(200).send('Add post Success');
            }
        }
    )
});
// 글 가져오기 엔드포인트
app.get('/fetchposts', (req, res) => { // 글 목록을 최신순으로 불러옴
    db.query("SELECT * FROM post ORDER BY created_at DESC", (error, results) => {
        console.log(results);
        res.json(results);
    });

});

app.post('/predictimage', upload.single('image'), (req, res) => {
    const imagePath = req.file.path;

    try {
        // Python 스크립트 실행
        let result = execSync(`python ../image_predict.py ${imagePath}`).toString().split('\r\n');
        // 원하는 결과를 얻기 위해 문자열 파싱
        console.log(result);
        let breedResult = result[3] 
        let emotionResult = result[7]
        let response = {
            breed: breedResult,
            emotion: emotionResult
        };

        // 이미지 삭제
        fs.unlinkSync(imagePath);
        console.log('File was deleted synchronously');

        // 응답 전송
        res.send(response);
    } catch (error) {
        console.error('에러:', error.toString());
        res.status(500).send(`Error: ${error.toString()}`);
    }
});




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
