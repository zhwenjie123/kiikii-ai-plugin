# kiikii

把 kiikii 的数字人、AI 创作能力接入支持 MCP / Skill 的 AI 客户端。

- 官网：https://ai.kiikii.vip
- MCP 服务：https://api.kiikii.vip/api/mcp
- 当前版本：0.9.0

## 这是什么

这个仓库同时包含两层能力：

1. **MCP Server 配置**：让 AI 客户端真正调用 kiikii 的生成、素材、任务查询工具。
2. **Skill 指令包**：告诉 AI 什么时候调用哪个工具、参数怎么填、哪些事情不能做。

只装 Skill 只能得到提示词建议，不能真正生成；只配 MCP 则 AI 可能不会正确使用工具。建议两者一起安装。

## 目录结构

```text
.
├── mcp.json                         # Agent Plugins 通用 MCP 配置（OAuth，无密钥）
├── .mcp.json                        # Claude Code 项目级 MCP 配置
├── mcp.api-key.example.json         # 不支持 OAuth 的客户端用 API Key 模板
├── .codebuddy-plugin/plugin.json    # WorkBuddy / CodeBuddy 插件清单
├── .claude-plugin/
│   ├── plugin.json                  # Claude Code 插件清单
│   └── marketplace.json             # Claude Code 仓库市场清单
├── skills/kiikii-digital-human/
│   └── SKILL.md                     # 核心 Skill 指令
├── ai.workbuddy/assets/icon.svg     # WorkBuddy 插件图标
├── docs/
│   ├── install.md                   # 各客户端安装步骤
│   └── github-publish.md            # 发布到 GitHub 的完整流程
├── examples/                        # 提示词示例
├── CHANGELOG.md
├── SECURITY.md
└── README.md
```

## 接入方式

### 1. WorkBuddy / CodeBuddy 插件包（推荐）

1. 下载 Release 中的 `kiikii-ai-plugin-<version>.zip`；
2. 在客户端的插件/连接器入口选择“导入插件”或“上传插件包”；
3. 选择 zip 或解压后的目录；
4. 按客户端提示完成 OAuth 授权；
5. 对话中问“查询我的 kiikii 积分余额”验证连接。

> 该方式使用 OAuth，不需要用户复制 API Key。

### 2. Claude Code 插件

仓库发布到 GitHub 后：

```text
/plugin marketplace add zhwenjie123/kiikii-ai-plugin
/plugin install kiikii@kiikii
```

也可以在 Claude Code 中直接把本仓库目录作为本地插件加载。远程 MCP 是否能用 OAuth 取决于客户端和是否已接入 kiikii 连接器体系；不支持时使用 API Key。

### 3. Cursor / Trae / Claude Desktop 等通用 MCP 客户端

**默认使用 API Key**：复制 `mcp.api-key.example.json`，把 `<YOUR_API_KEY>` 替换成用户自己的 `kii_sk_...` 密钥。

只有客户端明确支持 MCP OAuth，且已接入 kiikii 连接器体系时，才使用不带 Header 的 `mcp.json` 走 OAuth。

