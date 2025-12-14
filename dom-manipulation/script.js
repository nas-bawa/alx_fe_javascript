// ===== Data =====
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Inspiration" }
];

// ===== Storage Keys =====
const STORAGE_KEY = "quotes";
const FILTER_KEY = "lastSelectedFilter";

// ===== DOM references =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");

// ===== LocalStorage helpers =====
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    quotes = JSON.parse(data);
  }
}

// ===== Populate categories dynamically =====
function populateCategories() {
  // Clear existing options except "All"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const lastFilter = localStorage.getItem(FILTER_KEY);
  if (lastFilter && [...categoryFilter.options].some(opt => opt.value === lastFilter)) {
    categoryFilter.value = lastFilter;
    filterQuotes();
  }
}

// ===== Filter quotes based on selected category =====
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selectedCategory); // remember filter

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

// ===== Show random quote (uses current filter) =====
function showRandomQuote() {
  filterQuotes();
}

// ===== Add quote dynamically =====
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    quoteDisplay.textContent = "Quote added successfully!";
  } else {
    quoteDisplay.textContent = "Please enter both quote and category.";
  }
}

// ===== Create Add Quote Form dynamically =====
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

// ===== Export quotes to JSON =====
function exportQuotesToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ===== Import quotes from JSON =====
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===== Event listeners =====
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportQuotesToJson);

// ===== Initialize =====
loadQuotes();
populateCategories();
createAddQuoteForm();
