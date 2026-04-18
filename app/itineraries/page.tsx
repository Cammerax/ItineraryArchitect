import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatPrice, parseJson } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe2, Clock, Star, BookOpen, SlidersHorizontal } from "lucide-react";
import ItineraryFilters from "@/components/itinerary/ItineraryFilters";

async function getItineraries(category?: string, location?: string, continent?: string) {
  return prisma.itinerary.findMany({
    where: {
      published: true,
      ...(category && { category: { slug: category } }),
      ...(location && { location: { slug: location } }),
      ...(continent && { location: { continent } }),
    },
    include: { location: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

async function getLocations() {
  return prisma.location.findMany({
    where: { hasItinerary: true },
    orderBy: { name: "asc" },
  });
}

export default async function ItinerariesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; location?: string; continent?: string }>;
}) {
  const { category, location, continent } = await searchParams;
  const [itineraries, categories, locations] = await Promise.all([
    getItineraries(category, location, continent),
    getCategories(),
    getLocations(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Browse Itineraries</h1>
            <p className="text-stone-500 text-sm">
              {itineraries.length} itinerar{itineraries.length === 1 ? "y" : "ies"} available
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <ItineraryFilters
            categories={categories}
            locations={locations}
            selectedCategory={category}
            selectedLocation={location}
            selectedContinent={continent}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {itineraries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
              <Globe2 className="h-12 w-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-stone-700 mb-2">No itineraries found</h3>
              <p className="text-stone-500 text-sm mb-4">Try adjusting your filters or check back soon.</p>
              <Link href="/request">
                <Button>Request a Custom Itinerary</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {itineraries.map((it) => {
                const highlights = parseJson<string[]>(it.highlights, []);
                return (
                  <Link key={it.id} href={`/itineraries/${it.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all h-full group cursor-pointer">
                      <div className="h-40 bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center relative">
                        <Globe2 className="h-12 w-12 text-amber-300" />
                        <div className="absolute top-2 left-2">
                          <Badge>{it.category.name}</Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">{it.duration}d</Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-amber-700 font-medium mb-1">{it.location.name}</p>
                        <h3 className="font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors text-sm leading-tight">
                          {it.title}
                        </h3>
                        <p className="text-xs text-stone-500 mb-3 line-clamp-2">{it.summary}</p>
                        {highlights.slice(0, 2).map((h, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-stone-600 mb-1">
                            <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />
                            <span className="truncate">{h}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <Clock className="h-3 w-3" />
                            {it.duration} days
                          </div>
                          <span className="font-bold text-amber-700">{formatPrice(it.price)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
