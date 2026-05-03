"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Tag, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { itineraries: number };
}

export default function AdminCategoriesClient({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleAdd = async () => {
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const cat = await res.json();
    setCategories([...categories, { ...cat, _count: { itineraries: 0 } }]);
    setForm({ name: "", description: "" });
    setShowForm(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
          <p className="text-stone-500 text-sm">Experience types for itineraries</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />Add Category
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-sage-200">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-stone-800">New Category</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g., Outdoor & Hiking" className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description" className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading || !form.name}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Category
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-4 flex items-start gap-3">
              <Tag className="h-5 w-5 text-sage-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-stone-900">{cat.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">{cat.description || "No description"}</p>
                <p className="text-xs text-stone-400 mt-1">{cat._count.itineraries} itinerar{cat._count.itineraries !== 1 ? "ies" : "y"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
