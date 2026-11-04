# Milestone 1 前端交付

2026-11-04 · 本地分支 `codex/frontend-v01` · 基线 `580f5f3`

用户提供的 `team-roles-and-development-order.md` 是本轮范围依据：Huang 的 Client/Therapist shells、mock DTOs、save/error states 和独立 SOS。视觉延续 Figma Frontend v0.1，保留两端独立配色与 Inter。

## 可以检查

- `/#/client`：首页 → 三题反思（允许留空/跳过）→ 手动信件 → 精确正文与接收人预览。
- 保存按钮演示 saving/saved/error/retry；失败保留输入。全部仅在内存，无实际保存 API。
- `/#/therapist`：概览、Client 示例、固定已批准信件、空收件箱、任务表单预览和设置占位。
- `/#/sos`：无需登录、无需 API；从来访者端往返保持内存草稿。角色切换清空私密编辑状态。
- 页脚真实调用 `/health`，失败不会替换为演示成功。

## 验证结果

- `npm run typecheck`：通过。
- `npm test`：5 项通过（API 2 项，web 3 项）。
- `npm run build`：通过。
- Playwright：7 项通过，覆盖健康连接与失败重试、保存失败保留输入、SOS、角色切换、精确预览与禁用发送、任务输入预览、空收件箱，以及 390/768/1440px 两端页面无横向溢出。
- 已查看 Client 390px、Therapist 1440px 的实际截图。截图可由浏览器测试重新生成到仓库 `artifacts/`，未纳入版本管理。
- Impeccable detector 仅报告 Inter 使用频繁的审美提示；按照用户指定的 Figma 字体保留。

## Backend 交接

Backend A/B 尚需按团队文档完成 session、关系授权、存储、activity/appointment/draft API。下一轮先核对 `fixtures.ts` 的 DTO 与正式响应，再用 API 适配层替换内存演示。不得把客户端角色切换当作真实访问控制。

真实发送、幂等、时间窗口、冲突恢复、AI 和数据库持久化未实现或验证。任务表单没有向来访者分配任务，示例信件也不是本应用发送的结果。前端未修改 backend 业务逻辑。

## GitHub

具体修改路线见 [frontend-v01-change-plan.md](frontend-v01-change-plan.md)。本轮已更新 README、技术设计、需求状态和风险说明；保留原始 API 草案与团队分工。新增依赖为 Inter 字体及 Playwright 开发测试工具。

建议 PR 标题：`feat: add milestone 1 frontend with Figma role themes`。

建议描述：Adds responsive client and therapist demo shells, typed fictional DTOs, private in-memory draft save/error/retry states, exact letter preview, assignment preview, independent SOS placeholder, and real API health through the Vite proxy. Sending, AI, authentication and persistence remain unavailable. Validated with typecheck, five unit/smoke tests, build, and seven browser tests across mobile/tablet/desktop. Figma v0.1 palettes are preserved.

尚未创建 commit、推送分支或创建远程 PR。合入 main 仍需团队成员评审与现有 CI。
