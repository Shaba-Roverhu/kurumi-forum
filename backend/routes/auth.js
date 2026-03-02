const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'kurumi-secret-2026';

// 注册
router.post('/register', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const user = req.app.locals.db.getUserByUsername(username);
    if (user) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    req.app.locals.db.createUser(username, password);
    res.json({ message: '注册成功！', username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 登录
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = req.app.locals.db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: '密码错误' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: '登录成功！',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
