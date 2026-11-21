"use strict";

const grid = document.querySelector("#bookGrid");
const searchInput = document.querySelector("#searchInput");
const resultCount = document.querySelector("#resultCount");
let books = [];

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function renderBooks(filteredBooks) {
  resultCount.textContent = `${filteredBooks.length} ${
    filteredBooks.length === 1 ? "book" : "books"
  }`;

  if (filteredBooks.length === 0) {
    grid.innerHTML = '<p class="empty-state">No books match your search.</p>';
    return;
  }

  grid.innerHTML = filteredBooks
    .map(
      (book) => `
        <article class="book-card">
          <div class="book-cover" style="--cover:${escapeHtml(book.color)};--cover-text:${escapeHtml(book.textColor)}">
            <strong>${escapeHtml(book.title)}</strong>
          </div>
          <div class="book-details">
            <h3>${escapeHtml(book.title)}</h3>
            <p>by ${escapeHtml(book.author)} · ${escapeHtml(book.category)}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

async function loadBooks() {
  try {
    const response = await fetch("/api/books");
    if (!response.ok) throw new Error("Catalog unavailable");
    books = await response.json();
    renderBooks(books);
  } catch {
    resultCount.textContent = "";
    grid.innerHTML = '<p class="empty-state">Unable to load the catalog.</p>';
  }
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = books.filter((book) =>
    `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query),
  );
  renderBooks(filtered);
});

loadBooks();
