"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Trash2, Save, Eye, EyeOff, GripVertical, Clock, MapPin,
  Loader2, ChevronDown, ChevronUp, CheckCircle2, Utensils, Camera,
  Mountain, Building2, Coffee, Plane as PlaneIcon
} from "lucide-react";

interface Activity {
  id?: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  location: string;
  type: string;
  tips: string;
  order: number;
}

interface Day {
  id?: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: Activity[];
  collapsed: boolean;
}

interface Location { id: string; name: string; continent: string }
interface Category { id: string; name: string }

interface ItineraryData {
  id?: string;
  title: string;
  summary: string;
  price: string;
  duration: string;
  locationId: string;
  categoryId: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  published: boolean;
  days: Day[];
}

const ACTIVITY_TYPES = [
  { value: "attraction", label: "Attraction", icon: Camera },
  { value: "restaurant", label: "Restaurant", icon: Utensils },
  { value: "outdoors", label: "Outdoors", icon: Mountain },
  { value: "accommodation", label: "Accommodation", icon: Building2 },
  { value: "transport", label: "Transport", icon: PlaneIcon },
  { value: "break", label: "Break / Leisure", icon: Coffee },
];

function newActivity(order: number): Activity {
  return { startTime: "09:00", endTime: "10:00", title: "", description: "", location: "", type: "attraction", tips: "", order };
}

function newDay(num: number): Day {
  return { dayNumber: num, title: `Day ${num}`, description: "", activities: [newActivity(0)], collapsed: false };
}

interface Props {
  locations: Location[];
  categories: Category[];
  initialData?: ItineraryData;
}

