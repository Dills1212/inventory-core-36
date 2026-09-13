import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  Package,
  Truck,
  FileText,
  ChefHat,
  BarChart3,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, testid: "nav-link-dashboard", end: true },
  { to: "/products", label: "Products", icon: Package, testid: "nav-link-products" },
  { to: "/suppliers", label: "Suppliers", icon: Truck, testid: "nav-link-suppliers" },
  { to: "/purchase-orders", label: "Purchase Orders", icon: FileText, testid: "nav-link-purchase-orders" },
  { to: "/recipes", label: "Recipes / BOM", icon: ChefHat, testid: "nav-link-recipes" },
  { to: "/reports", label: "Batch Report", icon: BarChart3, testid: "nav-link-reports" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testid: "nav-link-settings" },
];

export default function Sidebar() {
  const { settings, theme, toggleTheme } = useApp();

  return (
    <aside
      data-testid="sidebar-container"
      className="hidden lg:flex flex-col w-64 shrink-0 border-r bg-card min-h-screen sticky top-0"
    >
      <div className="px-6 py-6 border-b flex items-center gap-3">
        {settings.logo_url ? (
          <img
            data-testid="sidebar-brand-logo"
            src={settings.logo_url}
            alt="logo"
            className="h-9 w-9 rounded-md object-cover ring-1 ring-border"
          />
        ) : (
          <div
            data-testid="sidebar-brand-logo"
            className="h-9 w-9 rounded-md brand-btn flex items-center justify-center text-white font-bold"
          >
            {(settings.company_name || "C").slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <div data-testid="sidebar-brand-name" className="font-semibold tracking-tight text-sm truncate">
            {settings.company_name || "CraftStock"}
          </div>
          <div className="text-xs text-muted-foreground">Inventory Lite</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon, testid, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            data-testid={testid}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "brand-bg-light brand-text font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t">
        <button
          data-testid="theme-toggle-button"
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
    </aside>
  );
}
