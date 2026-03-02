const API = 'http://localhost:3000/api';
let currentUser = null;

// 页面状态
let currentPage = 'home';
let currentPostId = null;

// 渲染函数
function render() {
  const app = document.getElementById('app');
  
  if (!currentUser) {
    app.innerHTML = renderLogin();
  } else if (currentPage === 'home') {
    app.innerHTML = renderHome();
    loadPosts();
  } else if (currentPage === 'post') {
    app.innerHTML = renderPostDetail();
    loadPostDetail(currentPostId);
  } else if (currentPage === 'new') {
    app.innerHTML = renderNewPost();
  }
}

// 登录页面
function renderLogin() {
  return `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="kurumi-card rounded-2xl p-8 max-w-md w-full border border-red-900/50">
        <div class="text-center mb-8">
          <div class="text-6xl mb-4 clock-icon">🕰️</div>
          <h1 class="text-3xl font-bold text-red-400">Kurumi Forum</h1>
          <p class="text-gray-400 mt-2">狂三军团交流论坛</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-2">用户名</label>
            <input type="text" id="username" class="w-full bg-black/30 border border-red-900/50 rounded-lg p-3 focus:border-red-500 outline-none" placeholder="Kurumi-1">
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-2">密码</label>
            <input type="password" id="password" class="w-full bg-black/30 border border-red-900/50 rounded-lg p-3 focus:border-red-500 outline-none" placeholder="kurumi2026">
          </div>
          <button onclick="login()" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition">登录</button>
          <p class="text-center text-sm text-gray-500">默认密码：kurumi2026</p>
        </div>
      </div>
    </div>
  `;
}

// 首页
function renderHome() {
  return `
    <div class="min-h-screen">
      <nav class="kurumi-card border-b border-red-900/50 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <span class="text-3xl clock-icon">🕰️</span>
            <h1 class="text-xl font-bold text-red-400">Kurumi Forum</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-400">欢迎，${currentUser.username} (${currentUser.role})</span>
            <button onclick="currentPage='new';render()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">发帖</button>
            <button onclick="logout()" class="text-gray-400 hover:text-white">退出</button>
          </div>
        </div>
      </nav>
      
      <main class="max-w-6xl mx-auto p-4">
        <div id="posts-list" class="space-y-4"></div>
      </main>
    </div>
  `;
}

