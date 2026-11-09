# 发布到 GitHub 的完整流程

## 发布边界（重要）

- 本 GitHub 仓库**只发布 AI 插件包**（`kaifa/kiikii`），包括 MCP 配置、SKILL、插件清单、安装文档和 release zip。
- **backend / frontend 项目源码只推送 GitCode，禁止上传到 GitHub。**
- 不得把数据库配置、API Key、用户数据、项目业务代码混入本仓库。

本文假设你已经在本机准备好了这个插件目录，且还没有 GitHub 仓库。

## 0. 发布前检查

- [ ] `README.md`、`CHANGELOG.md`、`SECURITY.md` 已更新
- [ ] `SKILL.md` 的版本号与两个插件清单版本号一致
- [ ] `mcp.json` / `.mcp.json` 使用正式域名 `https://api.kiikii.vip/api/mcp`
- [ ] `.claude-plugin/plugin.json` 的 `repository` 已替换为真实仓库地址（现在是 `<YOUR_GITHUB_ACCOUNT>/<YOUR_REPOSITORY>` 占位符）
- [ ] 仓库内没有任何真实 API Key、Cookie、Token、用户隐私数据
- [ ] `mcp.api-key.example.json` 里只有 `<YOUR_API_KEY>` 占位符
- [ ] License 已由仓库所有者确认（未确认前不要公开仓库）

## 1. 创建 GitHub 仓库

1. 登录 GitHub。
2. 右上角 `+` → `New repository`。
3. 填写：
   - `Repository name`：例如 `kiikii-ai-plugin`
   - `Description`：`kiikii digital human & AI creation plugin for MCP-compatible clients`
   - `Visibility`：`Public`（支持“从 GitHub 安装”的客户端需要公开仓库）
   - **不要勾选** `Add a README file`、`Add .gitignore`、`Choose a license`（因为本地已经有文件，勾选会产生冲突）
4. 点击 `Create repository`。
5. 记下仓库地址，例如：
   - HTTPS：`https://github.com/<account>/kiikii-ai-plugin.git`
   - SSH：`git@github.com:<account>/kiikii-ai-plugin.git`

## 2. 本地初始化并推送

在插件目录执行：

```bash
git init
git add .
git commit -m "feat: kiikii AI plugin 0.9.0"
git branch -M main
git remote add origin git@github.com:<account>/kiikii-ai-plugin.git
git push -u origin main
```

如果使用 HTTPS，把 remote 换成：

```bash
git remote add origin https://github.com/<account>/kiikii-ai-plugin.git
```

推送时 GitHub 不再接受账号密码，需要使用 Personal Access Token（PAT）或 SSH Key。

## 3. 认证方式

### 方式 A：SSH Deploy Key（推荐）

适合让某台机器/某个协作者只拥有这一个仓库的写权限。

1. 在本机生成密钥（如果已有可跳过）：

```bash
ssh-keygen -t ed25519 -C "kiikii-plugin-deploy" -f ~/.ssh/kiikii_plugin_deploy
```

2. 复制公钥：

```bash
cat ~/.ssh/kiikii_plugin_deploy.pub
```

3. GitHub 仓库 → `Settings` → `Deploy keys` → `Add deploy key`：
   - Title：`kiikii-plugin-deploy`
   - Key：粘贴公钥
   - 勾选 `Allow write access`
4. 配置 SSH：

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com-kiikii-plugin
  HostName github.com
  User git
  IdentityFile ~/.ssh/kiikii_plugin_deploy
  IdentitiesOnly yes
EOF
```

5. 把 remote 改成：

```bash
git remote set-url origin git@github.com-kiikii-plugin:<account>/kiikii-ai-plugin.git
```

6. 测试并推送：

```bash
ssh -T git@github.com-kiikii-plugin
git push -u origin main
```

### 方式 B：Fine-grained PAT

1. GitHub → `Settings` → `Developer settings` → `Personal access tokens` → `Fine-grained tokens`
2. `Generate new token`：
   - Repository access：只选 `kiikii-ai-plugin`
   - Permissions：`Contents: Read and write`
3. 推送时用户名填 GitHub 用户名，密码填 Token。

不要把 Token 写进仓库文件、命令历史或文档。

## 4. 完善仓库信息

在仓库首页点击 `About` 右侧齿轮：

- Description：`kiikii digital human & AI creation plugin (MCP + Skill)`
- Website：`https://ai.kiikii.vip`
- Topics：`mcp`、`skills`、`digital-human`、`ai-video`、`plugin`
- 确认默认分支为 `main`

## 5. 发布 Release

1. 本地确认版本号：

```bash
grep -R "0.9.0" .codebuddy-plugin/plugin.json .claude-plugin/plugin.json .claude-plugin/marketplace.json SKILL.md
```

2. 生成 zip（zip 内顶层目录为 `kiikii/`）：

```bash
cd ..
zip -r kiikii-ai-plugin-0.9.0.zip kiikii \
  -x "kiikii/.git/*" "kiikii/.DS_Store" "kiikii/*.zip"
```

3. 提交并打 tag：

```bash
cd kiikii
git add .
git commit -m "release: 0.9.0"
git tag v0.9.0
git push
git push origin v0.9.0
```

4. GitHub 仓库 → `Releases` → `Draft a new release`：
   - Tag：`v0.9.0`
   - Title：`kiikii AI Plugin 0.9.0`
   - 上传 `kiikii-ai-plugin-0.9.0.zip`
   - 从 `CHANGELOG.md` 复制变更说明
5. 点击 `Publish release`。

## 6. 可选：保护主分支

仓库 → `Settings` → `Branches` → `Add branch protection rule`：

- Branch name pattern：`main`
- 勾选 `Require a pull request before merging`
- 勾选 `Require status checks to pass`（有 CI 时）

## 7. 发布后验证

- 浏览器打开仓库，确认 README、SKILL、mcp 配置可读；
- 用另一个目录重新 clone，确认不含本机私密文件；
- 在支持“从 GitHub 安装”的客户端中填写仓库地址，确认能识别插件；
- 下载 Release zip，确认导入客户端后能连接并调用 `kiikii_get_account`。

## 8. 后续版本

1. 修改功能/文档；
2. 同步升级 `.codebuddy-plugin/plugin.json`、`.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json`、`CHANGELOG.md`；
3. 生成新 zip；
4. 打新 tag（`v0.9.1`、`v0.10.0`）；
5. 创建新 Release 并上传 zip。
