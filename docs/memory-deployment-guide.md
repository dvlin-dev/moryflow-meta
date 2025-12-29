# AI Memory 数据库部署指南

---

## 1. 本地开发（Docker Compose）

```bash
cd memory/docker
cp .env.example .env
# 编辑 .env 配置你的 API Keys

docker-compose up -d memory-db
```

数据库启动后执行迁移：

```bash
cd memory/packages/server
pnpm db:migrate
```

---

## 2. Dokploy 部署

### Step 1: 创建 PostgreSQL 服务

1. Dokploy 控制台 → 创建项目
2. 添加服务 → **Postgres**
3. 镜像：`pgvector/pgvector:pg17`
4. 配置环境变量：

| 变量 | 值 |
|------|-----|
| `POSTGRES_DB` | `memory` |
| `POSTGRES_USER` | `memory` |
| `POSTGRES_PASSWORD` | `<生成强密码>` |

5. 挂载卷：`/var/lib/postgresql/data`

### Step 2: 执行迁移

方式 A - 本地执行（推荐）：

```bash
# 配置 DATABASE_URL 指向 Dokploy 数据库
export DATABASE_URL="postgresql://memory:<密码>@<地址>:5432/memory"

cd memory/packages/server
pnpm db:deploy
```

方式 B - 在 API Server 容器中执行：

```bash
docker exec -it <api-container> npx prisma migrate deploy
```

---

## 3. 迁移命令说明

| 命令 | 用途 |
|------|------|
| `pnpm db:migrate` | 开发环境，交互式创建/执行迁移 |
| `pnpm db:deploy` | 生产环境，执行已有迁移 |
| `pnpm db:push` | 快速同步 schema（不生成迁移文件） |
| `pnpm db:generate` | 生成 Prisma Client |

---

## 4. 验证

```bash
curl http://<API地址>/health
```

```json
{"status":"ok","database":"connected"}
```

---

## Checklist

- [ ] 创建 PostgreSQL（镜像：`pgvector/pgvector:pg17`）
- [ ] 执行 `pnpm db:deploy`（生产）或 `pnpm db:migrate`（开发）
- [ ] 验证健康检查

---

> 更新日期: 2025-12-30
