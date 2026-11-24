"use strict";

const grid = document.querySelector("#bookGrid");
const searchInput = document.querySelector("#searchInput");
const resultCount = document.querySelector("#resultCount");
const addBookForm = document.querySelector("#addBookForm");
const formMessage = document.querySelector("#formMessage");
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
            ${book.isNewArrival ? '<span class="book-badge">Featured / New Arrival</span>' : ""}
            <h3>${escapeHtml(book.title)}</h3>
            <p>by ${escapeHtml(book.author)} · ${escapeHtml(book.category)}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCurrentSearch() {
  const query = searchInput.value.trim().toLowerCase();
  renderBooks(
    books.filter((book) =>
      `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query),
    ),
  );
}

async function loadBooks() {
  try {
    const response = await fetch("/api/books");
    if (!response.ok) throw new Error("Catalog unavailable");
    books = await response.json();
    renderCurrentSearch();
  } catch {
    resultCount.textContent = "";
    grid.innerHTML = '<p class="empty-state">Unable to load the catalog.</p>';
  }
}

searchInput.addEventListener("input", () => {
  renderCurrentSearch();
});

addBookForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";
  const formData = new FormData(addBookForm);
  const book = Object.fromEntries(
    ["title", "author", "category"].map((field) => [field, formData.get(field).trim()]),
  );
  book.isNewArrival = formData.get("isNewArrival") === "on";

  try {
    const response = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to add this book.");
    addBookForm.reset();
    formMessage.textContent = `${result.title} was added to the catalog.`;
    await loadBooks();
  } catch (error) {
    formMessage.textContent = error.message || "Unable to add this book.";
  }
});

loadBooks();
