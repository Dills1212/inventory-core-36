import { useEffect, useState } from "react";
import { useApp, CURRENCY_OPTIONS } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sun, Moon, Palette } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  { name: "Copper", hex: "#D97706" },
  { name: "Hot Honey", hex: "#E11D48" },
  { name: "Botanical Sage", hex: "#059669" },
  { name: "Deep Indigo", hex: "#4F46E5" },
  { name: "Nightshade", hex: "#7C3AED" },
  { name: "Slate Blue", hex: "#2563EB" },
  { name: "Charcoal", hex: "#1F2937" },
];

export default function Settings() {
  const { settings, saveSettings, theme, setTheme } = useApp();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      await saveSettings(form);
      toast.success("Settings saved");
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Configuration</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">White-label your inventory tool.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Branding</h2>
              <p className="text-xs text-muted-foreground mt-1">Company name, logo, currency.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company name</Label>
                <Input
                  data-testid="settings-brand-name-input"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input
                  data-testid="settings-logo-url-input"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder="https://…/logo.png"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger data-testid="settings-currency-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Currency symbol</Label>
                <Input
                  data-testid="settings-symbol-input"
                  value={form.currency_symbol}
                  onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4" /> Brand color
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Applied across buttons, links, and active states.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {PRESETS.map((p) => (
                <button
                  key={p.hex}
                  data-testid={`brand-preset-${p.hex.replace('#','')}`}
                  onClick={() => setForm({ ...form, primary_color: p.hex })}
                  className={`h-11 w-11 rounded-full ring-2 transition-transform hover:scale-110 ${form.primary_color === p.hex ? "ring-foreground" : "ring-transparent"}`}
                  style={{ backgroundColor: p.hex }}
                  title={p.name}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="hex-color">Custom hex</Label>
              <input
                id="hex-color"
                data-testid="settings-brand-color-picker"
                type="color"
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                className="h-10 w-14 rounded border cursor-pointer"
              />
              <Input
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                className="w-32 font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Appearance</h2>
              <p className="text-xs text-muted-foreground mt-1">Toggle light or dark mode.</p>
            </div>
            <div className="flex gap-3">
              <button
                data-testid="theme-light-button"
                onClick={() => setTheme("light")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${theme === "light" ? "brand-border brand-text" : "hover:bg-muted"}`}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                data-testid="theme-dark-button"
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${theme === "dark" ? "brand-border brand-text" : "hover:bg-muted"}`}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button data-testid="settings-save-button" className="brand-btn text-white hover:text-white" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
