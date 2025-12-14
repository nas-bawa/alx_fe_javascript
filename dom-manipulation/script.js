// Quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Inspiration" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");

// Populate categories dynamically
function populateCategories() {
  categorySelect.innerHTML = "";
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Show random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = filteredQuotes[randomIndex].text;
  } else {
    quoteDisplay.textContent = "No quotes available for this category.";
  }
}

// Add new quote dynamically
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter both quote and category.");
  }
}

// ✅ Create the Add Quote Form dynamically
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

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize
populateCategories();
createAddQuoteForm();
