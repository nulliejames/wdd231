const yearElement = document.querySelector("#current-year");
const modifiedElement = document.querySelector("#last-modified");
const spotlightList = document.querySelector("#spotlight-list");
const currentWeather = document.querySelector("#current-weather");
const weatherForecast = document.querySelector("#weather-forecast");

const membershipNames = {
  2: "Silver Member",
  3: "Gold Member"
};

function updateFooterDates() {
  yearElement.textContent = String(new Date().getFullYear());

  const modifiedDate = new Date(document.lastModified);
  if (Number.isNaN(modifiedDate.getTime())) {
    modifiedElement.removeAttribute("datetime");
    modifiedElement.textContent = "";
    return;
  }

  const timestamp = modifiedDate.toISOString();
  modifiedElement.dateTime = timestamp;
  modifiedElement.textContent = timestamp.slice(0, 10);
}

function createSpotlight(member) {
  const article = document.createElement("article");
  article.className = "spotlight-card";

  const image = document.createElement("img");
  image.src = `images/${member.image}`;
  image.alt = `${member.name} logo`;
  image.width = 640;
  image.height = 360;
  image.loading = "lazy";

  const details = document.createElement("div");
  details.className = "spotlight-details";

  const name = document.createElement("h3");
  name.textContent = member.name;

  const contact = document.createElement("address");
  contact.append(document.createTextNode(member.address), document.createElement("br"));

  const phone = document.createElement("a");
  phone.href = `tel:${member.phone.replace(/[^\d+]/g, "")}`;
  phone.textContent = member.phone;
  contact.append(phone, document.createElement("br"));

  const website = document.createElement("a");
  website.href = member.website;
  website.target = "_blank";
  website.rel = "noopener noreferrer";
  website.textContent = "Visit website";
  contact.append(website);

  const membership = document.createElement("span");
  membership.className = "membership";
  membership.textContent = membershipNames[member.membershipLevel];

  details.append(name, contact, membership);
  article.append(image, details);
  return article;
}

function selectSpotlights(members) {
  const eligibleMembers = members.filter(
    (member) => member.membershipLevel === 2 || member.membershipLevel === 3
  );
  const count = Math.min(eligibleMembers.length, 2 + Math.floor(Math.random() * 2));

  for (let index = eligibleMembers.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [eligibleMembers[index], eligibleMembers[swapIndex]] = [
      eligibleMembers[swapIndex],
      eligibleMembers[index]
    ];
  }

  return eligibleMembers.slice(0, count);
}

async function loadSpotlights() {
  try {
    const response = await fetch("data/members.json");
    if (!response.ok) {
      throw new Error(`Member data request failed (${response.status}).`);
    }

    const members = await response.json();
    if (!Array.isArray(members)) {
      throw new Error("Member data has an invalid format.");
    }

    const spotlights = selectSpotlights(members);
    if (spotlights.length < 2) {
      throw new Error("At least two silver or gold chamber members are required for spotlights.");
    }

    spotlightList.replaceChildren(...spotlights.map(createSpotlight));
    spotlightList.setAttribute("aria-busy", "false");
  } catch (error) {
    const message = document.createElement("p");
    message.className = "load-error";
    message.setAttribute("role", "alert");
    message.textContent = "Member spotlights are temporarily unavailable.";
    spotlightList.replaceChildren(message);
    spotlightList.setAttribute("aria-busy", "false");
    console.error("Unable to load chamber member spotlights:", error);
  }
}

function displayWeatherError(message, error) {
  currentWeather.replaceChildren();
  const currentMessage = document.createElement("p");
  currentMessage.className = "weather-message";
  currentMessage.textContent = message;
  currentWeather.append(currentMessage);

  weatherForecast.replaceChildren();
  const forecastMessage = document.createElement("p");
  forecastMessage.className = "weather-message";
  forecastMessage.textContent = "The three-day forecast is unavailable.";
  weatherForecast.append(forecastMessage);

  currentWeather.setAttribute("aria-busy", "false");
  weatherForecast.setAttribute("aria-busy", "false");
  if (error) {
    console.error("Unable to load Freetown weather:", error);
  }
}

async function fetchWeather(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status}).`);
  }
  return response.json();
}

function renderCurrentWeather(data) {
  const temperature = document.createElement("p");
  temperature.className = "weather-temperature";
  temperature.append(document.createTextNode(String(Math.round(data.main.temp))));
  const unit = document.createElement("span");
  unit.textContent = "°C";
  temperature.append(unit);

  const description = document.createElement("p");
  description.className = "weather-description";
  description.textContent = data.weather[0].description;
  currentWeather.replaceChildren(temperature, description);
  currentWeather.setAttribute("aria-busy", "false");
}

function renderForecast(data) {
  const today = new Date().toISOString().slice(0, 10);
  const dailyTemperatures = new Map();

  for (const forecast of data.list) {
    const date = forecast.dt_txt.slice(0, 10);
    if (date <= today) {
      continue;
    }

    const day = dailyTemperatures.get(date) ?? {
      temperatures: [],
      description: forecast.weather[0].description
    };
    day.temperatures.push(forecast.main.temp);
    dailyTemperatures.set(date, day);
  }

  const forecastDays = [...dailyTemperatures.entries()].slice(0, 3);
  if (forecastDays.length < 3) {
    throw new Error("The weather service returned fewer than three forecast days.");
  }

  const rows = forecastDays.map(([date, day]) => {
    const row = document.createElement("div");
    row.className = "forecast-day";

    const dateLabel = document.createElement("span");
    dateLabel.textContent = new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    }).format(new Date(`${date}T12:00:00Z`));

    const description = document.createElement("span");
    description.textContent = day.description;

    const temperatures = document.createElement("strong");
    temperatures.textContent = `${Math.round(Math.min(...day.temperatures))}° / ${Math.round(Math.max(...day.temperatures))}°C`;

    row.append(dateLabel, description, temperatures);
    return row;
  });

  weatherForecast.replaceChildren(...rows);
  weatherForecast.setAttribute("aria-busy", "false");
}

async function loadWeather() {
  const apiKey = document.querySelector('meta[name="openweathermap-api-key"]').content.trim();
  if (!apiKey || apiKey === "YOUR_OPENWEATHERMAP_API_KEY") {
    displayWeatherError("Add your OpenWeatherMap API key to this page to load live conditions.");
    console.warn("Freetown weather is not configured: add an OpenWeatherMap API key to the page metadata.");
    return;
  }

  const location = "lat=8.4657&lon=-13.2317&units=metric";
  const baseUrl = "https://api.openweathermap.org/data/2.5";

  try {
    const [current, forecast] = await Promise.all([
      fetchWeather(`${baseUrl}/weather?${location}&appid=${encodeURIComponent(apiKey)}`),
      fetchWeather(`${baseUrl}/forecast?${location}&appid=${encodeURIComponent(apiKey)}`)
    ]);

    renderCurrentWeather(current);
    renderForecast(forecast);
  } catch (error) {
    displayWeatherError("Live weather is temporarily unavailable.", error);
  }
}

updateFooterDates();
loadSpotlights();
loadWeather();