```json
{
  "mcpServers": {
    "kiikii": {
      "type": "streamableHttp",
      "url": "https://api.kiikii.vip/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

API Key 在 [kiikii 个人中心 → API 密钥](https://ai.kiikii.vip/profile?section=apiKeys) 创建，格式以 `kii_sk_` 开头，只在创建时显示一次。不要使用平台共享密钥，也不要把密钥提交到仓库。

如果客户端提示“未检测到 kiikii MCP 工具”，说明 MCP 尚未连接，不是积分或账号问题。请按 [docs/install.md](docs/install.md) 的“常见问题”完成 MCP 配置，再重新查询积分。

### 4. 只支持 Skill、没有 MCP 的工具

可以导入 `skills/kiikii-digital-human/SKILL.md` 作为创作指导，但无法直接执行生成。请引导用户使用 kiikii 网页端，或换用支持 MCP 的客户端。

## 授权方式

| 方式 | 适用场景 | 说明 |
| --- | --- | --- |
| OAuth | WorkBuddy / CodeBuddy 等已接入连接器体系、且客户端支持 MCP OAuth 的场景 | 用户授权，无需粘贴密钥，可按用户撤销 |
| API Key | Trae、Cursor、Claude Desktop 以及未上架开放平台的插件/技能直装场景 | 用户自己创建 `kii_sk_...`，写入客户端 MCP 配置 |

> 注意：OAuth 不是“装了插件就能用”。如果当前客户端/插件没有接入 kiikii 的 OAuth 连接器体系，或者客户端本身不支持 MCP OAuth，就必须使用 API Key。未上架开放平台时，默认按 API Key 方式接入。

### 获取 API Key

登录 kiikii 后进入：

https://ai.kiikii.vip/profile?section=apiKeys

创建密钥后立即复制完整的 `kii_sk_...` 密钥；关闭弹窗后无法再次查看。密钥只保存在用户本地 MCP 配置中，不要提交到仓库或发到公开群聊。

## 工具一览

| 工具 | 作用 |
| --- | --- |
| `kiikii_get_account` | 查询昵称、积分、套餐、充值链接 |
| `kiikii_list_modes` | 列出数字人五种模式并推荐 |
| `kiikii_create_upload_ticket` / `kiikii_complete_upload` / `kiikii_get_upload_ticket` | 素材上传票据、登记与查询 |
| `kiikii_list_avatars` / `kiikii_create_avatar` | 查询、克隆/设计数字人形象 |
| `kiikii_list_voices` / `kiikii_create_voice_clone` | 查询音色、克隆音色 |
| `kiikii_create_video` / `kiikii_confirm_video` / `kiikii_revise_video_plan` | 数字人视频方案、确认生产、改方案 |
| `kiikii_update_video_subtitles` | 成片后重烧字幕 |
| `kiikii_generate_image` | 通用图片生成，1–4 张 |
| `kiikii_generate_video` | 通用视频生成，支持首尾帧、参考图、音频驱动 |
| `kiikii_generate_audio` | TTS 配音 |
| `kiikii_get_creation` | 查询通用创作任务 |
| `kiikii_list_creation_models` | 查询可用图片/视频/音频模型与能力 |
| `kiikii_open_asset_gallery` | 打开资产中心 |
| `kiikii_get_job` / `kiikii_list_jobs` / `kiikii_list_works` | 查询任务与作品 |

## 限制与注意事项

- **参考视频**：当前 MCP 的 `referenceAssetTokens` 只接受图片，不接受参考视频；参考视频请在 kiikii 网页端 create/canvas 使用。
- **中止**：MCP 没有取消工具。视频/图片任务提交后会继续执行，完成结果会进入任务记录；只有失败才按失败规则退款。不要在对话中承诺“已停止”或“取消退款”。
- **模型选择**：用户未点名模型时使用后台默认模型；只有用户明确要求 `wan-3.0` 时才选择它。`wan-3.0` 支持 3–30 秒，成本高于默认模型。
- **轮询**：创作任务建议每 10–20 秒查询一次，不要高频轮询。
- **密钥**：API Key 只保存在用户本地；插件包内不包含任何可用密钥。

## 版本与发布

1. 修改 `SKILL.md`、MCP 配置或工具说明时，同步更新：
   - `README.md` / `CHANGELOG.md`
   - `.codebuddy-plugin/plugin.json`
   - `.claude-plugin/plugin.json` / `.claude-plugin/marketplace.json`
   - `connector-meta.json`（如使用连接器包）
2. 打 tag 并生成 Release zip；
3. 在 GitHub Release 中上传 zip，附上变更说明。

## License

发布前由仓库所有者确定 License。未确定前请勿公开分发。
