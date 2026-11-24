"use strict";

const fs = require("node:fs");
const path = require("node:path");

const starterBooks = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    category: "Fiction",
    color: "#d8c5a5",
    textColor: "#17211b",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Development",
    color: "#d8dfcc",
    textColor: "#17211b",
  },
  {
    title: "The Creative Act",
    author: "Rick Rubin",
    category: "Creativity",
    color: "#c8d4d7",
    textColor: "#17211b",
  },
];

const appDir = path.join(__dirname, "bookstore-web-app");
fs.writeFileSync(
  path.join(appDir, "data", "books.json"),
  JSON.stringify(starterBooks, null, 2) + "\n",
);

const indexPath = path.join(appDir, "public", "index.html");
const indexHtml = fs.readFileSync(indexPath, "utf8");
const baselineIndexHtml = indexHtml.replace(
  "Version 2.0 - Live Demo",
  "Version 1.0 - Baseline",
);
fs.writeFileSync(indexPath, baselineIndexHtml, "utf8");

console.log("Demo reset complete: 3 starter books restored; Version 1.0 - Baseline restored.");
