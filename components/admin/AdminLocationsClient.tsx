"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Location {
  id: string;
  name: string;
  slug: string;
  continent: string;
  country: string | null;
  state: string | null;
  city: string | null;
  hasItinerary: boolean;
  mapCode: string | null;
  parentId: string | null;
  _count: { itineraries: number };
}

const CONTINENTS = [
  { value: "north-america", label: "North America" },
  { value: "south-america", label: "South America" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "australia", label: "Australia & Oceania" },
];

export default function AdminLocationsClient({ locations: initial }: { locations: Location[] }) {
  const router = useRouter();
  const [locations, setLocations] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", continent: "", country: "", state: "", city: "",
    parentId: "", mapCode: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    setLoading(true);
    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const loc = await res.json();
    setLocations([...locations, { ...loc, _count: { itineraries: 0 } }]);
    setForm({ name: "", slug: "", continent: "", country: "", state: "", city: "", parentId: "", mapCode: "" });
    setShowForm(false);
    setLoading(false);
    router.refresh();
  };

  const grouped = CONTINENTS.map((c) => ({
    ...c,
    locs: locations.filter((l) => l.continent === c.value),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Locations</h1>
          <p className="text-stone-500 text-sm">{locations.length} destinations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />Add Location
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="mb-6 border-sage-200">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-stone-800">New Location</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="New York City" className="mt-1" />
              </div>
              <div>
                <Label>Continent *</Label>
                <Select value={form.continent} onValueChange={(v) => set("continent", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CONTINENTS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="USA" className="mt-1" />
              </div>
              <div>
                <Label>State / Province</Label>
                <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="New York" className="mt-1" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="New York City" className="mt-1" />
              </div>
              <div>
                <Label>Map Code (ISO)</Label>
                <Input value={form.mapCode} onChange={(e) => set("mapCode", e.target.value)} placeholder="US" className="mt-1" />
              </div>
              <div>
                <Label>Slug (auto-generated if blank)</Label>
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="new-york-city" className="mt-1" />
              </div>
              <div>
                <Label>Parent Location</Label>
                <Select value={form.parentId} onValueChange={(v) => set("parentId", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="None (top level)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (top level)</SelectItem>
                    {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading || !form.name || !form.continent}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Location
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grouped locations */}
      {grouped.map(({ label, value, locs }) => (
        locs.length > 0 && (
          <div key={value} className="mb-6">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">{label}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {locs.map((loc) => (
                <Card key={loc.id} className="hover:border-sage-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-sage-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-stone-900 text-sm">{loc.name}</p>
                          {loc.country && <p className="text-xs text-stone-400">{loc.country}</p>}
                          {loc.mapCode && <p className="text-xs text-stone-400">Code: {loc.mapCode}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {loc.hasItinerary ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500"  />
                        ) : (
                          <XCircle className="h-4 w-4 text-stone-300"  />
                        )}
                        <span className="text-xs text-stone-400">{loc._count.itineraries}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
