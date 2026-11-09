# 安全说明

## 密钥

- 本仓库不包含任何可用的 kiikii API Key。
- 用户应使用自己的 `kii_sk_...` 密钥，或通过 OAuth 授权。
- 不要把密钥写入公开仓库、截图、日志或群聊。
- API Key 只保存在用户本地客户端配置中；怀疑泄露时立即在 kiikii 网页端撤销。

## 权限

MCP 支持的最小权限范围：

- `kiikii:account:read`
- `kiikii:assets:read`
- `kiikii:assets:write`

OAuth 客户端按用户授权范围访问；API Key 不能登录后台或修改账号设置。

## 上报问题

如发现安全问题，请通过 kiikii 官网提供的联系方式反馈，不要在公开 Issue 中粘贴密钥或用户隐私数据。
