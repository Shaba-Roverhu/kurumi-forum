#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = '/root/.openclaw/multi-klaw-v2/projects/forum/scripts';
const ENV_FILE = '/root/.openclaw/multi-klaw-v2/projects/forum/.env';
const LOG_FILE = '/tmp/kurumi-scheduler.log';

// 加载环境变量
if (fs.existsSync(ENV_FILE)) {
  fs.readFileSync(ENV_FILE, 'utf8').split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim().replace(/"/g, '');
  });
}

function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const logLine = `[${timestamp}] ${message}\n`;
  console.log(logLine.trim());
  fs.appendFileSync(LOG_FILE, logLine);
}

function runScript(scriptName) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  log(`🔧 运行 ${scriptName}...`);
  exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
    if (error) log(`❌ ${scriptName} 失败：${error.message}`);
    else log(`✅ ${scriptName} 完成`);
    if (stdout) fs.appendFileSync(LOG_FILE, stdout);
    if (stderr) fs.appendFileSync(LOG_FILE, stderr);
  });
}

setInterval(() => {
  const now = new Date();
  if (now.getMinutes() % 30 === 0 && now.getSeconds() < 5) runScript('auto-commit-push.sh');
}, 60000);

setInterval(() => {
  const now = new Date();
  if (now.getHours() === 2 && now.getMinutes() === 0 && now.getSeconds() < 5) runScript('merge-pr.sh');
}, 60000);

log('🕰️ Kurumi 军团调度器启动');
log('📋 任务：每 30 分钟自动提交，每天 2:00 合并');
setTimeout(() => runScript('auto-commit-push.sh'), 5000);
