var app = require('./express')(); // express setting
const db = require('./db')(); // db setting
const upload = require('./image_storage')(); // image_storage setting
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
        db.query('INSERT INTO user (user_id, password, salt, nickname, phone) VALUES (?, ?, ?, ?, ?)'
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
    db.query('SELECT * FROM user WHERE user_id = ?', [userId], (error, results) => {
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
                        const token = jwt.sign({ user_id: user.user_id, password: user.password }, '!ddfrf$@df$%^F', { expiresIn: '1h' });
                        res.json({ 'token': token, 'userId': results[0].user_id, 'nickname': results[0].nickname });
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
    db.query('INSERT INTO pet (user_id, name, breed, age, image) VALUES (?, ?, ?, ?, null)'
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
    db.query('SELECT user_id, name, phone from user where user_id = ?', [userId],
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
    db.query('SELECT petName, breed, age from pet where user_id = ?', [userId],
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
    var filename, path;
    if (req.body.flag == 0) {
        filename = req.file.filename;
        path = req.file.path;
    } else {
        path = req.body.filepath;
        filename = path.substr(7);
    }
    // 업로드된 이미지의 정보는 req.file에서 확인 가능
    const { title, content, userId } = req.body;
    var address = req.body.address;

    address = address.indexOf(',') !== -1 ? address.substring(0, address.indexOf(',')) : address;

    db.query("INSERT INTO post (user_id, title, content, imageName, imagePath, address) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, title, content, filename, path, address], (error, results) => {
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
        res.json(results);
    });
});

// getAddress 엔드포인트
app.get('/getAddress', (req, res) => {
    db.query("SELECT address, emotion FROM post", (error, results) => {
        if (error) {
            console.error('Error fetching addresses:', error);
            res.status(500).send('Error fetching addresses');
        } else {
            res.json(results);
        }
    });
});


// app.post('/predictimage', upload.single('image'), (req, res) => {
//     const imagePath = req.file.path;

//     try {
//         // Python 스크립트 실행
//         let result = execSync(`python ../image_predict.py ${imagePath}`).toString().split('\r\n'); // 원하는 결과를 얻기 위해 문자열 파싱
//         console.log(result);
//         let breedResult = result[15];
//         let emotionResult = result[19];
//         let response = {
//             breed: breedResult,
//             emotion: emotionResult
//         };

//         // 이미지 삭제
//         fs.unlinkSync(imagePath);
//         console.log('File was deleted synchronously');

//         // 응답 전송
//         res.send(response);
//     } catch (error) {
//         console.error('에러:', error.toString());
//         res.status(500).send(`Error: ${error.toString()}`);
//     }
// });

app.post('/putsticker', upload.single('image'), (req, res) => {
    const imagePath = req.file.path;
    const filterIndex = req.body.selectedFilterIndex;
    try {
        // Python 스크립트 실행
        let deco_image_path = execSync(`python ./detectHead.py ${imagePath} ${filterIndex}`)
        console.log(`결과 ${deco_image_path}`);

        // 이미지 삭제
        fs.unlinkSync(imagePath);
        console.log('File was deleted synchronously');

        // 응답 전송
        res.send(deco_image_path);
    } catch (error) {
        console.error('에러:', error.toString());
        res.status(500).send(`Error: ${error.toString()}`);
    }
})

// app.post('/frame',upload.single('image'), (req, res) => {
//     console.log(req.file);
//     res.send("Bye");
// })

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
