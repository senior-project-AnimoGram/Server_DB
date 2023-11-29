// express 세팅
module.exports = function () {
    const express = require('express');
    const app = express();
    const cors = require('cors');
    // body-parser 설정
    const bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors());
    app.use('/uploads', express.static('uploads')); // 서버내의 정적파일 클라이언트에서 접근하게 해줌
    return app;
}