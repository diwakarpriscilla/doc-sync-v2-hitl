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

const readme = `# Bookstore Web App

A dependency-light bookstore web app that runs at http://localhost:3000.

## Run

\`\`\`powershell
cd bookstore-web-app
npm start
\`\`\`

## Reset demo data

\`\`\`powershell
node resetDemo.js
\`\`\`

This restores the three starter books and the bookstore README.
`;

const appDir = path.join(__dirname, "bookstore-web-app");
fs.writeFileSync(
  path.join(appDir, "data", "books.json"),
  JSON.stringify(starterBooks, null, 2) + "\n",
);
fs.writeFileSync(path.join(appDir, "README.md"), readme);

console.log("Demo reset complete: 3 starter books and bookstore README restored.");
