// server.js
require('dotenv').config(); // 최상단에 추가하여 환경 변수를 로드합니다.
const express = require('express');
const path = require('path');
const session = require('express-session');

const authRouter = require('./routes/auth');
const favoritesRouter = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 3000;

// 바디 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 설정 (보안 강화)
app.use(session({
  // .env 파일의 SESSION_SECRET을 사용하거나 없으면 기본값을 사용합니다.
  secret: process.env.SESSION_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, // 자바스크립트를 통한 쿠키 탈취 방지
    secure: false,  // HTTPS를 사용하게 되면 true로 변경해야 합니다.
    maxAge: 1000 * 60 * 60 * 24 // 세션 유지 기간 (예: 24시간)
  }
}));

// 정적 파일 서빙 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 등록
app.use('/auth', authRouter);
app.use('/favorites', favoritesRouter);

// 서버 구동
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});