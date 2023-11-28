// express 세팅
module.exports = function () {
    const express = require('express');
    const app = express();

    // body-parser 설정
    const bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    return app;
}