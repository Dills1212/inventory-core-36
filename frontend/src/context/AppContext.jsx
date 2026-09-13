import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import { hexToRgba, darkenHex } from "../lib/format";

const AppContext = createContext(null);

const CURRENCIES = {
  AUD: "$", USD: "$", EUR: "€", GBP: "£", NZD: "$", CAD: "$", JPY: "¥", INR: "₹",
};

function applyBrandColor(hex) {
  const root = document.documentElement;
  root.style.setProperty("--brand-primary", hex);
  root.style.setProperty("--brand-primary-hover", darkenHex(hex, 0.15));
  root.style.setProperty("--brand-primary-light", hexToRgba(hex, 0.12));
}

function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState({
    company_name: "CraftStock",
    logo_url: "",
    primary_color: "#D97706",
    currency: "AUD",
    currency_symbol: "$",
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("cs-theme") || "light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("cs-theme", theme);
  }, [theme]);

  const refreshSettings = useCallback(async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings(data);
      applyBrandColor(data.primary_color || "#D97706");
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const saveSettings = async (patch) => {
    const next = { ...settings, ...patch };
    if (patch.currency && CURRENCIES[patch.currency]) {
      next.currency_symbol = CURRENCIES[patch.currency];
    }
    const { data } = await api.put("/settings", next);
    setSettings(data);
    applyBrandColor(data.primary_color || "#D97706");
    return data;
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <AppContext.Provider
      value={{ settings, saveSettings, refreshSettings, theme, setTheme, toggleTheme, loaded }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export const CURRENCY_OPTIONS = Object.keys(CURRENCIES);
