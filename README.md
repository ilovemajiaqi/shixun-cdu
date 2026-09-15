# 成都旅游服务平台（Chengdu Tourism Platform）

一个基于 Vue 3 + Spring Boot 的前后端分离旅游服务平台，覆盖**景点导览、路线规划、在线预订、后台管理**完整链路。
界面与内容围绕成都本地文旅场景构建（宽窄巷子、锦里、大熊猫基地、都江堰、青城山等）。

> 本项目在「黄山旅游服务平台」脚手架基础上完成**品牌与内容整体替换**：保留原有技术框架与目录结构不变，仅重构站点品牌、业务内容与图片资源。

---

## 一、技术栈

### 前端
| 分类 | 技术 | 版本 |
| :--- | :--- | :--- |
| 框架 | Vue | 3.4 |
| 语言 | TypeScript | 5.3 |
| 构建 | Vite | 4.5 |
| UI 组件 | Element Plus | 2.5 |
| 样式 | Tailwind CSS | 3.4 |
| 状态管理 | Pinia | 2.1 |
| 路由 | Vue Router | 4.2 |
| 图表 | ECharts | 6.0 |
| 地图 | Leaflet + @vue-leaflet | 1.9 / 0.10 |
| HTTP | Axios | 1.6 |

### 后端
| 分类 | 技术 | 版本 |
| :--- | :--- | :--- |
| 框架 | Spring Boot | 3.2 |
| 语言 | Java | 17 |
| 持久层 | Spring Data JPA / Hibernate | — |
| 数据库 | MySQL | 8.0 |
| 缓存 | Redis | 7 |
| 构建 | Maven | — |

### 部署
- Docker Compose 编排 4 个服务：`db` / `redis` / `backend` / `frontend`
- 前端由 Nginx 提供静态服务并反向代理 `/api`

---

## 二、项目结构

```
gsbll7/
├── backend/                      # Spring Boot 后端
│   ├── src/main/java/            # 控制器、服务、实体、仓储
│   ├── src/main/resources/
│   │   └── application.yml       # 数据源 / JPA / Redis 配置
│   └── Dockerfile
├── frontend/                     # Vue 3 前端
│   ├── src/
│   │   ├── components/           # 通用组件（Navbar 等）
│   │   ├── layouts/              # PublicLayout / MainLayout / AdminLayout
│   │   ├── views/                # 页面（用户端）
│   │   │   └── admin/            # 页面（管理端）
│   │   ├── stores/               # Pinia 状态管理（attraction / route / order / user）
│   │   ├── router/               # 路由与守卫
│   │   ├── utils/                # api.ts（Axios）、storage.ts（localStorage 读写）
│   │   └── main.ts               # 应用入口（注册 Pinia）
│   ├── public/
│   │   └── images/chengdu/       # 成都景点图片资源（27 张）
│   ├── index.html                # 站点入口（浏览器标签标题）
│   ├── vite.config.ts
│   └── Dockerfile
├── init.sql                      # 建库建表 + 种子数据
├── docker-compose.yml
└── README.md
```

---

## 三、快速启动

### 方式一：Docker Compose（推荐）

```bash
docker compose up --build
```

| 服务 | 地址 |
| :--- | :--- |
| 前端 | http://localhost:3001 |
| 后端 API | http://localhost:8083 |
| MySQL | localhost:3309 |
| Redis | localhost:6382 |

> 首次构建需下载依赖，请耐心等待。数据库表结构与种子数据由 `init.sql` 在容器初始化时自动执行。

### 方式二：本地开发

**前端**

```bash
cd frontend
npm install
npm run dev          # http://localhost:3001
```

> `vite.config.ts` 中已配置 `appType: 'spa'`，确保 SPA 路由回退正常，直接访问 `/attractions` 等路径不会 404。
> `/api` 请求默认代理到 `http://127.0.0.1:8080`，可用环境变量 `VITE_API_TARGET` 覆盖。

**后端**

```bash
cd backend
# 需先启动 MySQL 8 与 Redis 7，并导入 init.sql
mvn spring-boot:run
```

---

## 四、测试账号

| 角色 | 用户名 | 密码 | 权限 |
| :--- | :--- | :--- | :--- |
| 管理员 | `admin` | `123456` | 数据看板、景点/路线管理、订单处理、用户管理 |
| 普通用户 | `user` | `123456` | 景点浏览、路线规划、门票预订、个人中心 |

管理端入口：http://localhost:3001/admin/login

---

## 五、功能说明

### 用户端

- **景点导览**：卡片列表 + Leaflet 地图双模式；支持按 `市区经典` / `熊猫生态` / `世界遗产` / `近郊山水` 分区筛选。
- **路线规划**：推荐多条经典游玩路线，地图上联动展示点位与轨迹。
- **在线预订**：景点门票与旅游路线在线下单，模拟完整支付流程。
- **个人中心**：
  - 订单管理 —— 查看订单状态，支持支付与取消
  - 我的收藏 —— 一键收藏景点
  - 数据可视化 —— 基于 ECharts 的个人活跃度与消费统计

### 管理端

- **数据仪表盘**：ECharts 可视化大屏，展示订单量、收入趋势、热门景点分布
- **景点管理**：景点信息增删改查，支持图片与详情编辑
- **路线管理**：设计与发布旅游路线产品
- **订单处理**：审核订单、处理退款与确认
- **用户管理**：查看用户列表，管控权限与状态

---

## 六、成都景点与路线

### 景点（10 个）

