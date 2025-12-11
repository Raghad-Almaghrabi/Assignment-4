// ============================
// Utilities
// ============================
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// In-memory storage (replaces localStorage)
const memoryStorage = {
  theme: "light",
  username: null,
  isLoggedIn: false,
  hideProjects: false,
  loginTime: null,
  favoriteProjects: []
};

const STORAGE = {
  THEME: "theme",
  USERNAME: "username",
  LOGIN: "isLoggedIn",
  HIDE_PROJECTS: "hideProjects",
};

// Time-of-day greeting
function timeGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 6) return "You're up early";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// ============================
// Live Clock + Session Timer
// ============================
const timeEl = $("#current-time");
const sessionEl = $("#session-duration");
const sessionStart = Date.now();

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  if (timeEl) timeEl.textContent = `${hh}:${mm}`;

  const diffMs = Date.now() - sessionStart;
  const totalSec = Math.floor(diffMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (sessionEl) {
    sessionEl.textContent = min === 0 ? `${sec}s` : `${min}m ${sec}s`;
  }
}
updateClock();
setInterval(updateClock, 1000);

// ============================
// Theme Switch
// ============================
const themeToggle = $("#themeToggle");

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  if (themeToggle) themeToggle.checked = theme === "dark";
}

function initTheme() {
  const theme = memoryStorage.theme;
  applyTheme(theme);
}

function handleThemeToggle() {
  const theme = themeToggle.checked ? "dark" : "light";
  memoryStorage.theme = theme;
  applyTheme(theme);
}

initTheme();
themeToggle && themeToggle.addEventListener("change", handleThemeToggle);

// ============================
// Greeting Popup (auto)
// ============================
const popupOverlay = $("#popupOverlay");
const closePopup = $("#closePopup");
const popupGreetingEl = $("#popupGreeting");
const nameForm = $("#nameForm");
const usernameInput = $("#username");
const popupActions = $("#popupActions");
const dismissPopupBtn = $("#dismissPopup");
const forgetNameBtn = $("#forgetName");

function renderGreeting() {
  const user = memoryStorage.username;
  const greet = timeGreeting();
  if (popupGreetingEl) {
    popupGreetingEl.textContent = user ? `${greet}, ${user}!` : greet + " 👋";
  }
  if (!nameForm || !popupActions) return;

  if (user) {
    nameForm.hidden = true;
    popupActions.hidden = false;
  } else {
    nameForm.hidden = false;
    popupActions.hidden = true;
  }
}

function openPopup() {
  if (!popupOverlay) return;
  popupOverlay.style.display = "block";
  popupOverlay.setAttribute("aria-hidden", "false");
}

function closePopupOverlay() {
  if (!popupOverlay) return;
  popupOverlay.style.display = "none";
  popupOverlay.setAttribute("aria-hidden", "true");
}

function initPopup() {
  renderGreeting();
  openPopup();
}
window.addEventListener("load", initPopup);

closePopup?.addEventListener("click", closePopupOverlay);
popupOverlay?.addEventListener("click", (e) => {
  if (e.target === popupOverlay) closePopupOverlay();
});

nameForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = usernameInput.value.trim().slice(0, 24);
  if (!name) {
    usernameInput.focus();
    usernameInput.setAttribute("aria-invalid", "true");
    return;
  }
  memoryStorage.username = name;
  usernameInput.removeAttribute("aria-invalid");
  renderGreeting();
});

dismissPopupBtn?.addEventListener("click", closePopupOverlay);
forgetNameBtn?.addEventListener("click", () => {
  memoryStorage.username = null;
  if (usernameInput) usernameInput.value = "";
  renderGreeting();
});

// ============================
// Enhanced Login State with Features
// ============================
const loginToggleBtn = $("#loginToggle");
const loginStatusEl = $("#loginStatus");
const userInfoSection = $("#userInfo");
const loginTimeEl = $("#loginTime");
const favoritesCountEl = $("#favoritesCount");

