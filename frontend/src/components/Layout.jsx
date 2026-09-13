import Sidebar from "./Sidebar";
import { Outlet, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard, Package, Truck, FileText, ChefHat, BarChart3, Settings as SettingsIcon,
  Sun, Moon,
} from "lucide-react";

const mobileLinks = [
  { to: "/", label: "Dash", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/purchase-orders", label: "POs", icon: FileText },
  { to: "/recipes", label: "Recipes", icon: ChefHat },
  { to: "/reports", label: "Report", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Layout() {
  const { settings, theme, toggleTheme } = useApp();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 border-b bg-card/80 backdrop-blur px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="logo" className="h-7 w-7 rounded object-cover" />
            ) : (
              <div className="h-7 w-7 rounded brand-btn flex items-center justify-center text-white text-sm font-bold">
                {(settings.company_name || "C").slice(0, 1)}
              </div>
            )}
            <span className="font-semibold text-sm">{settings.company_name}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted"
            data-testid="theme-toggle-button-mobile"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>

        <main className="flex-1 pb-20 lg:pb-10">
          <Outlet />
        </main>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 border-t bg-card/95 backdrop-blur z-40 grid grid-cols-7">
          {mobileLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                  isActive ? "brand-text" : "text-muted-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
