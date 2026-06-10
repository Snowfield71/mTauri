# mTauri 即时通讯应用

一款基于 Tauri 框架开发的跨平台即时通讯桌面应用，支持 Windows、macOS 和 Linux 操作系统。

## 项目结构

```
mTauri/
├── Server/                 # NestJS 后端服务
│   ├── src/               # 源码目录
│   ├── test/              # 测试目录
│   └── uploads/           # 上传文件存储
├── Web/                   # Tauri + Vue 3 前端
│   ├── src/               # Vue 源码
│   ├── src-tauri/         # Tauri 配置
│   └── public/            # 静态资源
└── README.md              # 项目说明文档
```

## 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **类型系统**: TypeScript
- **UI 组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **桌面框架**: Tauri 2.x
- **构建工具**: Vite

### 后端
- **框架**: NestJS
- **数据库**: MySQL
- **认证**: JWT
- **实时通信**: Socket.IO

## 功能特性

### 用户认证
- [x] 账号密码登录
- [x] 手机号注册
- [x] 忘记密码（短信验证）
- [x] Token 自动登录
- [x] 多账户管理

### 好友管理
- [x] 好友列表展示
- [x] 添加好友（账号搜索）
- [x] 好友请求验证
- [x] 好友删除

### 即时通讯
- [x] 实时消息收发
- [x] 消息列表展示
- [x] 会话管理
- [x] WebSocket 连接维护

## 快速开始

### 环境要求

- Node.js >= 20.x
- Rust >= 1.70
- pnpm >= 8.x

### 后端启动

```bash
# 进入后端目录
cd Server

# 安装依赖
pnpm install

# 启动开发服务器
pnpm start:dev
```

后端服务将运行在 `http://localhost:3000`

### 前端启动

```bash
# 进入前端目录
cd Web

# 安装依赖
pnpm install

# 启动开发模式
pnpm tauri dev
```

### 构建生产版本

```bash
cd Web
pnpm tauri build
```

## API 接口

### 认证模块

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 登录 | POST | `/auth/login` | 用户登录 |
| 注册 | POST | `/auth/register` | 用户注册 |
| 忘记密码 | POST | `/auth/forget-pwd` | 获取验证码 |
| 重置密码 | POST | `/auth/reset-pwd` | 重置密码 |

### 好友模块

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 获取好友列表 | GET | `/friend/list` | 获取好友列表 |
| 添加好友 | POST | `/friend/add` | 发送好友请求 |
| 处理请求 | POST | `/friend/handle` | 同意/拒绝好友请求 |
| 删除好友 | DELETE | `/friend/:id` | 删除好友 |

### 消息模块

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 获取消息 | GET | `/message/list` | 获取会话消息 |
| 发送消息 | POST | `/message/send` | 发送消息 |

### 会话模块

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 获取会话列表 | GET | `/conversation/list` | 获取会话列表 |
| 创建会话 | POST | `/conversation/create` | 创建会话 |

## WebSocket 事件

| 事件名 | 描述 | 数据格式 |
|--------|------|----------|
| `login` | 用户登录 | `{ userId: number }` |
| `message` | 接收消息 | `Message` |
| `conversationListUpdate` | 会话列表更新 | `void` |

## 项目配置

### 后端配置

后端服务使用 SQLite 数据库，数据文件存储在 `Server/data/` 目录。

### 前端配置

前端配置文件位于 `Web/src-tauri/tauri.conf.json`，包含：
- 窗口配置
- 安全策略（CSP）
- 构建配置

## 开发指南

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 自动格式化

### 提交规范

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具配置
```

## 许可证

MIT License

## 作者

Snowfield71

---

**注意**: 本项目仅供学习和研究使用，请遵守相关法律法规。
