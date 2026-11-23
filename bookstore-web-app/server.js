"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const publicDir = path.join(root, "public");
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};
const MAX_BODY_BYTES = 16 * 1024;
const coverColors = ["#d8c5a5", "#d8dfcc", "#c8d4d7", "#aebd9d", "#dfb58d", "#c7cedf"];

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(value));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
      } else if (!tooLarge) {
        chunks.push(chunk);
      }
    });
    request.on("end", () => {
      if (tooLarge) {
        reject(Object.assign(new Error("Request body is too large."), { statusCode: 413 }));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("Request body must be valid JSON."), { statusCode: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function readBooks() {
  const contents = fs.readFileSync(path.join(root, "data", "books.json"), "utf8");
  const books = JSON.parse(contents);
  if (!Array.isArray(books)) throw new Error("Book catalog must be a JSON array.");
  return books;
}

function writeBooks(books) {
  const filePath = path.join(root, "data", "books.json");
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify(books, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    try {
      fs.rmSync(temporaryPath, { force: true });
    } catch {}
    throw error;
  }
}

async function handleAddBook(request, response) {
  let input;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: error.message });
    return;
  }

  const fields = ["title", "author", "category"];
  const book = {};
  for (const field of fields) {
    if (typeof input?.[field] !== "string" || !input[field].trim()) {
      sendJson(response, 400, { error: `${field} is required.` });
      return;
    }
    const value = input[field].trim();
    const limit = field === "title" ? 120 : 80;
    if (value.length > limit) {
      sendJson(response, 400, { error: `${field} must be ${limit} characters or fewer.` });
      return;
    }
    book[field] = value;
  }

  try {
    const books = readBooks();
    const color = coverColors[books.length % coverColors.length];
    Object.assign(book, { color, textColor: "#17211b" });
    books.push(book);
    writeBooks(books);
    sendJson(response, 201, book);
  } catch {
    sendJson(response, 500, { error: "Unable to update the book catalog." });
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && url.pathname === "/api/books") {
    fs.readFile(path.join(root, "data", "books.json"), "utf8", (error, data) => {
      if (error) {
        sendJson(response, 500, { error: "Unable to load the book catalog." });
        return;
      }
      try {
        const books = JSON.parse(data);
        if (!Array.isArray(books)) throw new Error("Book catalog is not an array.");
        sendJson(response, 200, books);
      } catch {
        sendJson(response, 500, { error: "Book catalog contains invalid data." });
      }
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/books") {
    await handleAddBook(request, response);
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.resolve(publicDir, `.${requestedPath}`);
  if (!filePath.startsWith(publicDir + path.sep)) {
    sendJson(response, 403, { error: "Forbidden." });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Bookstore web app listening at http://localhost:${port}`);
});
