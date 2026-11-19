#!/bin/bash
# 一键同步 Supabase 配置到本地 + Vercel
# 用法：./scripts/sync-supabase.sh <PROJECT_URL> [ANON_KEY]
# 例：./scripts/sync-supabase.sh https://abc.supabase.co

set -e

PROJECT_DIR="/Users/billwang/Downloads/Kilo Project"
NEW_URL="$1"
NEW_KEY="$2"

if [ -z "$NEW_URL" ]; then
  echo "❌ 用法: $0 <PROJECT_URL> [ANON_KEY]"
  echo ""
  echo "PROJECT_URL 从这里拿：https://supabase.com/dashboard/project/_/settings/api"
  exit 1
fi

cd "$PROJECT_DIR"

echo "🔄 更新 .env.local ..."
if [ -n "$NEW_KEY" ]; then
  cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=${NEW_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEW_KEY}
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
else
  # 只换 URL，保留原 key
  KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2-)
  cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=${NEW_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${KEY}
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
fi

echo "✅ .env.local 已更新"
grep NEXT_PUBLIC_SUPABASE_URL .env.local

echo ""
echo "🔍 测试连通性 ..."
sleep 1
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${NEW_URL}/auth/v1/health" || echo "000")
if [ "$CODE" = "200" ] || [ "$CODE" = "401" ]; then
  echo "✅ Supabase 可访问 (HTTP $CODE)"
else
  echo "⚠️  Supabase 仍不可达 (HTTP $CODE) —— 检查域名是否正确 / 是否需要梯子"
fi

echo ""
echo "📌 还需要做的事："
echo "1. Vercel 环境变量也要改（下面给命令）"
echo "2. 重新部署"
