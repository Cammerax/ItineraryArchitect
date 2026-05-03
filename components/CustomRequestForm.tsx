"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";

const ACTIVITY_TYPES = [
  "Sightseeing & Landmarks",
  "Museums & Culture",
  "Outdoor & Hiking",
  "Food & Dining",
  "Adventure Sports",
  "Nightlife & Entertainment",
  "Shopping",
  "Relaxation & Wellness",
  "Family-Friendly",
  "Photography",
];

const BUDGET_OPTIONS = [
  "Budget ($50–100/day)",
  "Mid-range ($100–200/day)",
  "Comfort ($200–350/day)",
  "Luxury ($350+/day)",
];

export default function CustomRequestForm() {
  const [form, setForm] = useState({
    name: "", email: "", destination: "", startDate: "", endDate: "",
    travelers: "2", activities: [] as string[], budget: "", notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const toggleActivity = (act: string) => {
    setForm((f) => ({
      ...f,
      activities: f.activities.includes(act)
        ? f.activities.filter((a) => a !== act)
        : [...f.activities, act],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-2">Request Submitted!</h3>
        <p className="text-stone-500 mb-1">
          Thank you, {form.name}. We&apos;ve received your custom itinerary request for <strong>{form.destination}</strong>.
        </p>
        <p className="text-stone-500 text-sm">
          Expect a response to <strong>{form.email}</strong> within 2–5 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Your Name *</Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Jane Smith" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="jane@example.com" className="mt-1" />
        </div>
      </div>

      <div>
        <Label htmlFor="destination">Destination *</Label>
        <Input id="destination" value={form.destination} onChange={(e) => set("destination", e.target.value)} required placeholder="e.g., Tokyo, Japan or the Scottish Highlands" className="mt-1" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input id="startDate" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input id="endDate" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="travelers">Travelers *</Label>
          <Input id="travelers" type="number" min="1" max="20" value={form.travelers} onChange={(e) => set("travelers", e.target.value)} required className="mt-1" />
        </div>
      </div>

      <div>
        <Label className="block mb-2">Preferred Activities (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITY_TYPES.map((act) => (
            <label key={act} className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={() => toggleActivity(act)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  form.activities.includes(act)
                    ? "bg-sage-600 border-sage-600"
                    : "border-stone-300 group-hover:border-sage-400"
                }`}
              >
                {form.activities.includes(act) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-stone-700">{act}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="block mb-2">Budget per Day *</Label>
        <div className="grid sm:grid-cols-2 gap-2">
          {BUDGET_OPTIONS.map((b) => (
            <label key={b} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="budget"
                value={b}
                checked={form.budget === b}
                onChange={() => set("budget", b)}
                className="accent-sage-600"
              />
              <span className="text-sm text-stone-700">{b}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Any special requirements, mobility considerations, dietary restrictions, specific experiences you want to include, etc."
          className="mt-1"
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={loading || !form.budget}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</> : "Submit Custom Request"}
      </Button>

      <p className="text-xs text-stone-400 text-center">
        By submitting, you acknowledge that this is a planning service only — no bookings will be made.
      </p>
    </form>
  );
}