export default function ItineraryEditor({ locations, categories, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ItineraryData>(
    initialData ?? {
      title: "", summary: "", price: "", duration: "3", locationId: "",
      categoryId: "", highlights: [""], includes: [""], excludes: [""],
      published: false, days: [newDay(1), newDay(2), newDay(3)],
    }
  );
  const [activeTab, setActiveTab] = useState<"details" | "days">("details");

  const setField = useCallback(<K extends keyof ItineraryData>(k: K, v: ItineraryData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
  }, []);

  // Duration sync with days
  const handleDurationChange = (val: string) => {
    const num = parseInt(val) || 1;
    setField("duration", val);
    setData((d) => {
      const current = d.days.length;
      if (num > current) {
        const newDays = [...d.days];
        for (let i = current + 1; i <= num; i++) newDays.push(newDay(i));
        return { ...d, duration: val, days: newDays };
      } else if (num < current) {
        return { ...d, duration: val, days: d.days.slice(0, num) };
      }
      return { ...d, duration: val };
    });
  };

  // List field helpers
  const updateListItem = (field: "highlights" | "includes" | "excludes", i: number, val: string) => {
    setData((d) => {
      const arr = [...d[field]];
      arr[i] = val;
      return { ...d, [field]: arr };
    });
  };
  const addListItem = (field: "highlights" | "includes" | "excludes") =>
    setData((d) => ({ ...d, [field]: [...d[field], ""] }));
  const removeListItem = (field: "highlights" | "includes" | "excludes", i: number) =>
    setData((d) => ({ ...d, [field]: d[field].filter((_, idx) => idx !== i) }));

  // Day helpers
  const updateDay = (di: number, key: keyof Day, val: any) => {
    setData((d) => {
      const days = [...d.days];
      days[di] = { ...days[di], [key]: val };
      return { ...d, days };
    });
  };
  const toggleDayCollapse = (di: number) => {
    setData((d) => {
      const days = [...d.days];
      days[di] = { ...days[di], collapsed: !days[di].collapsed };
      return { ...d, days };
    });
  };

  // Activity helpers
  const updateActivity = (di: number, ai: number, key: keyof Activity, val: string | number) => {
    setData((d) => {
      const days = [...d.days];
      const activities = [...days[di].activities];
      activities[ai] = { ...activities[ai], [key]: val };
      days[di] = { ...days[di], activities };
      return { ...d, days };
    });
  };
  const addActivity = (di: number) => {
    setData((d) => {
      const days = [...d.days];
      const acts = [...days[di].activities];
      acts.push(newActivity(acts.length));
      days[di] = { ...days[di], activities: acts };
      return { ...d, days };
    });
  };
  const removeActivity = (di: number, ai: number) => {
    setData((d) => {
      const days = [...d.days];
      const acts = days[di].activities.filter((_, i) => i !== ai).map((a, i) => ({ ...a, order: i }));
      days[di] = { ...days[di], activities: acts };
      return { ...d, days };
    });
  };

  const handleSave = async (andPublish?: boolean) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        highlights: data.highlights.filter(Boolean),
        includes: data.includes.filter(Boolean),
        excludes: data.excludes.filter(Boolean),
        published: andPublish ?? data.published,
      };

      let id = data.id;
      if (id) {
        await fetch(`/api/itineraries/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const res = await fetch("/api/itineraries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        id = created.id;
        setField("id" as any, id);
      }

      if (id) {
        await fetch(`/api/itineraries/${id}/days`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            days: data.days.map((d) => ({
              ...d,
              activities: d.activities.map((a, i) => ({ ...a, order: i })),
            })),
          }),
        });
      }

      router.push("/admin/itineraries");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {data.id ? "Edit Itinerary" : "New Itinerary"}
          </h1>
          {data.title && <p className="text-stone-500 text-sm">{data.title}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setField("published", !data.published)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
              data.published ? "bg-green-50 border-green-300 text-green-700" : "bg-stone-50 border-stone-300 text-stone-500"
            }`}
          >
            {data.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {data.published ? "Published" : "Draft"}
          </button>
          <Button variant="outline" onClick={() => handleSave()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Save & Publish
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg w-fit">
        {(["details", "days"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? "bg-white text-amber-700 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab === "days" ? `Day-by-Day (${data.days.length} days)` : "Details"}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-stone-800 border-b border-stone-100 pb-2">Basic Information</h2>
              <div>
                <Label>Itinerary Title *</Label>
                <Input value={data.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g., New York City — Icons & Hidden Gems" className="mt-1" />
              </div>
              <div>
                <Label>Summary *</Label>
                <Textarea value={data.summary} onChange={(e) => setField("summary", e.target.value)} placeholder="A compelling 2-3 sentence overview of this itinerary..." rows={3} className="mt-1" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Price (USD) *</Label>
                  <Input type="number" min="0" step="0.01" value={data.price} onChange={(e) => setField("price", e.target.value)} placeholder="49.00" className="mt-1" />
                </div>
                <div>
                  <Label>Duration (days) *</Label>
                  <Input type="number" min="1" max="30" value={data.duration} onChange={(e) => handleDurationChange(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Location *</Label>
                  <Select value={data.locationId} onValueChange={(v) => setField("locationId", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={data.categoryId} onValueChange={(v) => setField("categoryId", v)}>
                  <SelectTrigger className="mt-1 max-w-xs"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Highlights */}
          {(["highlights", "includes", "excludes"] as const).map((field) => (
            <Card key={field}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-stone-800 capitalize">
                    {field === "highlights" ? "Trip Highlights" : field === "includes" ? "What's Included" : "Not Included"}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => addListItem(field)}>
                    <Plus className="h-4 w-4" />Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {data[field].map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateListItem(field, i, e.target.value)}
                        placeholder={
                          field === "highlights" ? "e.g., Visit the Brooklyn Bridge at sunrise"
                          : field === "includes" ? "e.g., Detailed walking tour maps"
                          : "e.g., Flight bookings"
                        }
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeListItem(field, i)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "days" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">
              Plan each day in detail. Activities are hidden from customers until they purchase.
            </p>
          </div>

          {data.days.map((day, di) => (
            <Card key={di} className="overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 bg-stone-50 border-b border-stone-100 cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleDayCollapse(di)}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {day.dayNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    value={day.title}
                    onChange={(e) => { e.stopPropagation(); updateDay(di, "title", e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold border-0 bg-transparent p-0 h-auto text-stone-900 focus-visible:ring-0"
                    placeholder={`Day ${day.dayNumber} title`}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400 flex-shrink-0">
                  <span>{day.activities.length} activit{day.activities.length !== 1 ? "ies" : "y"}</span>
                  {day.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </div>
              </div>

              {!day.collapsed && (
                <CardContent className="p-4">
                  <div className="mb-4">
                    <Label className="text-xs">Day Description / Theme</Label>
                    <Textarea
                      value={day.description}
                      onChange={(e) => updateDay(di, "description", e.target.value)}
                      placeholder="Brief overview of this day's theme..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  {/* Activities */}
                  <div className="space-y-3 mb-4">
                    {day.activities.map((act, ai) => (
                      <div key={ai} className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <div className="grid grid-cols-12 gap-3 mb-3">
                          <div className="col-span-2">
                            <Label className="text-xs">Start</Label>
                            <Input
                              type="time"
                              value={act.startTime}
                              onChange={(e) => updateActivity(di, ai, "startTime", e.target.value)}
                              className="mt-1 text-xs"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">End</Label>
                            <Input
                              type="time"
                              value={act.endTime}
                              onChange={(e) => updateActivity(di, ai, "endTime", e.target.value)}
                              className="mt-1 text-xs"
                            />
                          </div>
                          <div className="col-span-6">
                            <Label className="text-xs">Activity Title *</Label>
                            <Input
                              value={act.title}
                              onChange={(e) => updateActivity(di, ai, "title", e.target.value)}
                              placeholder="e.g., Visit the Metropolitan Museum"
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Type</Label>
                            <Select value={act.type} onValueChange={(v) => updateActivity(di, ai, "type", v)}>
                              <SelectTrigger className="mt-1 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ACTIVITY_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={act.description}
                              onChange={(e) => updateActivity(di, ai, "description", e.target.value)}
                              placeholder="What will they do here? What should they expect?"
                              rows={2}
                              className="mt-1 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />Location / Address</Label>
                            <Input
                              value={act.location}
                              onChange={(e) => updateActivity(di, ai, "location", e.target.value)}
                              placeholder="e.g., 1000 5th Ave, New York"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Insider Tips (optional)</Label>
                          <Input
                            value={act.tips}
                            onChange={(e) => updateActivity(di, ai, "tips", e.target.value)}
                            placeholder="e.g., Visit on Tuesday when it's less crowded"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActivity(di, ai)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" onClick={() => addActivity(di)}>
                    <Plus className="h-4 w-4" />Add Activity
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Bottom save bar */}
      <div className="sticky bottom-0 bg-white border-t border-stone-200 p-4 mt-8 -mx-0 flex gap-3 justify-end">
        <Button variant="outline" onClick={() => router.push("/admin/itineraries")}>Cancel</Button>
        <Button variant="outline" onClick={() => handleSave()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Draft
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          Save & Publish
        </Button>
      </div>
    </div>
  );
}
