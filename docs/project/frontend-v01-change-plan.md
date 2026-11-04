# Frontend v0.1：实现与 GitHub 修改方案

日期：2026-11-04。基线：`main` 的 `580f5f3`。用户补充的团队分工文档将本轮范围明确为 Milestone 1 前端基础版。下文保留后续 GitHub 修改路线；以本节交付状态区分已完成和待开发内容。

## 本轮交付状态

已在本地 `codex/frontend-v01` 实现：两端响应式壳、独立 SOS、typed 虚构 DTO、私密反思编辑、演示保存/失败/重试、手动信件编辑与精确预览、咨询师固定信件和任务表单预览、空收件箱状态、真实 `/health` 连接。发送始终不可用，AI 没有连接。

实际新增文件为 `apps/web/src/{Client,Therapist,Health}.tsx`、`fixtures.ts`、`styles.css`，及 `apps/web/e2e/foundation.spec.ts`、`playwright.config.ts`；复用现有 React，没有新增路由或组件框架。依赖新增本地 Inter 字体与 Playwright 开发测试工具。下方更细的 `api/`、`pages/` 和 `components/` 划分是后续业务 API 接入时的建议，本轮没有创建空目录或多余抽象。环境配置文件也未新增；当前开发代理使用仓库既有 3000 端口。

README、design、requirements、risks 已更新实际状态。API 草案及团队分工文件没有改写，因为真实业务契约尚未由团队确认。未推送或修改远程 GitHub。

## 已确认的输入

- 前端沿用 React 19、TypeScript、Vite 和现有 npm workspaces。
- 视觉依据：[Between Sessions — Frontend v0.1](https://www.figma.com/design/vX1H6Um9USBwHEKtkLILH8)。配色以 Figma 为准，覆盖仓库和早期设计文档中的不同配色建议。
- 当前 API 只有 `GET /health`；业务接口见 `api-contract-draft.md`，仍是草案。已检查远程分支和开放 PR，未发现业务 backend v1。需要用户确认所指版本。
- 仅使用虚构数据；不实现或承诺真实身份验证、临床监控或消息送达。

## 推荐实现

沿用现有应用，分离 typed API 层与页面。实际 API 模式只呈现真实结果；业务接口缺失应提示不可用。若用户确认以当前骨架为基线，提供显式的虚构演示模式完成 UI 主流程，并真实调用 `/health` 验证前后端连接。演示模式不可作为权限、持久化或发送成功的证据。

相比只做静态页面，这样可验证填写、保存失败、审阅与确认等交互；相比自行补齐 backend，这样保持团队已有的前后端分工。

## 页面和交互范围

| 页面 | 输入与行为 | 验收 |
| --- | --- | --- |
| Client 首页 | 当前任务、预约、私密提示、SOS 入口 | 390px 与桌面可用；空任务可理解 |
| 私密反思 | 逐题输入、跳过、显式保存、重试 | 保存失败保留文字；不向咨询师显示 |
| 信件草稿 | 手动编辑、保存、返回反思 | 未保存修改不会被请求结果覆盖 |
| 审阅与确认 | 精确正文、接收人、服务端发送许可 | 未确认不发送；策略未知禁用发送 |
| 已发送信件 | 固定正文和发送时间 | 后续草稿修改不改变发送副本 |
| Therapist | 概览、收件箱、只读详情、创建任务 | 不展示私密回答、进度或未经接口提供的统计 |
| SOS | Figma 中的资源占位说明 | 始终可达；不联系或通知任何人 |
| API 状态 | `/health`、重试、失败 | backend 停止时显示失败，不伪造成功 |

AI 接口尚未实现，不模拟真实模型调用。手动信件路径必须独立可用；可保留明确标记不可用的 AI 入口。

## Figma 颜色基准

Client：canvas `#FAF8F5`、surface `#FFFEFC`、text `#303247`、muted `#626479`、action `#646BA8`、soft `#EEEAF8`、warm `#E9EDF8`、border `#D9D7E4`。

Therapist：canvas `#F4F6FB`、surface `#FFFFFF`、sidebar `#EFF2FA`、text `#283249`、muted `#5C667D`、action `#56639F`、soft `#E6EAF7`、warm `#EEEAF7`、border `#D5DAE8`。

字体 Inter，保留系统回退。原始组件库仅有设计实例，仓库未安装其代码，不把 Figma 组件名称当成可用依赖。

## 文件修改清单

| 文件 | 修改目的 |
| --- | --- |
| `apps/web/src/App.tsx` | 应用入口与页面导航 |
| `apps/web/src/api/types.ts` | 草案 DTO；明确未确认字段 |
| `apps/web/src/api/client.ts` | JSON 请求、错误映射、健康检查与业务适配 |
| `apps/web/src/pages/Client.tsx` | 来访者主流程 |
| `apps/web/src/pages/Therapist.tsx` | 咨询师工作台 |
| `apps/web/src/components/` | Button、Field、状态、信件预览等实际复用组件 |
| `apps/web/src/styles.css` | 两端独立 Figma tokens、焦点与响应式布局 |
| `apps/web/src/main.tsx` | 加载样式 |
| `apps/web/src/App.test.tsx` 与相关测试 | 更新烟雾测试，验证错误、隐私和确认边界 |
| `apps/web/vite.config.ts` | 本地 API 代理，避免修改 backend 来解决开发跨域 |
| `apps/web/.env.example` | 仅公开的 API 地址和显式演示配置，无 provider key |
| `README.md` | 实际页面、启动步骤、演示与 API 模式区别 |
| `docs/design.md` | 更新已实现前端与 API 连接现状，保留 backend 事实 |
| `docs/requirements.md` | 区分 UI 实现、演示行为与真实服务端验收 |
| `docs/project/api-contract-draft.md` | 保留草案身份，补充实际消费差异与待确认项 |
| `docs/risks.md` | backend 缺失、草稿冲突、会话过期、发送结果未知 |

不改动数据库、认证、backend 业务逻辑、周会归属记录或既有 CI job 名称。

## GitHub 提交建议

1. `feat: implement Figma frontend shell and API health connection`：tokens、壳、健康检查、响应式。
2. `feat: add reflection and letter review workflow`：来访者流程及必要测试，明确业务模式。
3. `feat: add therapist assignment and inbox screens`：咨询师页面及可用接口适配。
4. `docs: document frontend setup and backend integration gaps`：README、现状、契约和风险。

在 `codex/frontend-v01` 开发，通过 PR 进入 main。保留 `Typecheck and build` 检查名；执行 typecheck、test、build 后由另一名团队成员评审。不直接推送 main。当前请求包含准备修改方案，尚未创建远程 PR 或发布。

## 验证与联调边界

- `npm ci`、`npm run typecheck`、`npm test`、`npm run build`。
- 实际启动 API 和 web，检查健康检查成功和 API 停止后的失败。
- 浏览器验证 390px、768px、1440px，检查键盘焦点、标签、长文、空状态、返回导航和横向溢出。
- 检查保存失败保留输入、连续保存、发送前确认、重复发送、发送后固定副本。
- 当前骨架无法验证：登录、权限隔离、数据库持久化、真实发送、服务端幂等、发送时间策略和 AI。必须等对应 backend 后再勾选。

## 需要 backend 确认

版本位置；Session 路径与 cookie/CSRF；草稿初始版本；列表分页；长度限制；可发送时间规则；幂等和超时查回；AI 返回结构。不能由前端猜测这些服务端保证。
