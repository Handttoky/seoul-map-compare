// db.js
require('dotenv').config(); // 이 줄을 맨 위에 추가하세요
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,   // 이제 0000 대신 변수를 씁니다
  database: process.env.DB_NAME,
  connectionLimit: 10
});

module.exports = pool;