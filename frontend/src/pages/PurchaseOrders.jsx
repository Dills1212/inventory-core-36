import { useEffect, useState } from "react";
import api from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatMoney, formatQty } from "../lib/format";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { Plus, PackageCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  received: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default function PurchaseOrders() {
  const { settings } = useApp();
  const [pos, setPos] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [notes, setNotes] = useState("");

  const load = async () => {
    const [p, s, o] = await Promise.all([
      api.get("/products"), api.get("/suppliers"), api.get("/purchase-orders"),
    ]);
    setProducts(p.data); setSuppliers(s.data); setPos(o.data);
  };
  useEffect(() => { load(); }, []);

  const money = (v) => formatMoney(v, settings.currency, settings.currency_symbol);

  const addLine = () => {
    if (!products.length) return;
    const first = products.find((p) => p.type === "raw") || products[0];
    setLineItems([...lineItems, { product_id: first.id, product_name: first.name, quantity: 1, unit_cost: first.cost_price || 0, unit: first.unit }]);
  };

  const updateLine = (idx, patch) => {
    const next = [...lineItems];
    next[idx] = { ...next[idx], ...patch };
    if (patch.product_id) {
      const p = products.find((pp) => pp.id === patch.product_id);
      if (p) { next[idx].product_name = p.name; next[idx].unit = p.unit; next[idx].unit_cost = p.cost_price; }
    }
    setLineItems(next);
  };

  const removeLine = (idx) => setLineItems(lineItems.filter((_, i) => i !== idx));
  const totalPreview = lineItems.reduce((sum, li) => sum + Number(li.quantity || 0) * Number(li.unit_cost || 0), 0);

  const openCreate = () => { setSupplierId(""); setLineItems([]); setNotes(""); setOpen(true); };

  const createPO = async () => {
    if (!supplierId) { toast.error("Select a supplier"); return; }
    if (!lineItems.length) { toast.error("Add at least one line item"); return; }
    try {
      await api.post("/purchase-orders", {
        supplier_id: supplierId,
        line_items: lineItems.map((li) => ({ product_id: li.product_id, product_name: li.product_name, quantity: Number(li.quantity) || 0, unit_cost: Number(li.unit_cost) || 0, unit: li.unit })),
        notes, status: "draft",
      });
      toast.success("PO created"); setOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Create failed"); }
  };

  const receive = async (po) => {
    if (!confirm(`Receive stock for ${po.po_number}?`)) return;
    try { await api.post(`/purchase-orders/${po.id}/receive`); toast.success("Stock received"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const setStatus = async (po, status) => { await api.patch(`/purchase-orders/${po.id}/status`, { status }); load(); };
  const remove = async (po) => { if (!confirm(`Delete ${po.po_number}?`)) return; await api.delete(`/purchase-orders/${po.id}`); load(); };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Procurement</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-2">Draft, send, and receive stock from suppliers.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="po-create-button" className="brand-btn text-white hover:text-white" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Supplier</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger data-testid="po-supplier-select"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Line items</Label>
                  <Button size="sm" variant="outline" data-testid="po-add-line-item-button" onClick={addLine}><Plus className="h-3.5 w-3.5 mr-1" /> Add item</Button>
                </div>
                {lineItems.length === 0 && <div className="text-xs text-muted-foreground py-4 border rounded-md text-center">No items yet.</div>}
                <div className="space-y-2">
                  {lineItems.map((li, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Select value={li.product_id} onValueChange={(v) => updateLine(idx, { product_id: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2"><Input type="number" step="0.01" placeholder="Qty" value={li.quantity} onChange={(e) => updateLine(idx, { quantity: e.target.value })} /></div>
                      <div className="col-span-1 text-xs text-muted-foreground text-center">{li.unit}</div>
                      <div className="col-span-3"><Input type="number" step="0.01" placeholder="Unit cost" value={li.unit_cost} onChange={(e) => updateLine(idx, { unit_cost: e.target.value })} /></div>
                      <div className="col-span-1 text-right"><Button variant="ghost" size="icon" onClick={() => removeLine(idx)}><X className="h-4 w-4" /></Button></div>
                    </div>
                  ))}
                </div>
                {lineItems.length > 0 && <div className="mt-3 text-right text-sm">Total: <span className="font-semibold">{money(totalPreview)}</span></div>}
              </div>
              <div><Label>Notes</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button data-testid="po-submit-button" className="brand-btn text-white hover:text-white" onClick={createPO}>Create PO</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="p-4 lg:p-6"><div className="overflow-x-auto">
        <Table data-testid="purchase-orders-table">
          <TableHeader><TableRow>
            <TableHead>PO #</TableHead><TableHead>Supplier</TableHead><TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead>
            <TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {pos.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No purchase orders yet.</TableCell></TableRow>
            ) : pos.map((po) => (
              <TableRow key={po.id} data-testid={`po-row-${po.po_number}`}>
                <TableCell className="font-mono text-xs">{po.po_number}</TableCell>
                <TableCell>{po.supplier_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{po.line_items.length} item{po.line_items.length !== 1 ? "s" : ""}</TableCell>
                <TableCell className="text-right font-mono text-xs">{money(po.total)}</TableCell>
                <TableCell>
                  <Select value={po.status} onValueChange={(v) => setStatus(po, v)}>
                    <SelectTrigger data-testid={`po-status-${po.po_number}`} className={`h-7 w-32 text-xs capitalize ${STATUS_COLORS[po.status] || ""}`}><SelectValue /></SelectTrigger>
                    <SelectContent>{["draft","sent","partial","received","cancelled"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(po.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right"><div className="flex gap-1 justify-end">
                  {po.status !== "received" && po.status !== "cancelled" && (
                    <Button size="sm" variant="outline" data-testid={`po-receive-${po.po_number}`} onClick={() => receive(po)}><PackageCheck className="h-3.5 w-3.5 mr-1" /> Receive</Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => remove(po)}><Trash2 className="h-4 w-4" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div></CardContent></Card>
    </div>
  );
}
