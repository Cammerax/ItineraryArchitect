"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Trash2, Save, Eye, EyeOff, GripVertical, Loader2,
  ChevronDown, ChevronUp, ChevronRight, Copy, Download,
  Clock, MapPin, Lightbulb, ArrowUp, ArrowDown, CheckCircle2,
  AlertCircle, Utensils, Camera, Mountain, Building2, Coffee,
  Plane as PlaneIcon, Pencil, LayoutList, X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Activity {
  tempId?: string;
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

// ── Activity type config ───────────────────────────────────────────────────

const ACTIVITY_TYPES = [
  { value: "attraction",    label: "Attraction",     icon: Camera,    color: "bg-sage-500",   light: "bg-sage-50",   text: "text-sage-700",   border: "border-sage-200" },
  { value: "restaurant",   label: "Dining",          icon: Utensils,  color: "bg-green-500",   light: "bg-green-50",   text: "text-green-700",   border: "border-green-200" },
  { value: "transport",    label: "Transport",       icon: PlaneIcon, color: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"  },
  { value: "accommodation",label: "Accommodation",   icon: Building2, color: "bg-purple-500",  light: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200"},
  { value: "outdoors",     label: "Outdoors",        icon: Mountain,  color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200"},
  { value: "break",        label: "Leisure",         icon: Coffee,    color: "bg-stone-400",   light: "bg-stone-100",  text: "text-stone-600",   border: "border-stone-200" },
] as const;

type ActivityTypeValue = (typeof ACTIVITY_TYPES)[number]["value"];

function getTypeConfig(type: string) {
  return ACTIVITY_TYPES.find(t => t.value === type) ?? ACTIVITY_TYPES[0];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() {
  return `tmp-${Math.random().toString(36).slice(2, 9)}`;
}

function newActivity(order: number, prevEnd?: string): Activity {
  return {
    tempId: uid(),
    startTime: prevEnd ?? "09:00",
    endTime:   addHour(prevEnd ?? "09:00"),
    title: "", description: "", location: "", type: "attraction", tips: "", order,
  };
}

function addHour(time: string) {
  const [h, m] = time.split(":").map(Number);
  const next = (h + 1) % 24;
  return `${String(next).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calcDuration(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) return "";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

function newDay(num: number): Day {
  return {
    dayNumber: num,
    title: `Day ${num}`,
    description: "",
    activities: [newActivity(0)],
    collapsed: false,
  };
}

function activityDragId(act: Activity, di: number, ai: number) {
  return act.id ?? act.tempId ?? `act-${di}-${ai}`;
}

// ── Timeline bar ───────────────────────────────────────────────────────────

function DayTimeline({ activities }: { activities: Activity[] }) {
  const START = 6 * 60;   // 6:00am in minutes
  const END   = 24 * 60;  // midnight
  const SPAN  = END - START;

  function pct(time: string) {
    const [h, m] = time.split(":").map(Number);
    return Math.max(0, Math.min(100, ((h * 60 + m - START) / SPAN) * 100));
  }

  const HOUR_MARKS = [6, 9, 12, 15, 18, 21];

  return (
    <div className="relative h-7 bg-stone-100 rounded-lg overflow-hidden mx-0 mb-4" title="Activity timeline (6am–midnight)">
      {/* Hour grid lines */}
      {HOUR_MARKS.map(h => (
        <div key={h} className="absolute top-0 bottom-0 flex flex-col justify-between" style={{ left: `${((h * 60 - START) / SPAN) * 100}%` }}>
          <div className="w-px h-full bg-stone-200" />
        </div>
      ))}
      {/* Activity blocks */}
      {activities.filter(a => a.startTime && a.endTime).map((act, i) => {
        const tc = getTypeConfig(act.type);
        const s = pct(act.startTime);
        const e = pct(act.endTime);
        return (
          <div
            key={i}
            className={`absolute top-1 bottom-1 rounded-sm ${tc.color} opacity-80 transition-all`}
            style={{ left: `${s}%`, width: `${Math.max(e - s, 0.6)}%` }}
            title={`${act.startTime}–${act.endTime}: ${act.title || "Untitled"}`}
          />
        );
      })}
      {/* Hour labels */}
      {HOUR_MARKS.map(h => (
        <span
          key={`lbl-${h}`}
          className="absolute bottom-0.5 text-[7px] text-stone-400 select-none"
          style={{ left: `calc(${((h * 60 - START) / SPAN) * 100}% + 2px)` }}
        >
          {h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
        </span>
      ))}
    </div>
  );
}

// ── Sortable activity card ─────────────────────────────────────────────────

interface ActivityCardProps {
  activity: Activity;
  dayIndex: number;
  activityIndex: number;
  totalActivities: number;
  onUpdate: (key: keyof Activity, value: string | number) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

function SortableActivityCard({ activity, dayIndex, activityIndex, totalActivities, onUpdate, onRemove, onDuplicate }: ActivityCardProps) {
  const dragId = activityDragId(activity, dayIndex, activityIndex);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dragId });
  const [open, setOpen] = useState(!activity.title);
  const tc = getTypeConfig(activity.type);
  const duration = calcDuration(activity.startTime, activity.endTime);
  const TypeIcon = tc.icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex rounded-xl border overflow-hidden bg-white transition-shadow ${
        isDragging ? "shadow-2xl opacity-60 scale-[1.02]" : "shadow-sm hover:shadow-md"
      } ${tc.border}`}
    >
      {/* Left accent bar */}
      <div className={`w-1.5 flex-shrink-0 ${tc.color}`} />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center px-1.5 cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-400 transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-3">
        {/* Header row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Times */}
          <div className="flex items-center gap-1">
            <input
              type="time"
              value={activity.startTime}
              onChange={e => onUpdate("startTime", e.target.value)}
              className="w-[5.5rem] text-xs font-mono bg-stone-50 border border-stone-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-sage-400 focus:border-sage-400 outline-none"
            />
            <ChevronRight className="h-3 w-3 text-stone-400 flex-shrink-0" />
            <input
              type="time"
              value={activity.endTime}
              onChange={e => onUpdate("endTime", e.target.value)}
              className="w-[5.5rem] text-xs font-mono bg-stone-50 border border-stone-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-sage-400 focus:border-sage-400 outline-none"
            />
          </div>
          {duration && (
            <span className="text-[10px] text-stone-400 font-medium">{duration}</span>
          )}
          {/* Type badge */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${tc.light} flex-shrink-0`}>
            <TypeIcon className={`h-2.5 w-2.5 ${tc.text}`} />
            <span className={`text-[9px] font-bold ${tc.text} uppercase tracking-wide`}>{tc.label}</span>
          </div>
          {/* Title */}
          <input
            value={activity.title}
            onChange={e => onUpdate("title", e.target.value)}
            placeholder="Activity title…"
            className={`flex-1 min-w-[8rem] text-sm font-semibold text-stone-800 bg-transparent border-0 focus:outline-none focus:bg-stone-50 rounded px-1 py-0.5 placeholder:text-stone-300`}
          />
          {/* Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="text-stone-300 hover:text-stone-500 p-0.5 rounded flex-shrink-0"
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Expandable detail section */}
        {open && (
          <div className="mt-3 space-y-3">
            {/* Activity type selector */}
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">Activity Type</span>
              <div className="flex flex-wrap gap-1.5">
                {ACTIVITY_TYPES.map(t => {
                  const TIcon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => onUpdate("type", t.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        activity.type === t.value
                          ? `${t.color} text-white border-transparent shadow-sm`
                          : `bg-white ${t.text} ${t.border} hover:${t.light}`
                      }`}
                    >
                      <TIcon className="h-3 w-3" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description + Location + Tips */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-stone-400 mb-1 block">
                  <LayoutList className="h-3 w-3 inline mr-1" />Description
                </Label>
                <Textarea
                  value={activity.description}
                  onChange={e => onUpdate("description", e.target.value)}
                  placeholder="What will travelers experience? What should they expect?"
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-stone-400 mb-1 block">
                    <MapPin className="h-3 w-3 inline mr-1" />Location / Address
                  </Label>
                  <Input
                    value={activity.location}
                    onChange={e => onUpdate("location", e.target.value)}
                    placeholder="e.g., 1000 5th Ave, New York"
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-stone-400 mb-1 block">
                    <Lightbulb className="h-3 w-3 inline mr-1" />Insider Tip
                  </Label>
                  <Input
                    value={activity.tips}
                    onChange={e => onUpdate("tips", e.target.value)}
                    placeholder="e.g., Book tickets online 3 months in advance"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1 border-t border-stone-100">
              <button
                onClick={onDuplicate}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                <Copy className="h-3 w-3" /> Duplicate
              </button>
              <button
                onClick={onRemove}
                disabled={totalActivities <= 1}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors ml-auto disabled:opacity-30"
              >
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── List field editor (highlights / includes / excludes) ──────────────────

function ListEditor({
  label,
  items,
  onUpdate,
  onAdd,
  onRemove,
  placeholder,
  accentColor = "sage",
}: {
  label: string;
  items: string[];
  onUpdate: (i: number, val: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  placeholder: string;
  accentColor?: "sage" | "green" | "red";
}) {
  const dotClass = accentColor === "green" ? "bg-green-500" : accentColor === "red" ? "bg-red-400" : "bg-sage-500";
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
            <h3 className="font-semibold text-stone-800 text-sm">{label}</h3>
            <span className="text-xs text-stone-400">({items.length})</span>
          </div>
          <button onClick={onAdd} className="flex items-center gap-1 text-xs text-sage-600 hover:text-sage-700 font-medium">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center group">
              <div className={`w-1.5 h-1.5 rounded-full ${dotClass} flex-shrink-0 mt-1`} />
              <Input
                value={item}
                onChange={e => onUpdate(i, e.target.value)}
                placeholder={placeholder}
                className="text-sm flex-1"
              />
              <button
                onClick={() => onRemove(i)}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-stone-400 italic text-center py-2">No items yet — click Add</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Save status badge ──────────────────────────────────────────────────────

function SaveStatus({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  return (
    <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg ${
      status === "saving" ? "bg-stone-100 text-stone-500"
      : status === "saved"  ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-600"
    }`}>
      {status === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === "saved"  && <CheckCircle2 className="h-3 w-3" />}
      {status === "error"  && <AlertCircle className="h-3 w-3" />}
      {status === "saving" ? "Auto-saving…" : status === "saved" ? "Saved" : "Save failed"}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────

interface Props {
  locations: Location[];
  categories: Category[];
  initialData?: ItineraryData;
}

export default function ItineraryEditor({ locations, categories, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeTab, setActiveTab] = useState<"details" | "days">("details");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastSavedRef = useRef<string>("");

  const [data, setData] = useState<ItineraryData>(() =>
    initialData ?? {
      title: "", summary: "", price: "", duration: "3", locationId: "",
      categoryId: "", highlights: [""], includes: [""], excludes: [""],
      published: false, days: [newDay(1), newDay(2), newDay(3)],
    }
  );

  // ── DnD sensors ────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Auto-save (edit mode only) ─────────────────────────────────────────
  useEffect(() => {
    if (!data.id) return;
    const serialized = JSON.stringify(data);
    if (serialized === lastSavedRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await doSave(data, false);
        lastSavedRef.current = JSON.stringify(data);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
      }
    }, 3000);
    return () => clearTimeout(saveTimerRef.current);
  }, [data]);

  // ── Cmd/Ctrl+S ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // ── Core setters ───────────────────────────────────────────────────────
  const setField = useCallback(<K extends keyof ItineraryData>(k: K, v: ItineraryData[K]) => {
    setData(d => ({ ...d, [k]: v }));
  }, []);

  const handleDurationChange = (val: string) => {
    const num = Math.max(1, parseInt(val) || 1);
    setData(d => {
      const cur = d.days.length;
      let days = [...d.days];
      if (num > cur) {
        for (let i = cur + 1; i <= num; i++) days.push(newDay(i));
      } else {
        days = days.slice(0, num);
      }
      return { ...d, duration: val, days };
    });
  };

  // ── List helpers ───────────────────────────────────────────────────────
  function updateList(field: "highlights" | "includes" | "excludes", i: number, val: string) {
    setData(d => { const a = [...d[field]]; a[i] = val; return { ...d, [field]: a }; });
  }
  function addToList(field: "highlights" | "includes" | "excludes") {
    setData(d => ({ ...d, [field]: [...d[field], ""] }));
  }
  function removeFromList(field: "highlights" | "includes" | "excludes", i: number) {
    setData(d => ({ ...d, [field]: d[field].filter((_, idx) => idx !== i) }));
  }

  // ── Day helpers ────────────────────────────────────────────────────────
  function updateDay(di: number, key: keyof Day, val: unknown) {
    setData(d => { const days = [...d.days]; days[di] = { ...days[di], [key]: val }; return { ...d, days }; });
  }

  function toggleDay(di: number) {
    updateDay(di, "collapsed", !data.days[di].collapsed);
  }

  function moveDay(di: number, dir: -1 | 1) {
    const ni = di + dir;
    if (ni < 0 || ni >= data.days.length) return;
    setData(d => {
      const days = [...d.days];
      [days[di], days[ni]] = [days[ni], days[di]];
      // Renumber
      return { ...d, days: days.map((day, i) => ({ ...day, dayNumber: i + 1 })) };
    });
  }

  function duplicateDay(di: number) {
    setData(d => {
      const days = [...d.days];
      const copy: Day = {
        ...JSON.parse(JSON.stringify(days[di])),
        id: undefined,
        dayNumber: days.length + 1,
        title: `${days[di].title} (copy)`,
        activities: days[di].activities.map(a => ({ ...a, id: undefined, tempId: uid() })),
        collapsed: false,
      };
      return { ...d, days: [...days, copy], duration: String(days.length + 1) };
    });
  }

  function removeDay(di: number) {
    setData(d => {
      const days = d.days.filter((_, i) => i !== di).map((day, i) => ({ ...day, dayNumber: i + 1 }));
      return { ...d, days, duration: String(days.length) };
    });
  }

  // ── Activity helpers ───────────────────────────────────────────────────
  function updateActivity(di: number, ai: number, key: keyof Activity, val: string | number) {
    setData(d => {
      const days = [...d.days];
      const acts = [...days[di].activities];
      acts[ai] = { ...acts[ai], [key]: val };
      days[di] = { ...days[di], activities: acts };
      return { ...d, days };
    });
  }

  function addActivity(di: number) {
    setData(d => {
      const days = [...d.days];
      const acts = days[di].activities;
      const prevEnd = acts.at(-1)?.endTime;
      days[di] = { ...days[di], activities: [...acts, newActivity(acts.length, prevEnd)] };
      return { ...d, days };
    });
  }

  function removeActivity(di: number, ai: number) {
    setData(d => {
      const days = [...d.days];
      const acts = days[di].activities.filter((_, i) => i !== ai).map((a, i) => ({ ...a, order: i }));
      days[di] = { ...days[di], activities: acts };
      return { ...d, days };
    });
  }

  function duplicateActivity(di: number, ai: number) {
    setData(d => {
      const days = [...d.days];
      const acts = [...days[di].activities];
      const copy: Activity = { ...acts[ai], id: undefined, tempId: uid(), order: acts.length };
      days[di] = { ...days[di], activities: [...acts, copy] };
      return { ...d, days };
    });
  }

  function handleDragEnd(di: number, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setData(d => {
      const days = [...d.days];
      const acts = [...days[di].activities];
      const oldIdx = acts.findIndex((a, ai) => activityDragId(a, di, ai) === active.id);
      const newIdx = acts.findIndex((a, ai) => activityDragId(a, di, ai) === over.id);
      if (oldIdx === -1 || newIdx === -1) return d;
      const reordered = arrayMove(acts, oldIdx, newIdx).map((a, i) => ({ ...a, order: i }));
      days[di] = { ...days[di], activities: reordered };
      return { ...d, days };
    });
  }

  // ── Save logic ─────────────────────────────────────────────────────────
  async function doSave(payload: ItineraryData, publish?: boolean) {
    const body = {
      ...payload,
      highlights: payload.highlights.filter(Boolean),
      includes:   payload.includes.filter(Boolean),
      excludes:   payload.excludes.filter(Boolean),
      published:  publish ?? payload.published,
    };

    let id = payload.id;
    if (id) {
      await fetch(`/api/itineraries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      const res = await fetch("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      id = created.id;
      setField("id" as keyof ItineraryData, id as any);
    }

    if (id) {
      await fetch(`/api/itineraries/${id}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: payload.days.map(d => ({
            ...d,
            activities: d.activities.map((a, i) => ({ ...a, order: i })),
          })),
        }),
      });
    }
    return id;
  }

  async function handleSave(publish?: boolean) {
    setSaving(true);
    clearTimeout(saveTimerRef.current);
    try {
      const id = await doSave(data, publish);
      lastSavedRef.current = JSON.stringify(data);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      router.push("/admin/itineraries");
      router.refresh();
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  const collapseAll = () => setData(d => ({ ...d, days: d.days.map(day => ({ ...day, collapsed: true })) }));
  const expandAll   = () => setData(d => ({ ...d, days: d.days.map(day => ({ ...day, collapsed: false })) }));

  const totalActivities = data.days.reduce((n, d) => n + d.activities.length, 0);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl pb-24">
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Pencil className="h-4 w-4 text-sage-500" />
            <h1 className="text-2xl font-bold text-stone-900">
              {data.id ? "Edit Itinerary" : "New Itinerary"}
            </h1>
          </div>
          {data.title && <p className="text-stone-500 text-sm pl-6">{data.title}</p>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SaveStatus status={saveStatus} />
          <button
            onClick={() => setField("published", !data.published)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
              data.published
                ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                : "bg-stone-50 border-stone-300 text-stone-500 hover:bg-stone-100"
            }`}
          >
            {data.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {data.published ? "Published" : "Draft"}
          </button>
          {data.id && (
            <a
              href={`/api/itineraries/${data.id}/export`}
              target="_blank"
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            >
              <Download className="h-4 w-4" /> Export PDF
            </a>
          )}
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

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        {(["details", "days"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-white text-sage-700 shadow-sm font-semibold"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab === "days"
              ? `Day-by-Day · ${data.days.length} days · ${totalActivities} activities`
              : "Details"}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DETAILS TAB                                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "details" && (
        <div className="space-y-5">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-6 rounded bg-sage-500" />
                <h2 className="font-semibold text-stone-800">Basic Information</h2>
              </div>
              <div>
                <Label className="text-xs text-stone-500 uppercase tracking-wider">Title *</Label>
                <Input
                  value={data.title}
                  onChange={e => setField("title", e.target.value)}
                  placeholder="e.g., New York City — Icons & Hidden Gems"
                  className="mt-1 text-lg font-semibold"
                />
              </div>
              <div>
                <Label className="text-xs text-stone-500 uppercase tracking-wider">Summary *</Label>
                <Textarea
                  value={data.summary}
                  onChange={e => setField("summary", e.target.value)}
                  placeholder="A compelling 2-3 sentence description that sells the experience…"
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-stone-400 mt-1 text-right">{data.summary.length} chars</p>
              </div>
              <div className="grid sm:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-stone-500 uppercase tracking-wider">Price (USD) *</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                    <Input
                      type="number" min="0" step="0.01"
                      value={data.price}
                      onChange={e => setField("price", e.target.value)}
                      placeholder="49.99"
                      className="pl-6"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-stone-500 uppercase tracking-wider">Duration (days) *</Label>
                  <Input
                    type="number" min="1" max="30"
                    value={data.duration}
                    onChange={e => handleDurationChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-stone-500 uppercase tracking-wider">Location *</Label>
                  <Select value={data.locationId} onValueChange={v => setField("locationId", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Choose location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-stone-500 uppercase tracking-wider">Category *</Label>
                  <Select value={data.categoryId} onValueChange={v => setField("categoryId", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Choose category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lists */}
          <div className="grid sm:grid-cols-3 gap-4">
            <ListEditor
              label="Trip Highlights"
              items={data.highlights}
              onUpdate={(i, v) => updateList("highlights", i, v)}
              onAdd={() => addToList("highlights")}
              onRemove={i => removeFromList("highlights", i)}
              placeholder="e.g., Sunrise at the Brooklyn Bridge"
              accentColor="sage"
            />
            <ListEditor
              label="What's Included"
              items={data.includes}
              onUpdate={(i, v) => updateList("includes", i, v)}
              onAdd={() => addToList("includes")}
              onRemove={i => removeFromList("includes", i)}
              placeholder="e.g., Detailed walking tour maps"
              accentColor="green"
            />
            <ListEditor
              label="Not Included"
              items={data.excludes}
              onUpdate={(i, v) => updateList("excludes", i, v)}
              onAdd={() => addToList("excludes")}
              onRemove={i => removeFromList("excludes", i)}
              placeholder="e.g., Flight bookings"
              accentColor="red"
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DAYS TAB                                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "days" && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="flex items-center justify-between bg-stone-50 rounded-xl border border-stone-200 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Clock className="h-4 w-4" />
              <span>{data.days.length} days · {totalActivities} activities total</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={expandAll}   className="text-xs text-stone-500 hover:text-stone-700 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors">Expand all</button>
              <button onClick={collapseAll} className="text-xs text-stone-500 hover:text-stone-700 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors">Collapse all</button>
              <div className="w-px h-4 bg-stone-200" />
              <button
                onClick={() => setData(d => ({
                  ...d,
                  days: [...d.days, newDay(d.days.length + 1)],
                  duration: String(d.days.length + 1),
                }))}
                className="flex items-center gap-1 text-xs text-sage-600 hover:text-sage-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-sage-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Day
              </button>
            </div>
          </div>

          {/* Day cards */}
          {data.days.map((day, di) => (
            <div key={di} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              {/* Day header */}
              <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-stone-50 to-white border-b border-stone-100">
                {/* Day badge */}
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-sage-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {day.dayNumber}
                </div>

                {/* Title */}
                <input
                  value={day.title}
                  onChange={e => updateDay(di, "title", e.target.value)}
                  className="flex-1 min-w-0 font-bold text-stone-900 bg-transparent border-0 focus:outline-none focus:bg-white focus:shadow-inner rounded px-2 py-1 text-base"
                  placeholder={`Day ${day.dayNumber} title`}
                />

                {/* Stats badge */}
                <span className="text-xs text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full flex-shrink-0">
                  {day.activities.length} {day.activities.length === 1 ? "activity" : "activities"}
                </span>

                {/* Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => moveDay(di, -1)} disabled={di === 0} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors" title="Move day up">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveDay(di, 1)} disabled={di === data.days.length - 1} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors" title="Move day down">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => duplicateDay(di)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors" title="Duplicate day">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  {data.days.length > 1 && (
                    <button onClick={() => { if (confirm(`Remove Day ${day.dayNumber}?`)) removeDay(di); }} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors" title="Remove day">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button onClick={() => toggleDay(di)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors" title={day.collapsed ? "Expand" : "Collapse"}>
                    {day.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Day body */}
              {!day.collapsed && (
                <div className="p-5">
                  {/* Timeline visualization */}
                  {day.activities.some(a => a.startTime && a.endTime) && (
                    <DayTimeline activities={day.activities} />
                  )}

                  {/* Day description */}
                  <div className="mb-4">
                    <Label className="text-xs text-stone-400 uppercase tracking-wider mb-1.5 block">Day Theme / Description</Label>
                    <Textarea
                      value={day.description}
                      onChange={e => updateDay(di, "description", e.target.value)}
                      placeholder="Brief theme or overview of this day's focus…"
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>

                  {/* Activities */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={e => handleDragEnd(di, e)}
                  >
                    <SortableContext
                      items={day.activities.map((a, ai) => activityDragId(a, di, ai))}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2.5">
                        {day.activities.map((act, ai) => (
                          <SortableActivityCard
                            key={activityDragId(act, di, ai)}
                            activity={act}
                            dayIndex={di}
                            activityIndex={ai}
                            totalActivities={day.activities.length}
                            onUpdate={(key, val) => updateActivity(di, ai, key, val)}
                            onRemove={() => removeActivity(di, ai)}
                            onDuplicate={() => duplicateActivity(di, ai)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add activity */}
                  <button
                    onClick={() => addActivity(di)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-sage-400 hover:text-sage-600 hover:bg-sage-50 transition-all text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Activity
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Sticky bottom bar ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-stone-200 px-6 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <SaveStatus status={saveStatus} />
          <span className="text-xs text-stone-400 hidden sm:block">
            {data.id ? "Ctrl+S / ⌘S to save" : "Save to create the itinerary"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/admin/itineraries")}>Cancel</Button>
          <Button variant="outline" onClick={() => handleSave()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving} className="shadow-md">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Save & Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
