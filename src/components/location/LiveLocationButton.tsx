"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { MapPinIcon, ArrowRightIcon, CheckIcon } from "@/components/icons";
import { useLiveLocation, type LiveCoords } from "@/hooks/useLiveLocation";
import { reverseGeocode, type GeocodeResult } from "@/lib/location";

type ApplyLocation = LiveCoords & GeocodeResult;

interface LiveLocationButtonProps {
  /** Called after a location is captured (and, if possible, reverse-geocoded). */
  applyTo?: (location: ApplyLocation) => void;
  /** Align the trigger + result within its container. */
  align?: "center" | "left";
  compact?: boolean;
  className?: string;
}

export default function LiveLocationButton({
  applyTo,
  align = "center",
  compact = false,
  className = "",
}: LiveLocationButtonProps) {
  const { status, coords, error, locate } = useLiveLocation();
  const [geocoding, setGeocoding] = useState(false);

  const busy = status === "locating" || geocoding;

  const handleClick = async () => {
    const point = await locate();
    if (!point || !applyTo) return;

    setGeocoding(true);
    try {
      const geo = await reverseGeocode(point.latitude, point.longitude);
      applyTo({ ...point, ...geo });
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start text-left"} ${className}`}
    >
      <Button
        onClick={handleClick}
        disabled={busy}
        size={compact ? "sm" : "lg"}
      >
        {busy ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            {status === "locating" ? "Locating…" : "Finding your address…"}
          </>
        ) : (
          <>
            <MapPinIcon className="h-5 w-5" />
            Use my live location
          </>
        )}
      </Button>

      {status === "error" && <p className="text-sm text-red-600">{error}</p>}

      {coords && status !== "error" && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckIcon className="h-3.5 w-3.5" />
            {status === "success" ? "Location captured" : "Location saved"}
          </span>
          <span className="font-mono text-xs text-leaf-deep">
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-leaf-deep transition-colors hover:text-tea"
          >
            Open in Maps
            <ArrowRightIcon className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
