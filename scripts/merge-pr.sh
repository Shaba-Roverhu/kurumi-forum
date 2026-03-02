#!/bin/bash
# 🕰️ Kurumi 军团 PR 合并脚本

set -e

MAIN_REPO="/root/.openclaw/multi-klaw-v2/projects/forum"
REPO_URL="${KURUMI_REPO_URL:-https://github.com/Shaba-Roverhu/kurumi-forum.git}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "═══════════════════════════════════════"
log "🕰️ 开始合并各 Kurumi 分支"
log "═══════════════════════════════════════"

cd "$MAIN_REPO"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

git checkout main 2>/dev/null || git checkout master
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true

BRANCHES=("feature/backend-optimization" "feature/test-framework" "feature/docs-improvement" "feature/perf-research" "feature/mobile-ui")
NAMES=("Kurumi-1 后端" "Kurumi-2 测试" "Kurumi-3 文档" "Kurumi-4 调研" "Kurumi-5 前端")

for i in "${!BRANCHES[@]}"; do
  branch="${BRANCHES[$i]}"
  name="${NAMES[$i]}"
  log "合并 $name ($branch)..."
  git merge --no-ff "$branch" -m "🔀 合并 $name" || log "  ⚠️ 合并冲突"
done

git push origin main && log "✅ 推送到 GitHub" || log "⚠️ 推送失败"

curl -s http://localhost:3001/api/posts -X POST -H "Content-Type: application/json" -d '{"userId":1,"title":"🎉 版本更新！","content":"各 Kurumi 的工作已合并到 main 分支","category":"公告"}' > /dev/null 2>&1 || true

log "═══════════════════════════════════════"
log "🕰️ 合并完成"
log "═══════════════════════════════════════"
