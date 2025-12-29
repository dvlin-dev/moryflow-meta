# AI Memory 数据库部署指南

单独部署 PostgreSQL + pgvector 数据库到 Dokploy，本地开发调试。

---

## 1. Dokploy 部署数据库

### Step 1: 创建 Compose 服务

1. Dokploy 控制台 → 创建项目（如 `moryflow`）
2. 添加服务 → 选择 **Compose**
3. 粘贴以下配置：

```yaml
services:
  memory-db:
    image: pgvector/pgvector:pg17
    environment:
      POSTGRES_USER: memory
      POSTGRES_PASSWORD: <生成强密码>
      POSTGRES_DB: memory
    ports:
      - "15432:5432"
    volumes:
      - memory_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  memory_data:
```

4. 部署服务

### Step 2: 配置外网访问

在 Dokploy 中配置端口或域名，让本地可以连接：
- 方式 A：直接暴露 5432 端口
- 方式 B：使用 Dokploy 的 TCP 代理功能

记录连接信息：
```
postgresql://memory:<密码>@<服务器IP或域名>:15432/memory
```

---

## 2. 本地开发配置

### Step 1: 配置环境变量

```bash
cd memory/packages/server
cp .env.example .env
```

编辑 `.env`，设置 `DATABASE_URL` 指向 Dokploy 数据库：

```env
DATABASE_URL="postgresql://memory:<密码>@<服务器地址>:15432/memory"
```

### Step 2: 执行迁移

```bash
pnpm db:deploy
```

### Step 3: 启动本地服务

```bash
pnpm dev
```

服务运行在 `http://localhost:8765`

---

## 3. 验证

```bash
# 健康检查
curl http://localhost:8765/health

# 添加记忆测试
curl -X POST http://localhost:8765/memories \
  -H "Content-Type: application/json" \
  -d '{"content": "测试记忆", "userId": "test"}'
```

---

## 迁移命令

| 命令 | 用途 |
|------|------|
| `pnpm db:deploy` | 执行已有迁移（生产/远程数据库） |
| `pnpm db:migrate` | 开发环境，交互式创建迁移 |
| `pnpm db:push` | 快速同步 schema（跳过迁移文件） |
| `pnpm db:studio` | 打开 Prisma Studio 可视化管理 |

---

> 更新日期: 2025-12-30
