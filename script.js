// ── Icon map: emoji + animation condition ─────────────────────────────────────
const ICON_MAP = {
  "☀️":  { emoji: "☀️",  cond: "sunny" },
  "🌤️": { emoji: "🌤️", cond: "partly-cloudy" },
  "⛅":  { emoji: "⛅",  cond: "partly-cloudy" },
  "🌥️": { emoji: "🌥️", cond: "cloudy" },
  "☁️":  { emoji: "☁️",  cond: "overcast" },
  "🌧️": { emoji: "🌧️", cond: "rainy" },
  "🌦️": { emoji: "🌦️", cond: "rainy" },
  "⛈️":  { emoji: "⛈️",  cond: "stormy" },
  "🌩️": { emoji: "🌩️", cond: "stormy" },
  "❄️":  { emoji: "❄️",  cond: "snowy" },
  "🌨️": { emoji: "🌨️", cond: "snowy" },
  "🌙":  { emoji: "🌙",  cond: "moon" },
  "🌛":  { emoji: "🌛",  cond: "moon" },
  "🌜":  { emoji: "🌜",  cond: "moon" },
};

function iconSpan(emoji, size = "day") {
  const meta = ICON_MAP[emoji] || { emoji, cond: "sunny" };
  const cls  = size === "cur" ? "weather-icon" : "day-icon";
  return `<span class="${cls}" data-condition="${meta.cond}">${meta.emoji}</span>`;
}

// ── Weather data ──────────────────────────────────────────────────────────────
const CITIES = {
  knoxville: {
    label: "KNOXVILLE",
    current: { temp: 79, desc: "clear sky", icon: "☀️" },
    daily: [
      { offset: 0, icon: "☀️",  high: 80, low: 62 },
      { offset: 1, icon: "☀️",  high: 80, low: 58 },
      { offset: 2, icon: "🌤️", high: 83, low: 60 },
      { offset: 3, icon: "🌥️", high: 84, low: 60 },
      { offset: 4, icon: "🌥️", high: 83, low: 62 },
      { offset: 5, icon: "🌥️", high: 80, low: 67 },
      { offset: 6, icon: "🌥️", high: 84, low: 66 },
    ],
  },
  mountjuliet: {
    label: "MT. JULIET",
    current: { temp: 82, desc: "mostly sunny", icon: "☀️" },
    daily: [
      { offset: 0, icon: "☀️",  high: 82, low: 63 },
      { offset: 1, icon: "☀️",  high: 82, low: 60 },
      { offset: 2, icon: "🌤️", high: 84, low: 61 },
      { offset: 3, icon: "🌥️", high: 85, low: 62 },
      { offset: 4, icon: "🌥️", high: 81, low: 64 },
      { offset: 5, icon: "🌥️", high: 80, low: 65 },
      { offset: 6, icon: "🌥️", high: 83, low: 66 },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAY_ABBR = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MON_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function dateFromOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function fmtDay(d)  { return DAY_ABBR[d.getDay()]; }
function fmtDate(d) { return `${MON_ABBR[d.getMonth()]} ${d.getDate()}`; }

// ── DOM refs ──────────────────────────────────────────────────────────────────
const cityNameEl   = document.getElementById("city-name");
const curIconEl    = document.getElementById("cur-icon");
const curTempEl    = document.getElementById("cur-temp");
const curDescEl    = document.getElementById("cur-desc");
const forecastEl   = document.getElementById("forecast");
const topRowEl     = document.querySelector(".top-row");
const dropdownEl   = document.getElementById("dropdown-menu");
const dropItems    = document.querySelectorAll(".dropdown-item");

let activeCity = "knoxville";

// ── Render ────────────────────────────────────────────────────────────────────
function render(city, animate = false) {
  const data = CITIES[city];

  const doUpdate = () => {
    cityNameEl.textContent = data.label;

    // Replace the cur-icon span content with an animated span
    curIconEl.innerHTML = "";
    const iconEl = document.createElement("span");
    const meta = ICON_MAP[data.current.icon] || { emoji: data.current.icon, cond: "sunny" };
    iconEl.className = "weather-icon";
    iconEl.dataset.condition = meta.cond;
    iconEl.textContent = meta.emoji;
    iconEl.style.fontSize = "32px";
    curIconEl.appendChild(iconEl);

    curTempEl.textContent = `${data.current.temp} °F`;
    curDescEl.textContent = data.current.desc;

    forecastEl.innerHTML = data.daily.map(d => {
      const date    = dateFromOffset(d.offset);
      const isToday = d.offset === 0;
      const meta    = ICON_MAP[d.icon] || { emoji: d.icon, cond: "sunny" };
      return `
        <div class="day-col${isToday ? " today" : ""}">
          <span class="day-name">${fmtDay(date)}</span>
          <span class="day-date">${fmtDate(date)}</span>
          <span class="day-icon" data-condition="${meta.cond}">${meta.emoji}</span>
          <div class="day-temps">
            <span class="day-high">${d.high} °F</span>
            <span class="day-low">${d.low} °F</span>
          </div>
        </div>`;
    }).join("");
  };

  if (animate) {
    forecastEl.classList.add("fading");
    topRowEl.classList.add("fading");
    setTimeout(() => {
      doUpdate();
      forecastEl.classList.remove("fading");
      topRowEl.classList.remove("fading");
    }, 160);
  } else {
    doUpdate();
  }

  // Sync active state on dropdown items
  dropItems.forEach(item => {
    item.classList.toggle("active", item.dataset.city === city);
  });
}

// ── Dropdown item click ───────────────────────────────────────────────────────
dropItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    const city = item.dataset.city;
    if (city === activeCity) return;
    activeCity = city;
    render(city, true);
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
render(activeCity);
