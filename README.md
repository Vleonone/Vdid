# VDID 功能更新包
## 多钱包管理 + 文档页面

**更新时间**: 2025-11-29

---

## 📋 包含的功能

### 1. 组合 A - 多钱包管理 ✅

| 步骤 | 文件 | 说明 |
|------|------|------|
| 1.1 | `shared/schema.ts` | 数据库 Schema，包含 `web3_identities` 表 |
| 1.2 | `server/services/multi-wallet.service.ts` | 多钱包管理服务 |
| 1.3 | `server/routes/multi-wallet.routes.ts` | API 路由 |
| 1.4 | `server/index.ts` | 主服务器（已注册路由） |
| 1.5 | `client/src/pages/dashboard/security.tsx` | Security 页面 UI |
| - | `client/src/components/layout/dashboard-layout.tsx` | Dashboard 布局组件 |

### 2. 文档页面 ✅

| 文件 | 说明 |
|------|------|
| `client/src/pages/docs.tsx` | 完整 14 章节技术文档页面 |

**文档章节**:
1. Overview - VDID 概述
2. Architecture - 四层架构
3. Quick Start - 快速上手
4. DID Specification - DID 规范
5. Verifiable Credentials - 可验证凭证
6. V-Score System - V-Score 系统
7. Authentication - 认证方式
8. Privacy & ZKP - 隐私与零知识证明
9. API Reference - API 参考
10. SDK & Libraries - SDK 与库
11. Smart Contracts - 智能合约
12. Security - 安全
13. Velon Ecosystem - Velon 生态系统
14. FAQ - 常见问题

## 🔧 功能特性

### 后端 API
- `GET /api/wallets` - 获取用户所有钱包
- `POST /api/wallets` - 添加新钱包（需签名验证）
- `PATCH /api/wallets/:id` - 更新钱包标签
- `DELETE /api/wallets/:id` - 删除钱包
- `POST /api/wallets/:id/primary` - 设置主钱包
- `GET /api/wallets/chains` - 获取支持的链列表

### 支持的链
- BASE (8453) - 主链
- Ethereum (1)
- Polygon (137)
- Arbitrum (42161)
- Optimism (10)

### 前端 UI 功能
- 钱包列表展示（带链标识、标签、ENS）
- 添加钱包对话框（选择链、设置标签）
- 编辑钱包标签
- 设置主钱包
- 删除钱包（保护最后一个钱包）
- 地址复制功能
- 认证方式管理
- 会话管理

## 📁 文件结构

```
vdid-update-package/
├── shared/
│   └── schema.ts                    # 数据库表定义
├── server/
│   ├── index.ts                     # 服务器入口
│   ├── services/
│   │   └── multi-wallet.service.ts  # 多钱包服务
│   └── routes/
│       └── multi-wallet.routes.ts   # 多钱包 API
└── client/
    └── src/
        ├── pages/
        │   ├── docs.tsx             # 📚 文档页面 (14章节)
        │   └── dashboard/
        │       └── security.tsx     # 🔐 Security 页面
        └── components/
            └── layout/
                └── dashboard-layout.tsx
```

## 🚀 部署说明

### 步骤 1: 合并文件到项目

将以下文件复制到你的 VDID 项目对应位置：

```bash
# 后端文件
cp shared/schema.ts                        your-project/shared/
cp server/index.ts                         your-project/server/
cp server/services/multi-wallet.service.ts your-project/server/services/
cp server/routes/multi-wallet.routes.ts    your-project/server/routes/

# 前端文件
cp client/src/pages/docs.tsx                            your-project/client/src/pages/
cp client/src/pages/dashboard/security.tsx              your-project/client/src/pages/dashboard/
cp client/src/components/layout/dashboard-layout.tsx    your-project/client/src/components/layout/
```

### 步骤 2: 确保路由已配置

在 `App.tsx` 中确保有以下路由：

```tsx
import DocsPage from "@/pages/docs";
import SecurityPage from "@/pages/dashboard/security";

// 在 Router 中添加
<Route path="/docs" component={DocsPage} />
<Route path="/dashboard/security" component={SecurityPage} />
```

### 步骤 3: 运行数据库迁移

```bash
npx drizzle-kit push:pg
```

### 步骤 4: 重新构建部署

```bash
npm run build
# 或在 Railway 上触发新部署
git add .
git commit -m "Add multi-wallet management and docs page"
git push
```

## ⚠️ 注意事项

- 确保项目中已有以下依赖：
  - `ethers` (签名验证)
  - `drizzle-orm` (数据库)
  - `zod` (验证)
  - `lucide-react` (图标)
  - `@radix-ui` 相关组件

- Security 页面依赖以下 UI 组件：
  - Button, Input, Card, Badge, Switch
  - Dialog, DropdownMenu, AlertDialog
  - useToast hook
