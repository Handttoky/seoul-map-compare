// routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// 회원가입: POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "필수 정보 누락" });
  }
  try {
    // 이메일 중복 확인
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length > 0) {
      return res.status(409).json({ message: "이미 가입된 이메일" });
    }

    // 비밀번호 해시
    const hash = await bcrypt.hash(password, 10);

    // DB Insert
    await pool.query(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, hash, name]
    );

    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 로그인: POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password){
    return res.status(400).json({ message: "이메일/비밀번호를 입력하세요" });
  }
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "이메일 또는 비밀번호 틀림" });
    }
    const user = rows[0];

    // 비밀번호 검증
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "이메일 또는 비밀번호 틀림" });
    }

    // 로그인 성공 → 세션
    req.session.userId = user.id;
    res.json({ message: "로그인 성공", userId: user.id, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if(err) console.error(err);
    res.clearCookie('connect.sid');
    res.json({ message: "로그아웃 완료" });
  });
});

module.exports = router;
