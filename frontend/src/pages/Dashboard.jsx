import { useEffect, useState } from "react";
import api from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatMoney, formatQty } from "../lib/format";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Package, TrendingUp, AlertTriangle, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function Kpi({ label, value, icon: Icon, hint, testid, tone = "default" }) {
  return (
    <Card data-testid={testid} className="border">
      <CardContent className="p-5 lg:p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
            {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tone === "brand" ? "brand-bg-light brand-text" : "bg-muted text-muted-foreground"}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { settings } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/dashboard/stats");
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const seed = async () => {
    if (!confirm("Load sample artisan data? This will replace all current data.")) return;
    try {
      await api.post("/seed");
      toast.success("Sample data loaded");
      load();
    } catch (e) {
      toast.error("Seed failed");
    }
  };

  const money = (v) => formatMoney(v, settings.currency, settings.currency_symbol);

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            {settings.company_name} — Overview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            A tactile view of your batches, raw stock and open supplier orders. Craft with confidence.
          </p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="seed-data-button" variant="outline" onClick={seed}>
            <Sparkles className="h-4 w-4 mr-2" /> Load Sample Data
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Kpi
              testid="kpi-card-total-products"
              label="Total SKUs"
              value={stats?.total_products ?? 0}
              icon={Package}
              hint="Across raw materials & finished goods"
              tone="brand"
            />
            <Kpi
              testid="kpi-card-stock-value"
              label="Stock Value (cost)"
              value={money(stats?.stock_value ?? 0)}
              icon={TrendingUp}
              hint={`Retail: ${money(stats?.retail_value ?? 0)}`}
            />
            <Kpi
              testid="kpi-card-low-stock-count"
              label="Low Stock"
              value={stats?.low_stock_count ?? 0}
              icon={AlertTriangle}
              hint="Items at or below reorder point"
            />
            <Kpi
              testid="kpi-card-pending-pos"
              label="Open POs"
              value={stats?.pending_pos ?? 0}
              icon={FileText}
              hint="Draft / Sent / Partial"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="dashboard-low-stock-panel">
              <CardContent className="p-5 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Reorder Alerts</h2>
                  <Link to="/products" className="text-xs brand-text hover:underline">Manage products →</Link>
                </div>
                {stats?.low_stock_items?.length ? (
                  <ul className="divide-y">
                    {stats.low_stock_items.slice(0, 8).map((p) => (
                      <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-300 dark:border-orange-800 dark:text-orange-400">
                          {formatQty(p.stock_on_hand)} / {formatQty(p.reorder_point)} {p.unit}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground py-6">Everything looks well-stocked. Nice work.</div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="dashboard-recent-pos-panel">
              <CardContent className="p-5 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Purchase Orders</h2>
                  <Link to="/purchase-orders" className="text-xs brand-text hover:underline">View all →</Link>
                </div>
                {stats?.recent_pos?.length ? (
                  <ul className="divide-y">
                    {stats.recent_pos.map((po) => (
                      <li key={po.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-sm">
                            <span className="font-mono">{po.po_number}</span> · {po.supplier_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{new Date(po.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{money(po.total)}</div>
                          <Badge variant="outline" className="mt-1 capitalize text-xs">{po.status}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground py-6">No purchase orders yet.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
