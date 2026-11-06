"use client";

import { useCallback, useState } from "react";

export interface LiveCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export type LocationStatus = "idle" | "locating" | "success" | "error";

const STORAGE_KEY = "ecobrew_live_location";

function readStored(): LiveCoords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LiveCoords>;
    if (
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number" &&
      typeof parsed.accuracy === "number"
    ) {
      return parsed as LiveCoords;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

/** Reads the last saved live location (or null if none is stored yet). */
export function getSavedLiveLocation(): LiveCoords | null {
  return readStored();
}

/**
 * Fetches the device's live location via the browser Geolocation API and
 * persists it to localStorage so it can be reused across the app (checkout,
 * sign-up, find-us) without asking for permission again.
 */
export function useLiveLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<LiveCoords | null>(() => readStored());
  const [error, setError] = useState("");

  const locate = useCallback((): Promise<LiveCoords | null> => {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
        setStatus("error");
        setError("Geolocation isn't supported on this device.");
        resolve(null);
        return;
      }

      setStatus("locating");
      setError("");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next: LiveCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: Date.now(),
          };
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            /* ignore quota/private-mode errors */
          }
          setCoords(next);
          setStatus("success");
          resolve(next);
        },
        (err) => {
          setStatus("error");
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError("Location permission was denied. Allow it in your browser settings and try again.");
              break;
            case err.POSITION_UNAVAILABLE:
              setError("Your location isn't available right now.");
              break;
            case err.TIMEOUT:
              setError("The location request timed out. Please try again.");
              break;
            default:
              setError("Couldn't fetch your location.");
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setCoords(null);
    setStatus("idle");
    setError("");
  }, []);

  return { status, coords, error, locate, clear };
}
