# Firmware 嵌入式开发社网站

基于 **Next.js 16 + Supabase** 的Firmware 嵌入式开发社站点，包含论坛、社团日志、成员介绍三大模块。

## 功能

- 💬 **论坛**：按 STM32/Arduino/ESP32/嵌入式Linux/RTOS/工具链/杂谈 标签分类发帖，支持 Markdown + 代码高亮，回复嵌套一层，Supabase Realtime 实时推送
- 📝 **日志**：管理员发布 Markdown 文章，支持封面图、Slug URL
- 👥 **成员介绍**：管理员维护成员卡片，含头像、年级、专业、方向标签、GitHub 链接
- 🔐 **认证**：邮箱密码 + GitHub OAuth

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 创建 Supabase 项目

1. 在 [supabase.com](https://supabase.com) 新建项目
2. 复制 `.env.local.example` 为 `.env.local`，填入项目 URL 和 anon key
3. 在 Supabase SQL Editor 依次执行：
   - `supabase/migrations/0001_init.sql`（建表 + RLS + 触发器 + 存储桶策略）
   - `supabase/seed.sql`（示例日志和成员，需先注册至少一个用户）
4. 在 Supabase 控制台启用认证 provider：
   - Authentication → Providers → **Email**（默认开启）
   - Authentication → Providers → **GitHub**（需要先在 GitHub OAuth App 创建应用）
5. 在 Database → Replication 确认 `posts`、`replies`、`likes` 已加入 `supabase_realtime` publication（SQL 中已自动加入）

### 3. 提升首个用户为管理员

注册账号后，在 Supabase SQL Editor 执行：

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users order by created_at asc limit 1);
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入仓库，填入环境变量（同 `.env.local`）
3. 部署完成后，在 Supabase 控制台 + GitHub OAuth App 把回调 URL 改为 Vercel 域名

## 项目结构

```
app/
  (auth)/         登录/注册页
  (main)/         主布局下的页面
    forum/        论坛模块
    blog/         日志模块（含 manage 子路由）
    members/      成员模块（含 manage 子路由）
    admin/        管理后台首页
  auth/callback/  OAuth 回调
components/
  ui/             shadcn 风格基础组件
  forum/          论坛专用组件
  blog/           日志编辑器
  members/        成员编辑器
  navbar.tsx
  user-menu.tsx
  markdown.tsx
  md-editor.tsx
lib/
  supabase/       客户端/服务端/中间件封装
  tags.ts         预置标签常量
  types.ts        Database 类型
  utils.ts        cn()
  dayjs.ts        dayjs 中文配置
  storage.ts      文件上传工具
  auth.ts         requireAdmin 服务端守卫
supabase/
  migrations/0001_init.sql
  seed.sql
middleware.ts      刷新 Supabase session
```

## v1 不包含

- @ 提及、私信、通知系统
- 文章评论
- 全文搜索
- 全站深色模式
- SSO/邀请码

## License

MIT
