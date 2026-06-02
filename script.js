// ── Icon map ──────────────────────────────────────────────────────────────────
// WMO weather code → emoji + animation condition
function wmoToIcon(code, isDay) {
  if (code === 0)                return isDay ? { emoji:"☀️", cond:"sunny" }       : { emoji:"🌙", cond:"moon" };
  if (code <= 2)                 return isDay ? { emoji:"🌤️",cond:"partly-cloudy"} : { emoji:"🌙", cond:"moon" };
  if (code === 3)                return { emoji:"🌥️", cond:"cloudy" };
  if (code <= 48)                return { emoji:"☁️",  cond:"overcast" };
  if (code <= 57)                return { emoji:"🌧️", cond:"rainy" };
  if (code <= 67)                return { emoji:"🌧️", cond:"rainy" };
  if (code <= 77)                return { emoji:"❄️",  cond:"snowy" };
  if (code <= 82)                return { emoji:"🌦️", cond:"rainy" };
  if (code <= 86)                return { emoji:"❄️",  cond:"snowy" };
  if (code <= 99)                return { emoji:"⛈️",  cond:"stormy" };
  return { emoji:"🌥️", cond:"cloudy" };
}

function wmoDesc(code) {
  if (code === 0)  return "clear sky";
  if (code <= 2)   return "mostly sunny";
  if (code === 3)  return "overcast";
  if (code <= 48)  return "foggy";
  if (code <= 57)  return "drizzle";
  if (code <= 67)  return "rain";
  if (code <= 77)  return "snow";
  if (code <= 82)  return "rain showers";
  if (code <= 86)  return "snow showers";
  if (code <= 99)  return "thunderstorm";
  return "cloudy";
}

// ── City coords ───────────────────────────────────────────────────────────────
const CITIES_META = {
  knoxville:   { label: "KNOXVILLE",  lat: 36.0098, lon: -83.9401 },
  mountjuliet: { label: "MT. JULIET", lat: 36.2001, lon: -86.5186 },
};

// ── Cache ─────────────────────────────────────────────────────────────────────
const cache = {};

async function fetchCity(cityKey) {
  if (cache[cityKey]) return cache[cityKey];

  const { lat, lon } = CITIES_META[cityKey];
  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,weathercode,is_day`
    + `&daily=weathercode,temperature_2m_max,temperature_2m_min`
    + `&temperature_unit=fahrenheit`
    + `&timezone=America%2FChicago`
    + `&forecast_days=7`;

  const res  = await fetch(url);
  const data = await res.json();

  const cur     = data.current;
  const curIcon = wmoToIcon(cur.weathercode, cur.is_day === 1);

  const result = {
    label:   CITIES_META[cityKey].label,
    current: {
      temp: Math.round(cur.temperature_2m),
      desc: wmoDesc(cur.weathercode),
      icon: curIcon,
    },
    daily: data.daily.weathercode.map((code, i) => ({
      offset: i,
      icon:   wmoToIcon(code, true),
      high:   Math.round(data.daily.temperature_2m_max[i]),
      low:    Math.round(data.daily.temperature_2m_min[i]),
    })),
  };

  cache[cityKey] = result;
  return result;
}

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
const cityNameEl = document.getElementById("city-name");
const curIconEl  = document.getElementById("cur-icon");
const curTempEl  = document.getElementById("cur-temp");
const curDescEl  = document.getElementById("cur-desc");
const forecastEl = document.getElementById("forecast");
const topRowEl   = document.querySelector(".top-row");
const dropItems  = document.querySelectorAll(".dropdown-item");

let activeCity = "knoxville";

// ── Render ────────────────────────────────────────────────────────────────────
async function render(city, animate = false) {
  if (animate) {
    forecastEl.classList.add("fading");
    topRowEl.classList.add("fading");
  }

  const data = await fetchCity(city);

  const doUpdate = () => {
    cityNameEl.textContent = data.label;

    curIconEl.innerHTML = "";
    const iconEl = document.createElement("span");
    iconEl.className = "weather-icon";
    iconEl.dataset.condition = data.current.icon.cond;
    iconEl.textContent = data.current.icon.emoji;
    iconEl.style.fontSize = "32px";
    curIconEl.appendChild(iconEl);

    curTempEl.textContent = `${data.current.temp} °F`;
    curDescEl.textContent = data.current.desc;

    forecastEl.innerHTML = data.daily.map(d => {
      const date    = dateFromOffset(d.offset);
      const isToday = d.offset === 0;
      return `
        <div class="day-col${isToday ? " today" : ""}">
          <span class="day-name">${fmtDay(date)}</span>
          <span class="day-date">${fmtDate(date)}</span>
          <span class="day-icon" data-condition="${d.icon.cond}">${d.icon.emoji}</span>
          <div class="day-temps">
            <span class="day-high">${d.high} °F</span>
            <span class="day-low">${d.low} °F</span>
          </div>
        </div>`;
    }).join("");

    dropItems.forEach(item =>
      item.classList.toggle("active", item.dataset.city === city)
    );
  };

  if (animate) {
    setTimeout(() => {
      doUpdate();
      forecastEl.classList.remove("fading");
      topRowEl.classList.remove("fading");
    }, 160);
  } else {
    doUpdate();
  }
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
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
