import { useEffect, useState } from "react";
import api from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatMoney, formatQty } from "../lib/format";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { BarChart3, TrendingUp, TrendingDown, Coins, Factory, Trash2 } from "lucide-react";
import { toast } from "sonner";

function Kpi({ label, value, icon: Icon, hint, tone = "default", testid }) {
  return (
    <Card data-testid={testid} className="border">
      <CardContent className="p-5 lg:p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
            {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tone === "brand" ? "brand-bg-light brand-text" : tone === "good" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : tone === "bad" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MarginBadge({ pct }) {
  const n = Number(pct) || 0;
  if (n >= 60) return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400">{n.toFixed(1)}%</Badge>;
  if (n >= 30) return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400">{n.toFixed(1)}%</Badge>;
  if (n > 0) return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-400">{n.toFixed(1)}%</Badge>;
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400">{n.toFixed(1)}%</Badge>;
}

export default function BatchReport() {
  const { settings } = useApp();
  const [runs, setRuns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [r, s] = await Promise.all([api.get("/batch-runs"), api.get("/batch-runs/summary")]);
      setRuns(r.data); setSummary(s.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const money = (v) => formatMoney(v, settings.currency, settings.currency_symbol);

  const remove = async (run) => {
    if (!confirm(`Delete this batch run record?`)) return;
    await api.delete(`/batch-runs/${run.id}`); toast.success("Run deleted"); load();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Analytics</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Batch Cost Report</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Every batch you produce is tracked with ingredient cost, revenue potential, and margin.</p>
      </div>

      {loading ? <div className="text-muted-foreground text-sm">Loading…</div> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Kpi testid="kpi-total-batches" label="Batch Runs" value={summary?.total_runs ?? 0} icon={Factory} hint={`${formatQty(summary?.total_output ?? 0)} units produced`} tone="brand" />
            <Kpi testid="kpi-total-cost" label="Production Cost" value={money(summary?.total_cost ?? 0)} icon={Coins} hint="Raw ingredients consumed" />
            <Kpi testid="kpi-total-revenue" label="Revenue Potential" value={money(summary?.total_revenue ?? 0)} icon={BarChart3} hint="At current sale prices" />
            <Kpi testid="kpi-total-margin" label="Total Margin" value={money(summary?.total_margin ?? 0)} icon={(summary?.total_margin ?? 0) >= 0 ? TrendingUp : TrendingDown} hint={`Avg ${(summary?.avg_margin_percent ?? 0).toFixed(1)}%`} tone={(summary?.total_margin ?? 0) >= 0 ? "good" : "bad"} />
          </div>

          <Tabs defaultValue="runs" className="w-full">
            <TabsList data-testid="report-tabs" className="mb-6">
              <TabsTrigger value="runs" data-testid="tab-runs">All Runs</TabsTrigger>
              <TabsTrigger value="by-recipe" data-testid="tab-by-recipe">By Recipe</TabsTrigger>
            </TabsList>

            <TabsContent value="runs"><Card><CardContent className="p-4 lg:p-6">
              {runs.length === 0 ? <div className="text-center py-16 text-muted-foreground text-sm">No batches produced yet.</div> : (
                <div className="overflow-x-auto"><Table data-testid="runs-table">
                  <TableHeader><TableRow>
                    <TableHead>Date</TableHead><TableHead>Recipe</TableHead><TableHead className="text-right">Batches</TableHead>
                    <TableHead className="text-right">Output</TableHead><TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead><TableHead className="text-right">Sale Price</TableHead>
                    <TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Margin</TableHead>
                    <TableHead>Margin %</TableHead><TableHead className="w-8"></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>{runs.map((r) => (
                    <TableRow key={r.id} data-testid={`run-row-${r.id}`}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell><div className="font-medium text-sm">{r.recipe_name}</div><div className="text-xs text-muted-foreground">→ {r.output_product_name}</div></TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatQty(r.batches)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatQty(r.output_quantity)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{money(r.ingredient_cost)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{money(r.unit_cost)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{money(r.sale_price)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{money(r.revenue_potential)}</TableCell>
                      <TableCell className={`text-right font-mono text-xs font-semibold ${r.margin_amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{money(r.margin_amount)}</TableCell>
                      <TableCell><MarginBadge pct={r.margin_percent} /></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => remove(r)} data-testid={`run-delete-${r.id}`}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table></div>
              )}
            </CardContent></Card></TabsContent>

            <TabsContent value="by-recipe"><Card><CardContent className="p-4 lg:p-6">
              {(summary?.by_recipe?.length || 0) === 0 ? <div className="text-center py-16 text-muted-foreground text-sm">No batches produced yet.</div> : (
                <div className="overflow-x-auto"><Table data-testid="by-recipe-table">
                  <TableHeader><TableRow>
                    <TableHead>Recipe</TableHead><TableHead className="text-right">Runs</TableHead>
                    <TableHead className="text-right">Batches</TableHead><TableHead className="text-right">Output</TableHead>
                    <TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Margin</TableHead><TableHead>Margin %</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>{summary.by_recipe.sort((a, b) => b.margin_amount - a.margin_amount).map((row) => (
                    <TableRow key={row.recipe_id} data-testid={`by-recipe-row-${row.recipe_id}`}>
                      <TableCell><div className="font-medium text-sm">{row.recipe_name}</div><div className="text-xs text-muted-foreground">→ {row.output_product_name}</div></TableCell>
                      <TableCell className="text-right font-mono text-xs">{row.runs}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatQty(row.batches)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatQty(row.output_quantity)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{money(row.ingredient_cost)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{money(row.revenue_potential)}</TableCell>
                      <TableCell className={`text-right font-mono text-xs font-semibold ${row.margin_amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{money(row.margin_amount)}</TableCell>
                      <TableCell><MarginBadge pct={row.margin_percent} /></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table></div>
              )}
            </CardContent></Card></TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
