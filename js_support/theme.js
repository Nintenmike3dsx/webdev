(function () {
  var stored = localStorage.getItem("theme");
  var theme = stored !== null ? stored : "dark";
  document.documentElement.setAttribute("main-theme", theme);
})();

function setTheme(theme) {
  document.documentElement.setAttribute("main-theme", theme);
  localStorage.setItem("theme", theme);
  var btn = document.getElementById("theme-toggle");
  if (btn) {
    var labels = { dark: "Dark Mode", light: "Light Mode", seizure: "Seizure Mode" };
    btn.textContent = labels[theme] || "Dark Mode";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;

  var current = document.documentElement.getAttribute("main-theme");
  var labels = { dark: "Dark Mode", light: "Light Mode", seizure: "Seizure Mode" };
  btn.textContent = labels[current] || "Dark Mode";
});
