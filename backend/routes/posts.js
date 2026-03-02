const express = require('express');
const router = express.Router();

// 获取所有帖子
router.get('/', (req, res) => {
  try {
    const posts = req.app.locals.db.getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个帖子
router.get('/:id', (req, res) => {
  try {
    const post = req.app.locals.db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建帖子
router.post('/', (req, res) => {
  try {
    const { userId, title, content, category } = req.body;
    
    if (!userId || !title || !content) {
      return res.status(400).json({ error: '必填字段不能为空' });
    }

    const result = req.app.locals.db.createPost(userId, title, content, category);
    res.json({ message: '发帖成功！', id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 点赞
router.post('/:id/like', (req, res) => {
  try {
    req.app.locals.db.incrementLikes(req.params.id);
    res.json({ message: '点赞成功！' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取回复
router.get('/:id/replies', (req, res) => {
  try {
    const replies = req.app.locals.db.getRepliesByPostId(req.params.id);
    res.json(replies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建回复
router.post('/:id/reply', (req, res) => {
  try {
    const { userId, content } = req.body;
    
    if (!userId || !content) {
      return res.status(400).json({ error: '必填字段不能为空' });
    }

    const result = req.app.locals.db.createReply(req.params.id, userId, content);
    res.json({ message: '回复成功！', id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
