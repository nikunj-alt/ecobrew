// Real live weather for Indore from Open-Meteo (free, no API key required).
// - Current conditions + 7-day daily forecast: api.open-meteo.com
// - Current air quality (US AQI): air-quality-api.open-meteo.com

export interface DailyForecast {
  day: string;
  date: string;
  condition: string;
  icon: string;
  high: number;
  low: number;
  rainMm: number;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windKmh: number;
  precipitationMm: number;
  cloudCover: number;
  isDay: boolean;
  condition: string;
  icon: string;
}

export interface WeatherData {
  city: string;
  updatedAt: Date;
  current: CurrentWeather | null;
  daily: DailyForecast[];
  aqi: number | null;
}

const DEFAULT_LAT = 22.7196;
const DEFAULT_LON = 75.8577; // Indore, Madhya Pradesh

interface WmoInfo {
  label: string;
  icon: string;
}

// Map WMO weather codes to friendly labels + emoji.
export function wmoInfo(code: number, isDay = true): WmoInfo {
  switch (code) {
    case 0:
      return { label: "Clear sky", icon: isDay ? "☀️" : "🌙" };
    case 1:
      return { label: "Mainly clear", icon: isDay ? "🌤️" : "🌙" };
    case 2:
      return { label: "Partly cloudy", icon: "⛅" };
    case 3:
      return { label: "Overcast", icon: "☁️" };
    case 45:
    case 48:
      return { label: "Fog", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { label: "Drizzle", icon: "🌦️" };
    case 56:
    case 57:
      return { label: "Freezing drizzle", icon: "🌧️" };
    case 61:
    case 63:
    case 65:
      return { label: "Rain", icon: "🌧️" };
    case 66:
    case 67:
      return { label: "Freezing rain", icon: "🌧️" };
    case 71:
    case 73:
    case 75:
      return { label: "Snow", icon: "🌨️" };
    case 77:
      return { label: "Snow grains", icon: "🌨️" };
    case 80:
    case 81:
    case 82:
      return { label: "Rain showers", icon: "🌧️" };
    case 85:
    case 86:
      return { label: "Snow showers", icon: "🌨️" };
    case 95:
    case 96:
    case 99:
      return { label: "Thunderstorm", icon: "⛈️" };
    default:
      return { label: "Unknown", icon: "🌡️" };
  }
}

async function getJSON(url: string): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

// Reverse-geocode a coordinate pair into a friendly "City, Country" label using
// OpenStreetMap's Nominatim. Returns null if it fails (we fall back to a generic
// label). Free, no API key required.
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&accept-language=en`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "EcoBrew/1.0 (https://ecobrew-live.vercel.app)" },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { address?: Record<string, string> };
      const a = data.address ?? {};
      const town = a.city || a.town || a.village || a.county || a.state_district;
      const state = a.state;
      const country = a.country;
      if (town && country) return `${town}, ${country}`;
      if (town && state) return `${town}, ${state}`;
      if (town) return town;
      if (state && country) return `${state}, ${country}`;
      return null;
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}

export async function fetchWeather(lat?: number, lon?: number): Promise<WeatherData> {
  const useLat = typeof lat === "number" && Number.isFinite(lat) ? lat : DEFAULT_LAT;
  const useLon = typeof lon === "number" && Number.isFinite(lon) ? lon : DEFAULT_LON;

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${useLat}&longitude=${useLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,cloud_cover,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&forecast_days=7&timezone=Asia%2FKolkata`;

  const [fc, aq] = await Promise.all([
    getJSON(forecastUrl),
    getJSON(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${useLat}&longitude=${useLon}&current=us_aqi`,
    ).catch(() => null),
  ]);

  const c = (fc.current ?? {}) as Record<string, unknown>;
  const d = (fc.daily ?? {}) as Record<string, unknown>;

  const currentCode = Number(c.weather_code ?? 0);
  const isDay = Number(c.is_day ?? 1) === 1;
  const info = wmoInfo(currentCode, isDay);

  const current: CurrentWeather = {
    temp: Number(c.temperature_2m ?? 0),
    feelsLike: Number(c.apparent_temperature ?? c.temperature_2m ?? 0),
    humidity: Number(c.relative_humidity_2m ?? 0),
    windKmh: Number(c.wind_speed_10m ?? 0),
    precipitationMm: Number(c.precipitation ?? 0),
    cloudCover: Number(c.cloud_cover ?? 0),
    isDay,
    condition: info.label,
    icon: info.icon,
  };

  const times = (d.time ?? []) as string[];
  const codes = (d.weather_code ?? []) as number[];
  const highs = (d.temperature_2m_max ?? []) as number[];
  const lows = (d.temperature_2m_min ?? []) as number[];
  const rains = (d.precipitation_sum ?? []) as number[];

  const daily: DailyForecast[] = times.map((iso, i) => {
    const date = new Date(`${iso}T00:00:00`);
    const fi = wmoInfo(Number(codes[i] ?? 0));
    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      condition: fi.label,
      icon: fi.icon,
      high: Math.round(Number(highs[i] ?? 0)),
      low: Math.round(Number(lows[i] ?? 0)),
      rainMm: Number(rains[i] ?? 0),
    };
  });

  const aqi = aq && typeof aq.current === "object" && aq.current !== null
    ? Number((aq.current as Record<string, unknown>).us_aqi ?? null)
    : null;

  let cityName = "Indore, India";
  if (typeof lat === "number" && typeof lon === "number") {
    cityName = (await reverseGeocode(useLat, useLon)) ?? "Your location";
  }

  return { city: cityName, updatedAt: new Date(), current, daily, aqi };
}
