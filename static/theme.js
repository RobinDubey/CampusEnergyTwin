
const THEME_KEY = "campusEnergyDarkMode";

function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    document.documentElement.classList.toggle("dark-mode", isDark);

    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");

    const button = document.getElementById("darkModeBtn");

    if (button) {
        button.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
}

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme === "dark");

document.addEventListener("click", function (event) {
    const button = event.target.closest("#darkModeBtn");

    if (!button) return;

    const isDark = document.body.classList.contains("dark-mode");
    applyTheme(!isDark);
});