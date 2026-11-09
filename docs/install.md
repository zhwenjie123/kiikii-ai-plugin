# 安装与接入

## 通用验证

连接成功后，在对话中问：

> 查询我的 kiikii 积分余额

能返回昵称、积分余额和套餐，说明 MCP 连接与授权正常。

## 1. WorkBuddy / CodeBuddy

1. 打开客户端的插件/连接器管理入口；
2. 选择“导入插件”“本地安装”或“上传插件包”（不同版本名称可能不同）；
3. 选择 `kiikii-ai-plugin-<version>.zip`，或解压后的目录；
4. 按提示完成 OAuth 授权；
5. 新建对话，问“查询我的 kiikii 积分余额”。

如果客户端只接受连接器包，使用 `kiikii-open-platform-<version>.zip`。

## 2. Claude Code

仓库发布到 GitHub 后：

```text
/plugin marketplace add <GitHub 用户名>/<仓库名>
/plugin install kiikii@kiikii
```

本地调试时，可在 Claude Code 中加载本目录作为本地插件。

远程 MCP 首次连接时，按客户端提示执行 `/mcp` 授权。

## 3. Trae

1. 打开 Trae 设置 → MCP → 添加；
2. 选择 HTTP / Streamable HTTP；
3. 地址填 `https://api.kiikii.vip/api/mcp`；
4. 在 Header 中添加：
   ```text
   Authorization: Bearer <YOUR_API_KEY>
   ```
5. API Key 在 [个人中心 → API 密钥](https://ai.kiikii.vip/profile?section=apiKeys) 创建；
6. 保存后重启客户端或新开会话。

> Trae 的“上传技能”和“MCP 配置”是两个入口：上传技能只安装说明，必须在 MCP 设置里再添加服务器并填 Key，才能实际生成。

## 4. Cursor

1. 打开 Cursor 设置 → MCP；
2. 新增 MCP Server，选择 HTTP / Streamable HTTP；
3. URL 填：

```text
https://api.kiikii.vip/api/mcp
```

4. 如果客户端支持 OAuth，直接连接并授权；
5. 如果不支持 OAuth，在请求头中添加：

```text
Authorization: Bearer <YOUR_API_KEY>
```

> 不同 Cursor 版本可能把该入口称为“Add new MCP server”或直接编辑 `mcp.json`。也可以把 `mcp.api-key.example.json` 合并到 `~/.cursor/mcp.json` 后重启 Cursor。

## 5. Claude Desktop

1. 打开 `claude_desktop_config.json`；
2. 把 `mcp.json` 或 `mcp.api-key.example.json` 的 `mcpServers` 合并进去；
3. 重启 Claude Desktop；
4. 在 MCP 工具列表确认出现 `kiikii`。

> 部分旧版本只支持本地 stdio MCP，不支持远程 HTTP。若客户端没有 HTTP/Streamable HTTP 选项，请升级客户端或改用支持远程 MCP 的客户端。

## 6. 能执行命令的客户端（脚本直连）

如果客户端允许 AI 执行本地命令，可以不配置 MCP，直接用技能自带的脚本调用：

```bash
KIIKII_API_KEY=kii_sk_xxx node scripts/kiikii-mcp-call.mjs kiikii_get_account '{}'
```

其他工具：

```bash
KIIKII_API_KEY=kii_sk_xxx node scripts/kiikii-mcp-call.mjs kiikii_list_creation_models '{}'
KIIKII_API_KEY=kii_sk_xxx node scripts/kiikii-mcp-call.mjs kiikii_generate_image '{"prompt":"雨夜江南小巷","size":"16:9"}'
```

- 脚本会自动完成 MCP 初始化、会话建立和工具调用；
- 适合 Trae 等可以执行终端命令的客户端；
- 不需要把 MCP 配置写进客户端，也不需要重启；
- 密钥只放在命令环境变量里，不要写进仓库或公开日志。

## 7. 只支持 Skill 的工具

导入 `skills/kiikii-digital-human/SKILL.md` 可以获得创作流程指导，但没有 MCP 执行能力，不能直接生成图片/视频/音频。请改用支持 MCP 的客户端，或使用 kiikii 网页端。

## 授权

### OAuth

- 仅适用于 WorkBuddy / CodeBuddy 等已接入 kiikii 连接器体系、且客户端支持 MCP OAuth 的场景；
- 用户点击授权后，客户端获得 `kiikii:account:read`、`kiikii:assets:read`、`kiikii:assets:write` 权限；
- 不需要复制密钥，用户可在 kiikii 网页端撤销授权。

### API Key

- Trae、Cursor、Claude Desktop 以及未上架开放平台的插件/技能直装场景，默认使用 API Key；
- 在 [个人中心 → API 密钥](https://ai.kiikii.vip/profile?section=apiKeys) 创建，格式为 `kii_sk_...`，只在创建时显示一次；
- 写入用户本地客户端配置；
- 不要提交到仓库、截图或群聊。

> OAuth 不是“装了插件就能用”。如果当前客户端不在 kiikii 已接入的连接器体系内，或客户端不支持 MCP OAuth，就必须使用 API Key。

## 常见问题

### 提示“未检测到 kiikii MCP 工具” / 工具列表为空

这不是授权过期，而是 MCP 服务还没有连接到当前客户端。按以下步骤处理：

1. 打开 [个人中心 → API 密钥](https://ai.kiikii.vip/profile?section=apiKeys)；
2. 创建密钥并立即复制完整的 `kii_sk_...`；
3. 在客户端 MCP 设置中添加：
   - URL：`https://api.kiikii.vip/api/mcp`
   - Header：`Authorization: Bearer <你的密钥>`
4. 保存后重启客户端或新开会话；
5. 重新发送“查询我的 kiikii 积分余额”验证。

如果客户端只支持上传技能、没有 MCP 配置入口，那么当前只能使用技能提供创作建议，无法实际生成；请改用支持 MCP 的客户端或 kiikii 网页端。

### 401 / 授权失效

- OAuth 客户端：重新授权；
- API Key 客户端：检查密钥是否过期、被撤销或粘贴时带了多余空格。

### 上传失败

- 使用 `kiikii_create_upload_ticket` 返回的 `transport` 上传，不要把本地路径直接传给工具；
- 上传失败时保留 `ticketId`，可以重试，不要重复创建多张票据。

### 视频任务无法停止

当前 MCP 没有取消工具。任务提交后会继续生成，结果会进入任务记录；只有失败才按失败规则退款。

### 参考视频不可用

当前 MCP 的 `referenceAssetTokens` 只接受图片。参考视频请在 kiikii 网页端 create/canvas 中使用。
