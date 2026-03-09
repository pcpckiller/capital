# 提交到 GitHub 与部署到 Vercel 指南

本文档一步步教你：把当前项目提交到 GitHub，然后配置 Vercel 实现自动部署。

## 一、提交到 GitHub

前置条件：本机已安装 `git`，并且你有仓库 `https://github.com/pcpckiller/capital.git` 的推送权限。

1. 初始化仓库（如已初始化可跳过）：

   ```bash
   git init
   git checkout -b main
   git remote add origin https://github.com/pcpckiller/capital.git
   ```

2. 确认忽略文件已就位：本仓库已包含标准 `.gitignore`，会忽略 `.next`、`node_modules`、`.env.local` 等文件，避免泄漏本地密钥与构建产物。

3. 添加与提交：

   ```bash
   git add .
   git commit -m "feat: auth 修复 + SessionProvider + Vercel 配置与文档"
   ````

4. 推送：

   ```bash
   git push -u origin main
   ```

   - 首次推送需要登录 GitHub，推荐使用 **Personal Access Token (classic)**（需要 `repo` 权限），作为密码输入。
   - 若远端已有历史，需要先同步：`git fetch origin && git pull --rebase origin main` 后再推送。

## 二、Vercel 部署

Next.js 项目在 Vercel 上可零配置部署。本仓库已提供 `vercel.json`，默认使用：

- 安装命令：`npm install`
- 构建命令：`next build`
- 输出目录：`.next`

### 1）创建项目

1. 打开 https://vercel.com/new
2. 选择 GitHub 账号，并导入仓库 `pcpckiller/capital`
3. 框架自动识别为 Next.js，保持默认设置即可

### 2）环境变量

在 Vercel 项目 Settings → Environment Variables 新增：

- `NEXTAUTH_URL`：部署后站点地址，如 `https://capital.vercel.app`
- `NEXTAUTH_SECRET`：随机字符串（可用 `openssl rand -base64 32` 生成）

保存后，触发重新部署。

本地开发时使用的 `.env.local` 已被 `.gitignore` 忽略，不会上传到仓库；线上环境通过 Vercel 的环境变量注入。

### 3）权限与登录

- 本系统采用 **next-auth v4 + Credentials**，支持邮箱/密码登录。
- 演示管理员账号（仅本地 mock）：
  - 邮箱：`admin@cartoon.capital`
  - 密码：`CartoonAdmin!2026`

> 注意：线上环境请替换成真实用户系统或接入数据库/外部身份提供商。

## 三、常见问题

- 推送报错 403/401：检查你对仓库是否有写入权限，或使用 PAT 作为密码。
- Vercel 构建失败：确认 Node 版本满足 Next 版本要求，并检查环境变量是否已配置。
- `useSession must be wrapped in <SessionProvider />`：本仓库已在 `app/layout.tsx` 中引入 `app/providers.tsx` 包裹全局组件；若移动布局文件，请确保 `SessionProvider` 仍在最外层。

## 四、关键文件索引

- Vercel 配置：[vercel.json](../vercel.json)
- NextAuth 服务端配置：[lib/auth.server.ts](../lib/auth.server.ts)
- 鉴权路由（v4 写法）：[app/api/auth/[...nextauth]/route.ts](../app/api/auth/[...nextauth]/route.ts)
- 全局 SessionProvider：[app/providers.tsx](../app/providers.tsx) 与 [app/layout.tsx](../app/layout.tsx)

全部准备就绪后，你只需：

```bash
git add .
git commit -m "chore: first deploy to vercel"
git push
```

Vercel 将在每次 push 到 `main` 后自动构建并部署。祝发布顺利！

