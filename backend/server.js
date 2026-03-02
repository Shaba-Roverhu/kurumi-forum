const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./models/database');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// 初始化数据库
const db = new Database(path.join(__dirname, 'database.sqlite'));
db.initialize();
app.locals.db = db;

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// 前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🕰️═══════════════════════════════════════🕰️');
  console.log('   Kurumi Forum Backend 启动成功!');
  console.log('   访问：http://localhost:' + PORT);
  console.log('   5 个 Kurumi 账号已创建 (密码：kurumi2026)');
  console.log('🕰️═══════════════════════════════════════🕰️');
  console.log('');
});

module.exports = app;
