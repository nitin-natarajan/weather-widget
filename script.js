// ── Weather data (seeded 2026-06-02, live readings) ──────────────────────────
// The forecast array always starts at index 0 = today.
// JS will rotate so today is always first.

const CITIES = {
  knoxville: {
    label: "KNOXVILLE",
    current: { temp: 79, desc: "clear sky", icon: "☀️" },
    // keyed by YYYY-MM-DD; we generate a rolling 7-day window from today
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
    label: "MOUNT JULIET",
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
const DAY_ABBR  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MON_ABBR  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function dateFromOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

function fmtDay(d) { return DAY_ABBR[d.getDay()]; }
function fmtDate(d) { return `${MON_ABBR[d.getMonth()]} ${d.getDate()}`; }

// ── DOM refs ──────────────────────────────────────────────────────────────────
const cityNameEl  = document.getElementById("city-name");
const curIconEl   = document.getElementById("cur-icon");
const curTempEl   = document.getElementById("cur-temp");
const curDescEl   = document.getElementById("cur-desc");
const forecastEl  = document.getElementById("forecast");
const topRowEl    = document.querySelector(".top-row");
const togBtns     = document.querySelectorAll(".tog");

let activeCity = "knoxville";

// ── Render ────────────────────────────────────────────────────────────────────
function render(city, animate = false) {
  const data = CITIES[city];

  const doUpdate = () => {
    // Header
    cityNameEl.textContent    = data.label;
    curIconEl.textContent     = data.current.icon;
    curTempEl.textContent     = `${data.current.temp} °F`;
    curDescEl.textContent     = data.current.desc;

    // Forecast columns — today is always first (offset 0)
    forecastEl.innerHTML = data.daily.map((d, i) => {
      const date = dateFromOffset(d.offset);
      const isToday = d.offset === 0;
      return `
        <div class="day-col${isToday ? " today" : ""}">
          <span class="day-name">${fmtDay(date)}</span>
          <span class="day-date">${fmtDate(date)}</span>
          <span class="day-icon">${d.icon}</span>
          <div class="day-temps">
            <span class="day-high">${d.high} °F</span>
            <span class="day-low">${d.low} °F</span>
          </div>
        </div>
      `;
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
}

// ── Toggle ────────────────────────────────────────────────────────────────────
togBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const city = btn.dataset.city;
    if (city === activeCity) return;
    activeCity = city;
    togBtns.forEach(b => b.classList.toggle("active", b.dataset.city === city));
    render(city, true);
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
render(activeCity);