function formatLoginDuration(startTime) {
  if (!startTime) return "N/A";
  const now = Date.now();
  const diff = now - startTime;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const mins = minutes % 60;
    return `${hours}h ${mins}m ago`;
  }
  return `${minutes}m ago`;
}

function updateLoginInfo() {
  if (!loginTimeEl || !favoritesCountEl) return;
  
  if (memoryStorage.isLoggedIn) {
    loginTimeEl.textContent = formatLoginDuration(memoryStorage.loginTime);
    favoritesCountEl.textContent = memoryStorage.favoriteProjects.length;
  }
}

function applyLoginState(isLoggedIn) {
  if (loginStatusEl) {
    loginStatusEl.textContent = isLoggedIn ? "Logged in" : "Guest mode";
    loginStatusEl.classList.toggle("logged-in", isLoggedIn);
  }
  if (loginToggleBtn) {
    loginToggleBtn.textContent = isLoggedIn ? "LOGOUT" : "LOGIN";
  }
  
  // Show/hide user info section
  if (userInfoSection) {
    userInfoSection.style.display = isLoggedIn ? "block" : "none";
  }
  
  // Show/hide favorite buttons on project cards
  $$(".favorite-btn").forEach(btn => {
    btn.style.display = isLoggedIn ? "inline-block" : "none";
  });
  
  updateLoginInfo();
}

function initLoginState() {
  const isLoggedIn = memoryStorage.isLoggedIn;
  applyLoginState(isLoggedIn);
}

loginToggleBtn?.addEventListener("click", () => {
  const isLoggedIn = memoryStorage.isLoggedIn;
  const next = !isLoggedIn;
  
  if (next) {
    // Logging in
    memoryStorage.loginTime = Date.now();
    memoryStorage.isLoggedIn = true;
    
    // Show welcome notification
    showNotification("Welcome back! You're now logged in. 🎉");
  } else {
    // Logging out
    memoryStorage.isLoggedIn = false;
    memoryStorage.loginTime = null;
    memoryStorage.favoriteProjects = [];
    
    showNotification("You've been logged out. See you soon! 👋");
  }
  
  applyLoginState(next);
  renderProjects(); // Re-render to update favorite states
});

// Update login info every minute
setInterval(updateLoginInfo, 60000);

initLoginState();

// ============================
// Notification System
// ============================
function showNotification(message, duration = 3000) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
  .favorite-btn {
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1.5em;
    padding: 4px 8px;
    transition: transform 0.2s;
  }
  .favorite-btn:hover {
    transform: scale(1.2);
  }
  .favorite-btn.active {
    color: #ff6b6b;
  }
