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

function pageId(value, name) {
  const id = required(value, name);
  if (!/^\d+$/.test(id)) {
    throw new Error(`${name} must be a numeric Confluence page ID, not a URL.`);
  }
  return id;
}

function demoSession(args) {
  const supplied = option(args, "--demo") || process.env.DEMO_SESSION;
  if (!supplied) {
    throw new Error(
      "Please provide your Demo session number such as Demo-1 or Demo-2 before we begin",
    );
  }
  if (!/^Demo-[1-9]\d*$/.test(supplied)) {
    throw new Error("DEMO_SESSION must use the format Demo-1, Demo-2, or another positive integer suffix.");
  }
  return supplied;
}

function demoTitle(args, title) {
  const prefix = `[${demoSession(args)}]`;
  return title.startsWith(prefix) ? title : `${prefix} ${title}`;
}

function getConfig() {
  const baseUrlValue = required(
    process.env.CONFLUENCE_URL || process.env.CONFLUENCE_BASE_URL,
    "CONFLUENCE_URL",
  ).trim();
  let normalizedBaseUrl;
  try {
    const url = new URL(baseUrlValue);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
    const pathname = url.pathname.replace(/\/+$/, "");
    url.pathname = pathname.endsWith("/wiki") ? pathname : `${pathname}/wiki`;
    url.search = "";
    url.hash = "";
    normalizedBaseUrl = url.toString().replace(/\/+$/, "");
  } catch {
    throw new Error("CONFLUENCE_URL must be a valid absolute HTTP(S) URL.");
  }
  return {
    baseUrl: normalizedBaseUrl,
    email: required(process.env.CONFLUENCE_EMAIL, "CONFLUENCE_EMAIL"),
    token: required(
      process.env.CONFLUENCE_API_TOKEN || process.env.JIRA_SSO_PAT,
      "CONFLUENCE_API_TOKEN (or JIRA_SSO_PAT)",
    ),
  };
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function markdownToStorage(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let listType = null;
  let codeLines = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(`<p>${paragraph.map(inlineMarkdown).join("<br />")}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) {
      blocks.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph();
      closeList();
      if (codeLines) {
        blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else {
        codeLines = [];
      }
      continue;
    }
    if (codeLines) {
      codeLines.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const item = line.match(/^\s*(?:[-*]\s+|(\d+)\.\s+)(.+)$/);
    if (item) {
      flushParagraph();
      const nextListType = item[1] ? "ol" : "ul";
      if (listType !== nextListType) {
        closeList();
        blocks.push(`<${nextListType}>`);
        listType = nextListType;
      }
      blocks.push(`<li><p>${inlineMarkdown(item[2])}</p></li>`);
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  if (codeLines) {
    blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  return blocks.join("\n");
}

async function errorResponse(response) {
  const body = await response.text();
  const detail = body || "(empty response body)";
  throw new Error(`Confluence API returned HTTP ${response.status}: ${detail}`);
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
  if (!response.ok) await errorResponse(response);
  return { ...(await response.json()), _httpStatus: response.status };
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
  const [command, ...args] = process.argv.slice(2);
  if (command === "read") {
    const config = getConfig();
    const id = pageId(
      option(args, "--page-id") || process.env.CONFLUENCE_STORY_PAGE_ID,
      "CONFLUENCE_STORY_PAGE_ID or --page-id",
    );
    const page = await api(config, "GET", id);
    process.stdout.write(
      `${JSON.stringify({
        id: page.id,
        title: page.title,
        http_status: page._httpStatus,
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
    const id = pageId(option(args, "--page-id"), "--page-id");
    const title = demoTitle(args, required(option(args, "--title"), "--title"));
    const file = required(option(args, "--file"), "--file");
    const content = markdownToStorage(fs.readFileSync(path.resolve(file), "utf8"));
    const current = await api(config, "GET", id);
    const page = await api(config, "PUT", id, {
      id,
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

  if (command === "create") {
    if (!args.includes("--approved")) {
      throw new Error("Confluence writes require explicit approval and the --approved flag.");
    }
    const config = getConfig();
    const title = demoTitle(args, required(option(args, "--title"), "--title"));
    const file = required(option(args, "--file"), "--file");
    const parentId = pageId(
      option(args, "--parent-id") || process.env.CONFLUENCE_STORY_PAGE_ID,
      "CONFLUENCE_STORY_PAGE_ID or --parent-id",
    );
    const spaceKey = required(
      process.env.CONFLUENCE_SPACE_KEY,
      "CONFLUENCE_SPACE_KEY",
    );
    const content = markdownToStorage(fs.readFileSync(path.resolve(file), "utf8"));
    const url = new URL(`${config.baseUrl}/rest/api/content`);
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.email}:${config.token}`).toString("base64")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          type: "page",
          title,
          ancestors: [{ id: parentId }],
          space: { key: spaceKey },
          body: {
            storage: {
              value: content,
              representation: "storage",
            },
          },
        }),
      });
    } catch {
      throw new Error("Unable to reach Confluence; check the URL and network connection.");
    }
    if (!response.ok) await errorResponse(response);
    const page = await response.json();
    process.stdout.write(
      `${JSON.stringify({
        id: page.id,
        title: page.title,
        status: "created",
        parent_id: parentId,
        url: `${page._links?.base || config.baseUrl}${page._links?.webui || ""}`,
      }, null, 2)}\n`,
    );
    return;
  }

  throw new Error(
    "Usage: node scripts/confluencePublisher.js read [--page-id ID]\n" +
      "   or: node scripts/confluencePublisher.js publish --page-id ID --title TITLE --file FILE --demo Demo-1 --approved\n" +
      "   or: node scripts/confluencePublisher.js create --title TITLE --file FILE --parent-id ID --demo Demo-1 --approved",
  );
}

main().catch((error) => {
  process.stderr.write(`ERROR: ${error.message}\n`);
  process.exitCode = 1;
});
