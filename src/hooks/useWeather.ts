"use client";

import { useEffect, useRef, useState } from "react";
import { fetchWeather, type WeatherData } from "@/lib/weather";

const REFRESH_MS = 15 * 60 * 1000; // refresh every 15 minutes
const STALE_MS = 5 * 60 * 1000; // refetch on window focus if older than 5 minutes

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetch = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const load = async (force = false) => {
      const now = Date.now();
      if (!force && lastFetch.current && now - lastFetch.current < 60_000) return;
      lastFetch.current = now;
      try {
        const data = await fetchWeather();
        if (cancelled) return;
        setWeather(data);
        setError(null);
      } catch {
        if (cancelled) return;
        setError("Weather unavailable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load(true);

    const interval = setInterval(() => load(), REFRESH_MS);

    const onFocus = () => {
      if (Date.now() - lastFetch.current > STALE_MS) load();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return { weather, loading, error };
}
