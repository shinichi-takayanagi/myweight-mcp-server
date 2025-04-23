# MyWeight MCP Server

This server connects to the Health Planet API to access Takayanagi-san's weight data. Any MCP-compatible client can use this server to retrieve and analyze weight measurements.

👉 Check out the [original website](https://shinichi-takayanagi.github.io/myweight/) to view the data directly.

## What It Does

- **Retrieves Data**: Fetches weight records from Health Planet API
- **Works with Any Client**: Compatible with all MCP clients
- **Secure Access**: Protected by OAuth2 authentication

## Quick Start Guide

### 1. Setup & Run Locally

```bash
# Clone this repository
git clone [repository URL]

# Install required packages
npm install

# Launch the development server
npm run dev
```

Your server will be running at `http://localhost:8787`.

### 2. Connect Your MCP Client

Add this configuration to your MCP client:

```json
{
  "mcpServers": {
    "myweight": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"
      ]
    }
  }
}
```

## Using the API

### Get Weight Data

With the `fetchInnerScanData` tool, you can retrieve weight measurements for any time period:

**Parameters:**
- `from`: Starting date/time in YYYYMMDDHHmmss format (e.g., `20240101000000` for Jan 1, 2024)
- `to`: Ending date/time in YYYYMMDDHHmmss format (e.g., `20240131235959` for Jan 31, 2024)

**Example Response:**
```json
[
  {
    "date": "2024/01/01",
    "weight": 65.2
  },
  {
    "date": "2024/01/02",
    "weight": 65.1
  }
]
```

## Deploy to Production

To deploy to Cloudflare Workers:

```bash
npm run deploy
```

After deployment, update your MCP client configuration with your Cloudflare URL:

```json
{
  "mcpServers": {
    "myweight": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://[your-worker-name].[your-account].workers.dev/sse"
      ]
    }
  }
}
```

## Troubleshooting

### Connection Problems
- Make sure the server is running: `npm run dev`
- Clear OAuth data if needed: `rm -rf ~/.mcp-auth`
- Reset Wrangler cache: `rm -rf ~/.wrangler`

### Authentication Issues
- If the auth screen doesn't appear, check your client configuration
- After failed authentication, try restarting your MCP client
