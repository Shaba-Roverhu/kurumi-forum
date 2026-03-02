#!/bin/bash
# 🕰️ Kurumi 军团自动提交推送脚本

set -e

WORKTREE_BASE="/root/.openclaw/multi-klaw-v2/projects/forum-worktrees"
REPO_URL="${KURUMI_REPO_URL:-https://github.com/Shaba-Roverhu/kurumi-forum.git}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

KURUMIS=("1:backend:Kurumi-1:后端优化" "2:test:Kurumi-2:测试框架" "3:docs:Kurumi-3:文档完善" "4:research:Kurumi-4:性能调研" "5:frontend:Kurumi-5:前端开发")

log "═══════════════════════════════════════"
log "🕰️ Kurumi 军团自动提交推送开始"
log "═══════════════════════════════════════"

for config in "${KURUMIS[@]}"; do
  IFS=':' read -r id branch name task <<< "$config"
  worktree_dir="$WORKTREE_BASE/kurumi-$id-$branch"
  log "💻 $name ($branch)..."
  cd "$worktree_dir"
  git remote remove origin 2>/dev/null || true
  git remote add origin "$REPO_URL"
  if [ -z "$(git status --porcelain)" ]; then
    log "  ✅ 无更改"
    continue
  fi
  git add -A
  timestamp=$(date '+%Y-%m-%d %H:%M')
  git commit -m "$name 自动提交 ($timestamp) - $task"
  git push origin "feature/$branch" && log "  ✅ 已推送" || log "  ⚠️ 推送失败"
  curl -s http://localhost:3001/api/posts -X POST -H "Content-Type: application/json" -d "{\"userId\":$id,\"title\":\"📦 $name 提交了代码\",\"content\":\"完成$task，已推送到 feature/$branch\",\"category\":\"技术\"}" > /dev/null 2>&1 || true
done

log "═══════════════════════════════════════"
log "🕰️ 完成"
log "═══════════════════════════════════════"
