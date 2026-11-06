"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type LanguageCode = "en" | "hi" | "bn" | "te" | "mr" | "ta" | "gu" | "kn";

export interface AppSettings {
  theme: "light" | "dark";
  language: LanguageCode;
  animations: boolean;
  compactLayout: boolean;
  largerText: boolean;
  highContrast: boolean;
  sidebarCollapsed: boolean;
  useLocation: boolean;
  locationName: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  language: "en",
  animations: true,
  compactLayout: false,
  largerText: false,
  highContrast: false,
  sidebarCollapsed: false,
  useLocation: true,
  locationName: "Indore",
};

interface AppSettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetDefaults: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Load from localStorage on mount scheduled via microtask
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const stored = localStorage.getItem("ecobrew_settings");
        if (stored) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
        }
      } catch {
        // ignore
      }
    });
  }, []);

  // Sync html root classes for theme, high contrast, text size
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    if (settings.largerText) {
      root.classList.add("larger-text");
    } else {
      root.classList.remove("larger-text");
    }

    try {
      localStorage.setItem("ecobrew_settings", JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Global keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetDefaults,
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
        isSearchOpen,
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context;
}