| 分区 | 景点 |
| :--- | :--- |
| 市区经典 | 宽窄巷子、锦里古街、武侯祠、杜甫草堂、人民公园 |
| 熊猫生态 | 成都大熊猫繁育研究基地 |
| 世界遗产 | 都江堰、青城山 |
| 近郊山水 | 西岭雪山 |
| 川剧 | 川剧艺术中心 |

### 推荐路线（4 条）

| 路线 | 途经 |
| :--- | :--- |
| 天府经典一日游 | 宽窄巷子 → 人民公园 → 锦里古街 |
| 熊猫与古迹深度线 | 大熊猫基地 → 武侯祠 → 杜甫草堂 |
| 世界遗产双遗游 | 都江堰 → 青城山 |
| 夜色与川剧之旅 | 人民公园 → 锦里古街 → 川剧艺术中心 |

---

## 七、图片资源说明

所有景点图片存放于 `frontend/public/images/chengdu/`（27 张，约 18.8 MB），
通过 `/images/chengdu/<文件名>` 引用（Vite `public` 目录自动映射到根路径）。

- **来源**：Wikimedia Commons（维基共享资源），拍摄对象均为成都本地实景
- **许可**：CC BY-SA / CC BY / 公有领域，可商用；**需保留署名**，建议在页脚标注
  「图片来源：Wikimedia Commons（CC BY-SA）」
- **分辨率**：最长边 1600 px

---

## 八、状态管理（Pinia）

项目使用 **Pinia** 作为唯一的前端数据层。所有业务数据（景点、路线、订单、用户）都收拢在 `src/stores/` 下的 store 中，
组件只通过 store 读写，**不再直接操作 localStorage**，也不再依赖自定义事件做跨组件同步。

### Store 一览

| Store | 文件 | 职责 | 持久化键 |
| :--- | :--- | :--- | :--- |
| `useAttractionStore` | `stores/attraction.ts` | 景点列表、上下架、地图点位（含坐标）、默认数据 | `attractions_data` |
| `useRouteStore` | `stores/route.ts` | 推荐路线维护、自定义路线编辑与保存 | `routes_data`、`user_routes` |
| `useOrderStore` | `stores/order.ts` | 下单、状态流转、成交额/今日订单统计 | `all_orders` |
| `useUserStore` | `stores/user.ts` | 登录态、管理员登录态、注册用户、收藏 | `user`、`admin_token`、`admin_user`、`registered_users`、`user_favorites` |

`stores/types.ts` 集中定义 `Attraction` / `Route` / `Order` / `UserProfile` 等类型，`stores/index.ts` 作为统一出口。

### 设计要点

1. **单一数据源**：默认景点数据只保留在 `stores/attraction.ts` 的 `DEFAULT_ATTRACTIONS`。
   前台 `AttractionsView` 与后台 `AttractionManagement` 共用同一份数据，
   此前的「两处硬编码需手动同步」问题已消除。
2. **持久化收口**：`utils/storage.ts` 只负责序列化与容错（`getStorage` / `setStorage` / `removeStorage`），
   业务语义全部在 store 内，localStorage 调用仅存在于该文件与 store 层。
3. **响应式替代事件总线**：原先 `window.dispatchEvent(new Event('user-updated'))`
   与 `orders-updated` 的桥接写法已删除，组件读 store 即自动同步。
4. **跨标签页同步**：浏览器原生 `storage` 事件仍需监听（store 无法感知其他标签页的写入），
   目前仅在 `UserManagement.vue` 保留一处，用于多标签页下的用户列表刷新。

### 数据存储键

| 键名 | 用途 | 归属 store |
| :--- | :--- | :--- |
| `attractions_data` | 景点数据 | attraction |
| `routes_data` | 推荐路线 | route |
| `user_routes` | 用户自定义路线 | route |
| `all_orders` | 全部订单 | order |
| `user` | 登录用户 | user |
| `registered_users` | 注册用户列表 | user |
| `user_favorites` | 用户收藏 | user |
| `admin_token` / `admin_user` | 管理员登录态 | user |

> 后端 API 已实现，但前端默认以 store + localStorage 运行，便于无后端时独立演示。清空浏览器存储即可恢复初始数据。

---

## 九、品牌替换要点

若需在本项目基础上再次更换城市/品牌，需覆盖以下位置（易漏）：

1. `frontend/index.html` —— `<title>`、favicon、`<meta name="description">`
2. `frontend/public/favicon.svg` —— 站点图标
3. `frontend/src/components/Navbar.vue`、`layouts/*.vue` —— 站名、口号、版权
4. `frontend/src/views/**` —— 页面文案
5. `frontend/src/stores/attraction.ts` / `stores/route.ts` —— 默认景点与路线数据
6. `docker-compose.yml` —— 容器名、数据库名
7. `backend/src/main/resources/application.yml` —— JDBC 连接串
8. `init.sql` —— 库名与种子数据
9. `frontend/package.json` —— `name`

---

## 十、开发约定

- 前端使用 **TypeScript**，组件统一 `<script setup lang="ts">`
- 样式优先使用 **Tailwind 原子类**，复杂组件用 Element Plus
- 路由采用**懒加载**：`component: () => import('...')`
- 状态统一走 **Pinia store**，禁止在组件内直接调用 `localStorage`
- 管理端路由由 `router.beforeEach` 校验 `admin_token`，用户端校验登录态（均通过 `useUserStore`）

---

## License

本项目仅用于教学实训，图片资源遵循各自原始许可。
