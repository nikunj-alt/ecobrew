"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WeatherData } from "@/lib/weather";

const REFRESH_MS = 15 * 60 * 1000; // refresh every 15 minutes
const STALE_MS = 5 * 60 * 1000; // refetch on window focus if older than 5 minutes

// Ask the browser for the user's current position. Resolves to null when the
// user denies permission, geolocation is unsupported, or the request times out.
function requestGeolocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  });
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const locationRef = useRef<{ lat: number; lon: number } | null>(null);
  const lastFetch = useRef(0);

  const requestLocation = useCallback(async (): Promise<{ lat: number; lon: number } | null> => {
    const loc = await requestGeolocation();
    if (loc) {
      locationRef.current = loc;
      setPermissionDenied(false);
    } else {
      setPermissionDenied(true);
    }
    return loc;
  }, []);

  const load = useCallback(
    async (force = false, coords?: { lat: number; lon: number } | null) => {
      const now = Date.now();
      if (!force && lastFetch.current && now - lastFetch.current < 60_000) return;
      lastFetch.current = now;

      let loc = coords !== undefined ? coords : locationRef.current;
      if (loc === null) loc = await requestLocation();

      const params = loc ? `?lat=${loc.lat}&lon=${loc.lon}` : "";
      try {
        const res = await fetch(`/api/weather${params}`, { cache: "no-store" });
        if (!res.ok) throw new Error("weather status not ok");
        const data = (await res.json()) as WeatherData & { updatedAt: string };
        setWeather({ ...data, updatedAt: new Date(data.updatedAt) });
        setError(null);
      } catch {
        setError("Weather unavailable");
      } finally {
        setLoading(false);
      }
    },
    [requestLocation],
  );

  useEffect(() => {
    load(true);
    const interval = setInterval(() => load(), REFRESH_MS);
    const onFocus = () => {
      if (Date.now() - lastFetch.current > STALE_MS) load();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  // Re-request the user's location (e.g. after they grant permission) and refresh.
  const refreshLocation = useCallback(async () => {
    setLoading(true);
    const loc = await requestLocation();
    await load(true, loc);
  }, [requestLocation, load]);

  return { weather, loading, error, permissionDenied, refreshLocation };
}
