import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "../components/ui/textarea";

const empty = { name: "", contact_name: "", email: "", phone: "", address: "", notes: "" };

export default function Suppliers() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await api.get("/suppliers");
    setRows(data);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...empty, ...s }); setOpen(true); };

  const save = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    try {
      if (editing) await api.put(`/suppliers/${editing.id}`, form);
      else await api.post("/suppliers", form);
      toast.success(editing ? "Supplier updated" : "Supplier added");
      setOpen(false); load();
    } catch (e) { toast.error("Save failed"); }
  };

  const remove = async (s) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    await api.delete(`/suppliers/${s.id}`); toast.success("Deleted"); load();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Sourcing</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-2">Your trusted growers, packers and wholesalers.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="supplier-create-button" className="brand-btn text-white hover:text-white" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> New Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Supplier" : "New Supplier"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label>Name</Label>
                <Input data-testid="supplier-form-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact</Label>
                  <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input data-testid="supplier-form-email-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button data-testid="supplier-form-submit-button" className="brand-btn text-white hover:text-white" onClick={save}>
                {editing ? "Save changes" : "Create supplier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="overflow-x-auto">
            <Table data-testid="suppliers-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No suppliers yet.</TableCell></TableRow>
                ) : rows.map((s) => (
                  <TableRow key={s.id} data-testid={`supplier-row-${s.id}`}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.contact_name || "—"}</TableCell>
                    <TableCell className="text-xs">{s.email || "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{s.phone || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.address || "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(s)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => remove(s)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
