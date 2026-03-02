const express = require('express');
const router = express.Router();

// 获取用户列表
router.get('/', (req, res) => {
  try {
    const users = req.app.locals.db.db.prepare('SELECT id, username, role, avatar FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
