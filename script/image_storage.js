// 클라이언트에서 넘어온 사진을 저장하는 코드
module.exports = function () {
    const multer = require('multer');
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/'); // uploads 폴더에 이미지 저장
        },
        filename: function (req, file, cb) {
            cb(null, getNowTime() + '_' + file.originalname); // 이미지 파일 이름 설정
        },
    });
    function getNowTime() {
        let today = new Date();
        let year = today.getFullYear(); // 년도
        let month = today.getMonth() + 1;  // 월
        let date = today.getDate();  // 날짜
        let hours = today.getHours(); // 시
        let minutes = today.getMinutes();  // 분
        let seconds = today.getSeconds();  // 초
        return year + "_" + month + "_" + date + "_" + hours + "_" + minutes + "_" + seconds;
    }
    
    // multer 미들웨어 설정
    const upload = multer({ storage: storage });
    return upload;
}