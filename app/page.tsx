export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, parseJson } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Map, BookOpen, Plane, MessageSquare, Star, Clock, ChevronRight,
  Globe2, Mountain, Camera, Building2, Trees, UtensilsCrossed, AlertTriangle
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  sightseeing: Camera,
  museums: Building2,
  outdoors: Trees,
  food: UtensilsCrossed,
  adventure: Mountain,
};

async function getFeaturedItineraries() {
  return prisma.itinerary.findMany({
    where: { published: true },
    include: { location: true, category: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({ take: 6 });
}

export default async function HomePage() {
  const [itineraries, categories] = await Promise.all([
    getFeaturedItineraries(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sage-900 via-stone-900 to-sage-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blush-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-sage-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blush-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <Badge variant="outline" className="border-blush-300 text-blush-200 mb-4">
              Expert Travel Planning
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Your Journey, <br />
              <span className="text-blush-300">Beautifully Planned</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-300 mb-8 leading-relaxed">
              Discover meticulously crafted travel itineraries for destinations across the globe.
              Shop expertly designed day-by-day plans, or request a custom itinerary built
              specifically for your trip.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/explore">
                <Button size="lg" className="bg-blush-500 hover:bg-blush-600 text-white">
                  <Map className="h-5 w-5" />
                  Explore Destinations
                </Button>
              </Link>
              <Link href="/itineraries">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <BookOpen className="h-5 w-5" />
                  Browse Itineraries
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-sage-50 border-y border-sage-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3">
          <AlertTriangle className="h-5 w-5 text-sage-600 flex-shrink-0" />
          <p className="text-sm text-sage-900 text-center">
            <strong>We are not a travel agency.</strong> The Itinerary Architect provides planning guides only.
            No bookings, flights, or accommodations are arranged on your behalf. All reservations are your responsibility.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">How It Works</h2>
            <p className="text-stone-500 max-w-xl mx-auto">From discovery to departure — we make trip planning effortless.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Map, title: "Explore the Map", desc: "Browse our interactive map to discover destinations and check itinerary availability.", step: "01" },
              { icon: BookOpen, title: "Choose a Plan", desc: "Pick an itinerary that matches your interests — sightseeing, outdoors, museums, and more.", step: "02" },
              { icon: Plane, title: "Find Your Flights", desc: "Use our flight finder to discover the best flights from your nearest airport.", step: "03" },
              { icon: Star, title: "Start Exploring", desc: "Purchase your itinerary and get your full day-by-day plan to guide your adventure.", step: "04" },
            ].map(({ icon: Icon, title, desc, step }) => (
              <div key={step} className="text-center p-6">
                <div className="relative inline-flex mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-sage-700" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold text-white bg-blush-500 rounded-full w-5 h-5 flex items-center justify-center">{step}</span>
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-stone-900">Browse by Experience</h2>
                <p className="text-stone-500 mt-1">Find the perfect itinerary style for your trip</p>
              </div>
              <Link href="/itineraries" className="hidden sm:flex items-center gap-1 text-sage-600 hover:text-sage-700 font-medium text-sm">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.slug] || Globe2;
                return (
                  <Link key={cat.id} href={`/itineraries?category=${cat.slug}`}>
                    <Card className="hover:shadow-md hover:border-sage-300 transition-all cursor-pointer group">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-sage-50 group-hover:bg-sage-100 flex items-center justify-center mx-auto mb-2 transition-colors">
                          <Icon className="h-6 w-6 text-sage-700" />
                        </div>
                        <p className="text-sm font-medium text-stone-700">{cat.name}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Itineraries */}
      {itineraries.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-stone-900">Featured Itineraries</h2>
                <p className="text-stone-500 mt-1">Our most popular travel plans</p>
              </div>
              <Link href="/itineraries" className="hidden sm:flex items-center gap-1 text-sage-600 hover:text-sage-700 font-medium text-sm">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.map((it) => {
                const highlights = parseJson<string[]>(it.highlights, []);
                return (
                  <Link key={it.id} href={`/itineraries/${it.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
                      <div className="h-48 bg-gradient-to-br from-sage-100 to-stone-200 flex items-center justify-center relative">
                        <Globe2 className="h-16 w-16 text-sage-300" />
                        <div className="absolute top-3 left-3">
                          <Badge>{it.category.name}</Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary">{it.duration} days</Badge>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <p className="text-xs text-sage-700 font-medium mb-1">{it.location.name}</p>
                        <h3 className="font-bold text-stone-900 mb-2 group-hover:text-sage-700 transition-colors">{it.title}</h3>
                        <p className="text-sm text-stone-500 mb-3 line-clamp-2">{it.summary}</p>
                        {highlights.length > 0 && (
                          <ul className="space-y-1 mb-4">
                            {highlights.slice(0, 2).map((h, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs text-stone-600">
                                <Star className="h-3 w-3 text-sage-500 flex-shrink-0" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <Clock className="h-3.5 w-3.5" />
                            {it.duration} {it.duration === 1 ? "day" : "days"}
                          </div>
                          <span className="text-lg font-bold text-sage-700">{formatPrice(it.price)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Custom Itinerary CTA */}
      <section className="py-16 bg-gradient-to-r from-sage-700 to-sage-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageSquare className="h-12 w-12 text-sage-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Don&apos;t See What You&apos;re Looking For?</h2>
          <p className="text-sage-200 max-w-xl mx-auto mb-6">
            Request a completely custom itinerary built specifically for your trip — your dates, your pace, your interests.
          </p>
          <Link href="/request">
            <Button size="lg" className="bg-white text-sage-800 hover:bg-sage-50">
              Request a Custom Itinerary
            </Button>
          </Link>
        </div>
      </section>

      {/* Map Teaser */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-4">Explore by Destination</h2>
              <p className="text-stone-500 mb-6 leading-relaxed">
                Use our interactive map to explore destinations across five continents.
                Drill down from continent to country to state to city — and see at a glance
                which destinations have itineraries available.
              </p>
              <Link href="/explore">
                <Button>
                  <Map className="h-4 w-4" />
                  Open the Map
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["North America", "South America", "Europe", "Asia", "Australia"].map((c) => (
                <Link
                  key={c}
                  href={`/explore?continent=${c.toLowerCase().replace(" ", "-")}`}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg border border-stone-200 hover:border-sage-400 hover:bg-sage-50 transition-colors text-sm font-medium text-stone-700 hover:text-sage-700"
                >
                  <Globe2 className="h-4 w-4 text-sage-500" />
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
