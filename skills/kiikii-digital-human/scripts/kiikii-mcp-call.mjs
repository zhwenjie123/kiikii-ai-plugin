#!/usr/bin/env node
/**
 * 用 kiikii API Key 直接调用 MCP 工具，适合能够执行本地命令的 AI 客户端。
 *
 * 用法：
 *   KIIKII_API_KEY=kii_sk_xxx node scripts/kiikii-mcp-call.mjs kiikii_get_account '{}'
 *   KIIKII_API_KEY=kii_sk_xxx node scripts/kiikii-mcp-call.mjs kiikii_list_creation_models '{}'
 *
 * 可选：
 *   KIIKII_MCP_URL=https://api.kiikii.vip/api/mcp
 */
import process from "node:process";

const endpoint = (process.env.KIIKII_MCP_URL || "https://api.kiikii.vip/api/mcp").replace(/\/+$/, "");
const apiKey = (process.env.KIIKII_API_KEY || "").trim();
const [toolName, argumentsJson = "{}"] = process.argv.slice(2);

if (!apiKey) {
    console.error("缺少 KIIKII_API_KEY。请先在 https://ai.kiikii.vip/profile?section=apiKeys 创建密钥，再通过环境变量传入。");
    process.exit(2);
}
if (!toolName) {
    console.error("用法：KIIKII_API_KEY=kii_sk_xxx node scripts/kiikii-mcp-call.mjs <toolName> '<jsonArguments>'");
    process.exit(2);
}

let toolArguments;
try {
    toolArguments = JSON.parse(argumentsJson);
} catch {
    console.error("工具参数必须是合法 JSON，例如：'{\"prompt\":\"雨夜江南小巷\"}'");
    process.exit(2);
}

let sessionId = "";

function requestHeaders() {
    const headers = {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        authorization: `Bearer ${apiKey}`,
    };
    if (sessionId) headers["mcp-session-id"] = sessionId;
    return headers;
}

async function send(body) {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(body),
    });
    const nextSessionId = response.headers.get("mcp-session-id");
    if (nextSessionId) sessionId = nextSessionId;
    const text = await response.text();
    if (!response.ok) {
        throw new Error(`MCP 请求失败（HTTP ${response.status}）：${text.slice(0, 500)}`);
    }
    return { text, contentType: response.headers.get("content-type") || "" };
}

function parsePayload(text, contentType) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (contentType.includes("text/event-stream")) {
        const messages = trimmed
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .filter(Boolean)
            .flatMap((data) => {
                try {
                    return [JSON.parse(data)];
                } catch {
                    return [];
                }
            });
        return messages.find((message) => message.result || message.error) || messages.at(-1) || null;
    }
    try {
        return JSON.parse(trimmed);
    } catch {
        const start = trimmed.indexOf("{");
        const end = trimmed.lastIndexOf("}");
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(trimmed.slice(start, end + 1));
            } catch {
                return null;
            }
        }
        return null;
    }
}

try {
    const initializeResponse = await send({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2025-06-18",
            capabilities: {},
            clientInfo: { name: "kiikii-skill", version: "0.9.0" },
        },
    });
    const initialized = parsePayload(initializeResponse.text, initializeResponse.contentType);
    if (initialized?.error) throw new Error(`MCP 初始化失败：${JSON.stringify(initialized.error)}`);

    // 通知类请求可能返回空响应，忽略响应体即可。
    await send({ jsonrpc: "2.0", method: "notifications/initialized" });

    const callResponse = await send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: toolName, arguments: toolArguments },
    });
    const payload = parsePayload(callResponse.text, callResponse.contentType);
    if (!payload) throw new Error(`未能解析 MCP 返回：${callResponse.text.slice(0, 500)}`);
    if (payload.error) throw new Error(`MCP 工具调用失败：${JSON.stringify(payload.error)}`);

    const result = payload.result ?? payload;
    console.log(JSON.stringify(result, null, 2));
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
}
