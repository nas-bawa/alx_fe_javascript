// ===== Data =====
let quotes = [];
const STORAGE_KEY = "quotes";
const FILTER_KEY = "lastSelectedFilter";

// ===== DOM references =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");
const notification = document.getElementById("notification");

// ===== Storage helpers =====
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}
function loadQuotes() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) quotes = JSON.parse(data);
}

// ===== Populate categories =====
function populateCategories() {
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  const lastFilter = localStorage.getItem(FILTER_KEY);
  if (lastFilter && [...categoryFilter.options].some(opt => opt.value === lastFilter)) {
    categoryFilter.value = lastFilter;
    filterQuotes();
  }
}

// ===== Filter quotes =====
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selectedCategory);
  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = filteredQuotes[randomIndex].text;
  } else {
    quoteDisplay.textContent = "No quotes available for this category.";
  }
}

// ===== Add quote =====
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    syncQuoteToServer(newQuote); // also send to server
    notification.textContent = "Quote added locally and synced to server.";
  } else {
    notification.textContent = "Please enter both quote and category.";
  }
}

// ===== Create Add Quote Form =====
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
  document.body.appendChild(formContainer);
}

// ===== Server Sync =====
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();
    const serverQuotes = serverData.map(post => ({
      text: post.body,
      category: "Server"
    }));
    // Conflict resolution: server wins
    quotes = [...serverQuotes, ...quotes.filter(q => q.category !== "Server")];
    saveQuotes();
    populateCategories();
    notification.textContent = "Quotes synced from server (server data took precedence).";
  } catch (err) {
    notification.textContent = "Failed to fetch from server.";
    console.error(err);
  }
}

async function syncQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-type": "application/json; charset=UTF-8" }
    });
    notification.textContent = "Quote synced to server.";
  } catch (err) {
    notification.textContent = "Failed to sync quote to server.";
    console.error(err);
  }
}

// ===== Event listeners =====
newQuoteBtn.addEventListener("click", filterQuotes);
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// ===== Initialize =====
loadQuotes();
populateCategories();
createAddQuoteForm();
fetchQuotesFromServer(); // initial sync
setInterval(fetchQuotesFromServer, 30000); // periodic sync every 30s
