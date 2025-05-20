import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchInnerScanData, type WeightData } from "./weight";


// typesファイルは使用せずにインラインで型定義

/**
 * Health Planet APIと連携して体重データを提供するMCPサーバー
 * このサーバーは、指定された期間の体重データを取得するためのツールを提供します。
 * 
 * @extends {McpAgent}
 */
export class MyWeightMCP extends McpAgent {
	/**
	 * MCPサーバーの設定
	 * @type {McpServer}
	 */
	server = new McpServer({
		name: "MyWeight",
		version: "1.0.0",
		description: "Dr Takayanagi（高柳）'s weight data via Health Planet API"
	});

	/**
	 * MCPサーバーの初期化
	 * 利用可能なツールを登録します
	 */
	async init() {
		// 体重データを取得するツールを登録
		this.server.tool(
			"fetchInnerScanData", // ツール名
			{
				// パラメータの定義
				from: z.string().describe("Start date in YYYYMMDDHHmmss format (e.g., 20240101000000)"),
				to: z.string().describe("End date in YYYYMMDDHHmmss format (e.g., 20240131235959)"),
			},
			// ツールの実装
			async ({ from, to }) => {
				try {
					// Health Planet APIから体重データを取得
					console.log(from);
					const data = await fetchInnerScanData(from, to);
					//console.log(data);
					// データをJSON形式の文字列に変換
					const resultText = JSON.stringify(data, null, 2);
					//console.log(resultText);
					return {
						// 結果をテキスト形式で返す
						// 例: [{ "date": "2024/01/01", "weight": 65.2 }, ...]
						content: [{ type: "text", text: resultText || "[]" }],
					};
				} catch (error) {
					// エラーハンドリング
					console.error("Error in fetchInnerScanData tool:", error);
					const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
					return {
						content: [{ type: "text", text: `Error: ${errorMessage}` }],
					};
				}
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			// @ts-ignore
			return MyWeightMCP.serveSSE("/sse").fetch(request, env, ctx);
		}
		if (url.pathname === "/mcp") {
			// @ts-ignore
			return MyWeightMCP.serve("/mcp").fetch(request, env, ctx);
		}
		return new Response("Not found", { status: 404 });
	},
};

