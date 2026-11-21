#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
    if (!match || Object.hasOwn(process.env, match[1])) continue;
    let value = (match[2] || "").trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    process.env[match[1]] = value;
  }
}

function option(args, name) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

function required(value, name) {
  if (!value) throw new Error(`Missing required configuration or argument: ${name}`);
  return value;
}

function getConfig() {
  return {
    baseUrl: required(
      process.env.CONFLUENCE_URL || process.env.CONFLUENCE_BASE_URL,
      "CONFLUENCE_URL",
    ).replace(/\/+$/, ""),
    email: required(process.env.CONFLUENCE_EMAIL, "CONFLUENCE_EMAIL"),
    token: required(
      process.env.CONFLUENCE_API_TOKEN || process.env.JIRA_SSO_PAT,
      "CONFLUENCE_API_TOKEN (or JIRA_SSO_PAT)",
    ),
  };
}

async function api(config, method, pageId, payload) {
  const url = new URL(
    `${config.baseUrl}/rest/api/content/${encodeURIComponent(pageId)}?expand=body.storage,version`,
  );
  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.email}:${config.token}`).toString("base64")}`,
    Accept: "application/json",
  };
  const options = { method, headers };
  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Unable to reach Confluence; check the URL and network connection.");
  }
  if (!response.ok) {
    throw new Error(`Confluence API returned HTTP ${response.status}.`);
  }
  return response.json();
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
  const [command, ...args] = process.argv.slice(2);
  if (command === "read") {
    const config = getConfig();
    const pageId = required(
      option(args, "--page-id") || process.env.CONFLUENCE_STORY_PAGE_ID,
      "CONFLUENCE_STORY_PAGE_ID or --page-id",
    );
    const page = await api(config, "GET", pageId);
    process.stdout.write(
      `${JSON.stringify({
        id: page.id,
        title: page.title,
        version: page.version?.number,
        url: `${page._links?.base || config.baseUrl}${page._links?.webui || ""}`,
        content: page.body?.storage?.value,
      }, null, 2)}\n`,
    );
    return;
  }

  if (command === "publish") {
    if (!args.includes("--approved")) {
      throw new Error("Confluence writes require explicit approval and the --approved flag.");
    }
    const config = getConfig();
    const pageId = required(option(args, "--page-id"), "--page-id");
    const title = required(option(args, "--title"), "--title");
    const file = required(option(args, "--file"), "--file");
    const content = fs.readFileSync(path.resolve(file), "utf8");
    const current = await api(config, "GET", pageId);
    const page = await api(config, "PUT", pageId, {
      id: pageId,
      type: "page",
      title,
      version: { number: current.version.number + 1 },
      body: { storage: { value: content, representation: "storage" } },
    });
    process.stdout.write(
      `${JSON.stringify({
        id: page.id,
        title: page.title,
        version: page.version?.number,
        url: `${page._links?.base || config.baseUrl}${page._links?.webui || ""}`,
        status: "published",
      }, null, 2)}\n`,
    );
    return;
  }

  throw new Error(
    "Usage: node scripts/confluencePublisher.js read [--page-id ID]\n" +
      "   or: node scripts/confluencePublisher.js publish --page-id ID --title TITLE --file FILE --approved",
  );
}

main().catch((error) => {
  process.stderr.write(`ERROR: ${error.message}\n`);
  process.exitCode = 1;
});