`;
document.head.appendChild(style);

// ============================
// Experience Level Logic
// ============================
const experienceSelect = $("#experienceLevel");
const experienceMessage = $("#experienceMessage");

function updateExperienceMessage() {
  if (!experienceSelect || !experienceMessage) return;
  const val = experienceSelect.value;

  if (val === "beginner") {
    experienceMessage.textContent =
      "You're in learning mode — I'll highlight more approachable and visual projects.";
  } else if (val === "advanced") {
    experienceMessage.textContent =
      "You like things deep and technical — I'll surface projects with more complexity and backend or AI work.";
  } else {
    experienceMessage.textContent =
      "I'll show a mix of projects that balance learning and real-world impact.";
  }

  renderProjects();
}
experienceSelect?.addEventListener("change", updateExperienceMessage);

// ============================
// Projects: search / filter / sort / show-hide / level / favorites
// ============================
const projectsGrid = $("#projectsGrid");
const projectSearch = $("#projectSearch");
const projectFilter = $("#projectFilter");
const projectSort   = $("#projectSort");
const emptyProjects = $("#emptyProjects");
const toggleProjectsButton = $("#toggleProjectsButton");
const showFavoritesBtn = $("#showFavorites");

let showOnlyFavorites = false;

function getAllProjectCards() {
  return projectsGrid ? $$(".card", projectsGrid) : [];
}

function visibleByQuery(card, q) {
  if (!q) return true;
  const needle = q.toLowerCase().trim();

  // Get title from data attribute or h3 element
  const h3Element = card.querySelector("h3");
  const title = (card.dataset.title || h3Element?.textContent || "").toLowerCase().trim();
  
  // Get tags
  const tags = (card.dataset.tags || "").toLowerCase().trim();
  
  // Get description/body text (look for p tags or other text)
  const description = Array.from(card.querySelectorAll("p"))
    .map(p => p.textContent)
    .join(" ")
    .toLowerCase()
    .trim();

  console.log(`  Search "${needle}" in:`, { title, tags, description });

  // Use indexOf for better performance and check all fields
  return title.indexOf(needle) > -1 || 
         tags.indexOf(needle) > -1 || 
         description.indexOf(needle) > -1;
}

function visibleByFilter(card, filter) {
  if (!filter || filter === "all") return true;

  const cardTags = (card.dataset.tags || "").toLowerCase();
  
  // Split tags by comma and trim whitespace
  const tagArray = cardTags.split(",").map(t => t.trim()).filter(Boolean);
  
  // Check if any of the card's tags match the filter
  const matches = tagArray.includes(filter.toLowerCase());
  
  return matches;
}

function visibleByLevel(card, level) {
  if (!level || level === "all") return true;
  const projectLevel = (card.dataset.level || "all").toLowerCase();
  if (level === "beginner") return projectLevel === "beginner";
  if (level === "advanced") return projectLevel === "advanced";
  return true;
}

function visibleByFavorite(card) {
  if (!showOnlyFavorites) return true;
  if (!memoryStorage.isLoggedIn) return true;
  
  const projectId = card.dataset.id || card.querySelector("h3")?.textContent;
  return memoryStorage.favoriteProjects.includes(projectId);
}

function sorter(key) {
  const k = key || "title-asc";

  return (a, b) => {
    if (k === "title-asc" || k === "title-desc") {
      const at = (a.dataset.title || a.querySelector("h3")?.textContent || "").toLowerCase();
      const bt = (b.dataset.title || b.querySelector("h3")?.textContent || "").toLowerCase();
      const cmp = at.localeCompare(bt);
      return k === "title-asc" ? cmp : -cmp;
    }

    if (k === "date-asc" || k === "date-desc") {
      const ad = new Date(a.dataset.date || 0);
      const bd = new Date(b.dataset.date || 0);
      const diff = ad - bd;
      return k === "date-asc" ? diff : -diff;
    }

    return 0;
  };
}

function renderProjects() {
  if (!projectsGrid) return;

  const allCards = getAllProjectCards();
  if (!allCards.length) {
    console.warn("No project cards found in the grid!");
    return;
  }

  const q = (projectSearch?.value || "").trim().toLowerCase();
  const filter = (projectFilter?.value || "all").toLowerCase();
  const sortKey = projectSort?.value || "title-asc";
  const level = (experienceSelect?.value || "all").toLowerCase();

  console.log("=== RENDER PROJECTS ===");
  console.log("Search query:", `"${q}"`);
  console.log("Filter:", filter);
  console.log("Total cards found:", allCards.length);

  const visibleCards = [];
  const hiddenCards = [];

  allCards.forEach((card, index) => {
    const cardTitle = card.dataset.title || card.querySelector("h3")?.textContent || "Untitled";
    const cardTags = card.dataset.tags || "";
    
    console.log(`\nCard ${index + 1}: "${cardTitle}"`);
    console.log(`  - data-tags: "${cardTags}"`);
    console.log(`  - Parsed tags:`, cardTags.split(",").map(t => t.trim()));
    
    const matchQuery = visibleByQuery(card, q);
    const matchFilter = visibleByFilter(card, filter);
    const matchLevel = visibleByLevel(card, level);
    const matchFavorite = visibleByFavorite(card);
    
    console.log(`  - Matches: query=${matchQuery}, filter=${matchFilter}, level=${matchLevel}, favorite=${matchFavorite}`);
    console.log(`  - FINAL: ${matchQuery && matchFilter && matchLevel && matchFavorite ? 'VISIBLE' : 'HIDDEN'}`);
    
    const matches = matchQuery && matchFilter && matchLevel && matchFavorite;

    if (matches) {
      visibleCards.push(card);
    } else {
      hiddenCards.push(card);
    }
  });

  console.log(`\n✅ RESULTS: ${visibleCards.length} visible, ${hiddenCards.length} hidden`);

  // Batch DOM operations for better performance
  // First hide all non-matching cards
  hiddenCards.forEach(card => {
    card.hidden = true;
    card.classList.add("is-hidden");
    card.style.display = "none"; // Force hide
  });

  // Then show matching cards
  visibleCards.forEach(card => {
    card.hidden = false;
    card.classList.remove("is-hidden");
    card.style.display = ""; // Reset display
  });

  if (emptyProjects) {
    emptyProjects.hidden = visibleCards.length > 0;
    if (visibleCards.length === 0) {
      if (showOnlyFavorites) {
        emptyProjects.textContent = "No favorite projects yet. Start favoriting projects to see them here!";
      } else if (filter !== "all") {
        emptyProjects.textContent = `No projects found with the "${filter}" tag. Try a different filter.`;
      } else if (q) {
        emptyProjects.textContent = `No projects match "${q}". Try a different search term.`;
      } else {
        emptyProjects.textContent = "No projects match your current filters.";
      }
    }
  }

  // Sort and re-append in one batch
  visibleCards.sort(sorter(sortKey));
  visibleCards.forEach((card) => projectsGrid.appendChild(card));
  
  // Update favorite buttons
  updateFavoriteButtons();
}

// Debounce function for better performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Hook controls with debounced search for live filtering
const debouncedSearch = debounce(renderProjects, 300);
projectSearch?.addEventListener("input", debouncedSearch);
projectFilter?.addEventListener("change", renderProjects);
projectSort?.addEventListener("change", renderProjects);

// Show/hide projects section
function applyProjectsVisibility(hidden) {
  if (!projectsGrid || !toggleProjectsButton) return;

  projectsGrid.style.display = hidden ? "none" : "flex";
  toggleProjectsButton.textContent = hidden ? "Show Projects" : "Hide Projects";
}

function initProjectsVisibility() {
  const hidden = memoryStorage.hideProjects;
  applyProjectsVisibility(hidden);
}

toggleProjectsButton?.addEventListener("click", () => {
  const hidden = memoryStorage.hideProjects;
  const next = !hidden;
  memoryStorage.hideProjects = next;
  applyProjectsVisibility(next);
});

// Show only favorites toggle
showFavoritesBtn?.addEventListener("click", () => {
  if (!memoryStorage.isLoggedIn) {
    showNotification("Please login to use favorites!", 2000);
    return;
  }
  
  showOnlyFavorites = !showOnlyFavorites;
  showFavoritesBtn.classList.toggle("active", showOnlyFavorites);
  showFavoritesBtn.textContent = showOnlyFavorites ? "Show All" : "Show Favorites";
  renderProjects();
});

initProjectsVisibility();
renderProjects();

// ============================
// Favorite Projects Feature
// ============================
function toggleFavorite(projectId) {
  if (!memoryStorage.isLoggedIn) {
    showNotification("Please login to favorite projects!", 2000);
    return;
  }
  
  const index = memoryStorage.favoriteProjects.indexOf(projectId);
  
  if (index > -1) {
    memoryStorage.favoriteProjects.splice(index, 1);
    showNotification("Removed from favorites", 1500);
  } else {
    memoryStorage.favoriteProjects.push(projectId);
    showNotification("Added to favorites! ⭐", 1500);
  }
  
  updateFavoriteButtons();
  updateLoginInfo();
  
  // Re-render if showing only favorites
  if (showOnlyFavorites) {
    renderProjects();
  }
}

function updateFavoriteButtons() {
  $$(".card").forEach(card => {
    const projectId = card.dataset.id || card.querySelector("h3")?.textContent;
    let favoriteBtn = card.querySelector(".favorite-btn");
    
    if (!favoriteBtn) {
      favoriteBtn = document.createElement("button");
      favoriteBtn.className = "favorite-btn";
      favoriteBtn.setAttribute("aria-label", "Favorite this project");
      favoriteBtn.style.display = memoryStorage.isLoggedIn ? "inline-block" : "none";
      
      // Insert at the beginning of the card
      const cardHeader = card.querySelector("h3");
      if (cardHeader) {
        cardHeader.appendChild(favoriteBtn);
      }
      
      favoriteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(projectId);
      });
    }
    
    const isFavorite = memoryStorage.favoriteProjects.includes(projectId);
    favoriteBtn.textContent = isFavorite ? "❤️" : "🤍";
    favoriteBtn.classList.toggle("active", isFavorite);
  });
}

// ============================
// Skills expand/collapse
// ============================
$$(".skill-card").forEach((card) => {
  function toggle() {
    const isCollapsed = card.getAttribute("data-collapsed") === "true";
    card.setAttribute("data-collapsed", isCollapsed ? "false" : "true");
  }

  card.addEventListener("click", toggle);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
});

// ============================
// Contact form validation
// ============================
const contactForm = $("#contactForm");
const formSuccess = $("#formSuccess");
const formError = $("#formError");

function validateField(input) {
  const value = input.value.trim();
  let valid = value.length > 0;

  if (input.type === "email") {
    valid = /\S+@\S+\.\S+/.test(value);
  }

  input.classList.toggle("error", !valid);
  return valid;
}

contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputs = $$("input[required]", contactForm);
  const allValid = inputs.map(validateField).every(Boolean);

  if (allValid) {
    if (formError) formError.hidden = true;
    if (formSuccess) formSuccess.hidden = false;
    contactForm.reset();
    formSuccess?.focus?.();
    
    showNotification("Message sent successfully! 📧", 2500);
  } else {
    if (formSuccess) formSuccess.hidden = true;
    if (formError) formError.hidden = false;
    formError?.focus?.();
  }
});

$$("input[required]", contactForm).forEach((inp) => {
  inp.addEventListener("input", () => validateField(inp));
});

// ============================
// Weather API (Open-Meteo)
// ============================
const weatherStatus = $("#weatherStatus");
const weatherCard   = $("#weatherCard");
const weatherMain   = $(".weather-main");
const weatherTemp   = $("#weatherTemp");
const weatherDesc   = $("#weatherDesc");
const weatherWind   = $("#weatherWind");
const weatherUpdated = $("#weatherUpdated");
const refreshWeatherBtn = $("#refreshWeather");

function weatherCodeToText(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return map[code] || "Variable conditions";
}

async function fetchWeather() {
  if (weatherStatus) {
    weatherStatus.textContent = "Loading weather…";
  }
  if (weatherMain) {
    weatherMain.hidden = true;
  }

  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=26.3&longitude=50.1" +
      "&current_weather=true&timezone=auto";

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Network response not ok");
    }
    const data = await res.json();
    const cw = data.current_weather;
    if (!cw) throw new Error("No current weather in response");

    const temp = cw.temperature;
    const wind = cw.windspeed;
    const code = cw.weathercode;
    const time = cw.time;

    if (weatherTemp) weatherTemp.textContent = Math.round(temp);
    if (weatherWind) weatherWind.textContent = wind.toFixed(1);
    if (weatherDesc) weatherDesc.textContent = weatherCodeToText(code);
    if (weatherUpdated) {
      weatherUpdated.textContent = new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (weatherStatus) {
      weatherStatus.textContent = "Weather updated successfully ✅";
    }
    if (weatherMain) {
      weatherMain.hidden = false;
    }
  } catch (err) {
    console.error("Weather error:", err);
    if (weatherStatus) {
      weatherStatus.textContent =
        "Couldn't load the weather right now. Please check your connection or try again.";
    }
    if (weatherMain) {
      weatherMain.hidden = true;
    }
  }
}

refreshWeatherBtn?.addEventListener("click", fetchWeather);
fetchWeather();