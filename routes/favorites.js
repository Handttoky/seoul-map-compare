// routes/favorites.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// 즐겨찾기 목록: GET /favorites
router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  try {
    const [rows] = await pool.query(
      "SELECT id, title, lat, lng FROM favorites WHERE user_id=?",
      [req.session.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 즐겨찾기 추가: POST /favorites
router.post('/', async (req, res) => {
  if(!req.session.userId){
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  const { title, lat, lng } = req.body;
  if(!title || lat == null || lng == null) {
    return res.status(400).json({ message: "title, lat, lng 필수" });
  }
  try {
    await pool.query(
      "INSERT INTO favorites (user_id, title, lat, lng) VALUES (?, ?, ?, ?)",
      [req.session.userId, title, lat, lng]
    );
    res.json({ message: "즐겨찾기 추가 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 즐겨찾기 삭제: DELETE /favorites/:id
router.delete('/:id', async (req, res) => {
  if(!req.session.userId){
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  const favId = req.params.id;
  try {
    const [result] = await pool.query(
      "DELETE FROM favorites WHERE id=? AND user_id=?",
      [favId, req.session.userId]
    );
    if(result.affectedRows === 0) {
      return res.status(404).json({ message: "삭제할 즐겨찾기가 없거나 권한 없음" });
    }
    res.json({ message: "즐겨찾기 삭제 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
