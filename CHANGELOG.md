# CHANGELOG

## 0.9.0

- 明确发布边界：GitHub 只发布 AI 插件包；backend/frontend 项目源码只推送 GitCode，禁止上传 GitHub。
- 新增 `scripts/kiikii-mcp-call.mjs`：可执行本地命令的客户端拿到 API Key 后可直接调用 MCP 工具，无需手工配置 MCP 或重启客户端。
- 插件图标替换为新的 kiikii logo（`icon.svg` 内嵌 PNG，同时提供 `icon.png`）。
- 新增「MCP 未连接」引导：当客户端检测不到 kiikii 工具时，不再只回复“环境没有工具”，而是说明连接问题、给出 API Key 创建链接（`/profile?section=apiKeys`）、MCP 配置模板和各客户端配置步骤。
- 明确授权边界：OAuth 仅适用于已接入连接器体系且支持 MCP OAuth 的场景；Trae/Cursor/Claude Desktop 及未上架开放平台的直装场景默认使用 API Key。
- 插件显示名称统一为「kiikii」，简介同步优化。
- SKILL.md 的「当前版本能力」章节改为英文描述，便于英文客户端展示。
- 新增 GitHub/插件仓库所需的标准文件：README、安装指南、发布指南、安全说明、Claude Code 插件与市场清单。
- 新增 API Key 兼容配置模板 `mcp.api-key.example.json`；OAuth 仅用于已接入连接器体系的场景，通用客户端默认使用 API Key。
- SKILL.md 更新：
  - 明确 MCP 的 `referenceAssetTokens` 当前只接受图片，不接受参考视频；
  - 明确任务提交后没有取消工具，停止不会终止上游任务或按取消退款；
  - 补充 `wan-3.0` 仅由用户显式点名时使用、时长 3–30 秒、成本高于默认模型；
  - 修正图片模型 2K/4K 能力说明；
  - 授权失效提示不再限定 WorkBuddy。
- 新增 `docs/install.md`、`docs/github-publish.md` 和示例提示词。

## 0.8.0

- WorkBuddy / CodeBuddy 插件与连接器版本。
- 支持数字人五种模式、形象/音色克隆、通用图片/视频/音频生成、任务与作品查询。
- 使用 OAuth 连接。