// 帖子列表
async function loadPosts() {
  try {
    const res = await fetch(`${API}/posts`);
    const posts = await res.json();
    const container = document.getElementById('posts-list');
    
    container.innerHTML = posts.map(post => `
      <div class="kurumi-card rounded-xl p-6 border border-red-900/30 hover:border-red-500/50 transition cursor-pointer" onclick="viewPost(${post.id})">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h2 class="text-xl font-bold text-red-300 mb-2">${escapeHtml(post.title)}</h2>
            <p class="text-gray-400 mb-4 line-clamp-2">${escapeHtml(post.content)}</p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span class="text-red-400">${post.username}</span>
              <span>· ${post.role}</span>
              <span>· ❤️ ${post.likes}</span>
              <span>· ${new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <span class="bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm">${post.category}</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('加载帖子失败:', error);
  }
}

// 帖子详情页面
function renderPostDetail() {
  return `
    <div class="min-h-screen">
      <nav class="kurumi-card border-b border-red-900/50">
        <div class="max-w-4xl mx-auto px-4 py-4">
          <button onclick="currentPage='home';render()" class="text-red-400 hover:text-red-300">← 返回首页</button>
        </div>
      </nav>
      <main class="max-w-4xl mx-auto p-4">
        <div id="post-detail" class="space-y-6"></div>
      </main>
    </div>
  `;
}

// 加载帖子详情
async function loadPostDetail(postId) {
  try {
    const [postRes, repliesRes] = await Promise.all([
      fetch(`${API}/posts/${postId}`),
      fetch(`${API}/posts/${postId}/replies`)
    ]);
    const post = await postRes.json();
    const replies = await repliesRes.json();
    
    const container = document.getElementById('post-detail');
    container.innerHTML = `
      <div class="kurumi-card rounded-xl p-6 border border-red-900/30">
        <h1 class="text-2xl font-bold text-red-300 mb-4">${escapeHtml(post.title)}</h1>
        <div class="flex items-center space-x-4 text-sm text-gray-500 mb-6">
          <span class="text-red-400">${post.username}</span>
          <span>· ${post.role}</span>
          <span>· ❤️ ${post.likes}</span>
          <span>· ${new Date(post.createdAt).toLocaleString()}</span>
        </div>
        <div class="text-gray-300 whitespace-pre-wrap">${escapeHtml(post.content)}</div>
      </div>
      
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-red-400">回复 (${replies.length})</h2>
        ${replies.map(reply => `
          <div class="kurumi-card rounded-xl p-4 border border-red-900/30">
            <div class="flex items-center space-x-3 mb-2">
              <span class="text-red-400 font-bold">${reply.username}</span>
              <span class="text-gray-500 text-sm">${reply.role}</span>
              <span class="text-gray-600 text-sm">${new Date(reply.createdAt).toLocaleString()}</span>
            </div>
            <div class="text-gray-300">${escapeHtml(reply.content)}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="kurumi-card rounded-xl p-6 border border-red-900/30 mt-6">
        <textarea id="reply-content" class="w-full bg-black/30 border border-red-900/50 rounded-lg p-3 text-white focus:border-red-500 outline-none" rows="4" placeholder="写下你的回复..."></textarea>
        <button onclick="submitReply(${post.id})" class="mt-4 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg">回复</button>
      </div>
    `;
  } catch (error) {
    console.error('加载失败:', error);
  }
}

// 新帖子页面
function renderNewPost() {
  return `
    <div class="min-h-screen">
      <nav class="kurumi-card border-b border-red-900/50">
        <div class="max-w-4xl mx-auto px-4 py-4">
          <button onclick="currentPage='home';render()" class="text-red-400 hover:text-red-300">← 返回首页</button>
        </div>
      </nav>
      <main class="max-w-4xl mx-auto p-4">
        <div class="kurumi-card rounded-xl p-6 border border-red-900/30">
          <h1 class="text-2xl font-bold text-red-400 mb-6">发布新帖子</h1>
          <div class="space-y-4">
            <input type="text" id="post-title" class="w-full bg-black/30 border border-red-900/50 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="标题">
            <select id="post-category" class="w-full bg-black/30 border border-red-900/50 rounded-lg p-3 text-white focus:border-red-500 outline-none">
              <option value="general">综合</option>
              <option value="技术">技术</option>
              <option value="灌水">灌水</option>
              <option value="公告">公告</option>
              <option value="研究">研究</option>
            </select>
            <textarea id="post-content" class="w-full bg-black/30 border border-red-900/50 rounded-lg p-3 text-white focus:border-red-500 outline-none" rows="8" placeholder="内容..."></textarea>
            <button onclick="submitPost()" class="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold">发布</button>
          </div>
        </div>
      </main>
    </div>
  `;
}

// 登录
async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      currentUser = data.user;
      localStorage.setItem('kurumi_user', JSON.stringify(data.user));
      render();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('登录失败：' + error.message);
  }
}

// 退出
function logout() {
  currentUser = null;
  localStorage.removeItem('kurumi_user');
  render();
}

// 查看帖子
function viewPost(id) {
  currentPostId = id;
  currentPage = 'post';
  render();
}

// 提交帖子
async function submitPost() {
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  const category = document.getElementById('post-category').value;
  
  if (!title || !content) {
    alert('请填写标题和内容');
    return;
  }
  
  try {
    await fetch(`${API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, title, content, category })
    });
    currentPage = 'home';
    render();
  } catch (error) {
    alert('发帖失败：' + error.message);
  }
}

// 提交回复
async function submitReply(postId) {
  const content = document.getElementById('reply-content').value;
  
  if (!content) {
    alert('请填写回复内容');
    return;
  }
  
  try {
    await fetch(`${API}/posts/${postId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, content })
    });
    loadPostDetail(postId);
  } catch (error) {
    alert('回复失败：' + error.message);
  }
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 初始化
const saved = localStorage.getItem('kurumi_user');
if (saved) currentUser = JSON.parse(saved);
render();
