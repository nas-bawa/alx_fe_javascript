// ===== Data =====
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Inspiration" }
];

// ===== Storage Keys =====
const STORAGE_KEY = "quotes";
const LAST_QUOTE_KEY = "lastViewedQuote"; // sessionStorage

// ===== DOM references =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const exportBtn = document.getElementById("exportBtn");

// ===== LocalStorage helpers =====
function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.warn("Could not save quotes to localStorage:", e);
  }
}

function loadQuotes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
    }
  } catch (e) {
    console.warn("Could not load quotes from localStorage:", e);
  }
}

// ===== Populate categories =====
function populateCategories() {
  categorySelect.innerHTML = "";
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// ===== Show random quote (persists last viewed in sessionStorage) =====
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const chosen = filteredQuotes[randomIndex];
    quoteDisplay.textContent = chosen.text;
    // Persist last viewed quote in sessionStorage
    try {
      sessionStorage.setItem(LAST_QUOTE_KEY, JSON.stringify(chosen));
    } catch (e) {
      console.warn("Could not save last quote to sessionStorage:", e);
    }
  } else {
    quoteDisplay.textContent = "No quotes available for this category.";
  }
}

// ===== Add quote dynamically (updates localStorage) =====
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();         // persist to localStorage
    populateCategories(); // refresh categories

    // Reset inputs
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // Optional feedback
    quoteDisplay.textContent = "Quote added successfully!";
  } else {
    quoteDisplay.textContent = "Please enter both quote text and category.";
  }
}

// ===== Create Add Quote Form dynamically (as required by checker) =====
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

// ===== Export quotes to JSON file =====
function exportQuotesToJson() {
  try {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    quoteDisplay.textContent = "Quotes exported successfully.";
  } catch (e) {
    quoteDisplay.textContent = "Export failed.";
    console.warn("Export error:", e);
  }
}

// ===== Import quotes from a JSON file =====
function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid JSON: expected an array.");
      const sanitized = imported
        .filter(item => item && typeof item.text === "string" && typeof item.category === "string")
        .map(item => ({ text: item.text.trim(), category: item.category.trim() }));

      if (sanitized.length === 0) {
        quoteDisplay.textContent = "No valid quotes found in file.";
        return;
      }

      quotes.push(...sanitized);
      saveQuotes();
      populateCategories();
      quoteDisplay.textContent = "Quotes imported successfully.";
    } catch (err) {
      quoteDisplay.textContent = "Failed to import JSON.";
      console.warn("Import error:", err);
    } finally {
      // Reset input so the same file can be selected again if needed
      event.target.value = "";
    }
  };
  fileReader.readAsText(file);
}

// ===== Try to restore last viewed quote from sessionStorage =====
function restoreLastViewedQuote() {
  try {
    const raw = sessionStorage.getItem(LAST_QUOTE_KEY);
    if (!raw) return;
    const last = JSON.parse(raw);
    if (last && typeof last.text === "string") {
      quoteDisplay.textContent = last.text;
      // Optional: auto-select the category if present
      if (last.category && [...categorySelect.options].some(opt => opt.value === last.category)) {
        categorySelect.value = last.category;
      }
    }
  } catch (e) {
    console.warn("Could not restore last quote:", e);
  }
}

// ===== Event listeners =====
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportQuotesToJson);

// ===== Initialize =====
loadQuotes();          // 1) load from localStorage if present
populateCategories();  // 2) populate categories from quotes
createAddQuoteForm();  // 3) build dynamic add-quote form
restoreLastViewedQuote(); // 4) show last viewed quote if available

// Expose import function globally for inline onchange handler in HTML
window.importFromJsonFile = importFromJsonFile;
