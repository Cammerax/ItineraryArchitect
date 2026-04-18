"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(published);

  const toggle = async () => {
    setLoading(true);
    const res = await fetch(`/api/itineraries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !state }),
    });
    if (res.ok) {
      setState(!state);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
        state
          ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
          : "bg-stone-50 border-stone-300 text-stone-500 hover:bg-stone-100"
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : state ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      {state ? "Published" : "Draft"}
    </button>
  );
}
