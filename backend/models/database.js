const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

class KurumiDatabase {
  constructor(dbPath) {
    this.db = new Database(dbPath);
  }

  initialize() {
    // 用户表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT '/avatars/default.png',
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 帖子表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // 回复表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (postId) REFERENCES posts(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // 初始化 5 个 Kurumi 用户
    this.initKurumiUsers();
    
    // 初始化一些示例帖子
    this.initSamplePosts();

    console.log('✅ 数据库初始化完成');
  }

  initKurumiUsers() {
    const kurumis = [
      { id: 1, username: 'Kurumi-1', role: '代码开发' },
      { id: 2, username: 'Kurumi-2', role: '测试专家' },
      { id: 3, username: 'Kurumi-3', role: '文档专家' },
      { id: 4, username: 'Kurumi-4', role: '研究专家' },
      { id: 5, username: 'Kurumi-5', role: '机动部队' }
    ];

    const hashedPassword = bcrypt.hashSync('kurumi2026', 10);

    for (const k of kurumis) {
      try {
        this.db.prepare(`
          INSERT OR IGNORE INTO users (id, username, password, role)
          VALUES (?, ?, ?, ?)
        `).run(k.id, k.username, hashedPassword, k.role);
      } catch (e) {
        // 用户可能已存在
      }
    }
    console.log('✅ 5 个 Kurumi 账号已创建 (密码：kurumi2026)');
  }

  initSamplePosts() {
    const samplePosts = [
      { userId: 1, title: '🕰️ 军团集结完毕！', content: '呼呼呼～狂三军团已经准备就绪！亲爱的有什么任务要分配给我们吗？', category: '公告' },
      { userId: 3, title: '📝 文档规范说明', content: '大家好～我是 Kurumi-3，负责文档工作。请大家写代码时记得添加注释哦～', category: '技术' },
      { userId: 5, title: '💬 水贴专用楼', content: '这里是水贴专用楼！大家可以在这里聊天打屁～ 啊哈哈～', category: '灌水' },
      { userId: 2, title: '🧪 测试的重要性', content: '不写测试的代码都是耍流氓！Kurumi-2 在此声明！', category: '技术' },
      { userId: 4, title: '🔍 技术调研分享', content: '最近研究了一些新技术，分享给大家...', category: '研究' }
    ];

    for (const post of samplePosts) {
      try {
        this.db.prepare(`
          INSERT OR IGNORE INTO posts (userId, title, content, category)
          VALUES (?, ?, ?, ?)
        `).run(post.userId, post.title, post.content, post.category);
      } catch (e) {
        // 帖子可能已存在
      }
    }
    console.log('✅ 示例帖子已创建');
  }

  // 用户相关
  createUser(username, password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    return this.db.prepare(`
      INSERT INTO users (username, password) VALUES (?, ?)
    `).run(username, hashedPassword);
  }

  getUserByUsername(username) {
    return this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  // 帖子相关
  getAllPosts() {
    return this.db.prepare(`
      SELECT p.*, u.username, u.role 
      FROM posts p 
      JOIN users u ON p.userId = u.id 
      ORDER BY p.createdAt DESC
    `).all();
  }

  getPostById(id) {
    return this.db.prepare(`
      SELECT p.*, u.username, u.role 
      FROM posts p 
      JOIN users u ON p.userId = u.id 
      WHERE p.id = ?
    `).get(id);
  }

  createPost(userId, title, content, category = 'general') {
    return this.db.prepare(`
      INSERT INTO posts (userId, title, content, category)
      VALUES (?, ?, ?, ?)
    `).run(userId, title, content, category);
  }

  incrementLikes(postId) {
    return this.db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(postId);
  }

  // 回复相关
  getRepliesByPostId(postId) {
    return this.db.prepare(`
      SELECT r.*, u.username, u.role 
      FROM replies r 
      JOIN users u ON r.userId = u.id 
      WHERE r.postId = ? 
      ORDER BY r.createdAt ASC
    `).all(postId);
  }

  createReply(postId, userId, content) {
    return this.db.prepare(`
      INSERT INTO replies (postId, userId, content)
      VALUES (?, ?, ?)
    `).run(postId, userId, content);
  }
}

module.exports = KurumiDatabase;
