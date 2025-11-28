# VDID - Velon Decentralized Identity

## Railway 部署步骤

### 1. 设置环境变量
在 Railway Variables 中添加：
- `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- `NODE_ENV` = `production`
- `PORT` = `5000`
- `JWT_SECRET` = `your_secret_key_at_least_32_chars`

### 2. 部署
Railway 会自动检测并部署

## 本地开发

```bash
npm install
npm run dev
```

## API 接口

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取用户
- `GET /api/vscore` - 获取V-Score
