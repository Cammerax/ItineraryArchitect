"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

interface Category { id: string; name: string; slug: string }
interface Location { id: string; name: string; slug: string; continent: string }

interface Props {
  categories: Category[];
  locations: Location[];
  selectedCategory?: string;
  selectedLocation?: string;
  selectedContinent?: string;
}

const CONTINENTS = [
  { value: "north-america", label: "North America" },
  { value: "south-america", label: "South America" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "australia", label: "Australia" },
];

export default function ItineraryFilters({
  categories, locations, selectedCategory, selectedLocation, selectedContinent
}: Props) {
  const router = useRouter();

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams();
    if (key !== "category" && selectedCategory) params.set("category", selectedCategory);
    if (key !== "location" && selectedLocation) params.set("location", selectedLocation);
    if (key !== "continent" && selectedContinent) params.set("continent", selectedContinent);
    if (value) params.set(key, value);
    router.push(`/itineraries?${params.toString()}`);
  };

  const clearAll = () => router.push("/itineraries");

  const hasFilters = selectedCategory || selectedLocation || selectedContinent;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-stone-500" />
          <span className="font-semibold text-stone-800">Filters</span>
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
            <X className="h-3 w-3" />Clear
          </button>
        )}
      </div>

      {/* Category */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Experience Type</h4>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter("category", selectedCategory === cat.slug ? undefined : cat.slug)}
              className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-amber-100 text-amber-800 font-medium"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Continent */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Region</h4>
        <div className="flex flex-col gap-1">
          {CONTINENTS.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter("continent", selectedContinent === c.value ? undefined : c.value)}
              className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                selectedContinent === c.value
                  ? "bg-amber-100 text-amber-800 font-medium"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      {locations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Destination</h4>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {locations
              .filter((l) => !selectedContinent || l.continent === selectedContinent)
              .map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setFilter("location", selectedLocation === loc.slug ? undefined : loc.slug)}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    selectedLocation === loc.slug
                      ? "bg-amber-100 text-amber-800 font-medium"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {loc.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
