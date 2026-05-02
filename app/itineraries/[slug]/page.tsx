import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatPrice, parseJson } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import PurchaseButton from "@/components/itinerary/PurchaseButton";
import {
  Globe2, Clock, Star, CheckCircle2, XCircle, Lock, Plane,
  MapPin, Utensils, Camera, Mountain, Building2, Coffee, AlertTriangle, Download
} from "lucide-react";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  restaurant: Utensils,
  attraction: Camera,
  transport: Plane,
  accommodation: Building2,
  outdoors: Mountain,
  break: Coffee,
};

async function getItinerary(slug: string) {
  return prisma.itinerary.findUnique({
    where: { slug },
    include: {
      location: true,
      category: true,
      days: {
        include: { activities: { orderBy: { order: "asc" } } },
        orderBy: { dayNumber: "asc" },
      },
    },
  });
}

async function hasPurchased(userId: string, itineraryId: string) {
  const p = await prisma.purchase.findFirst({ where: { userId, itineraryId } });
  return !!p;
}

export default async function ItineraryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const itinerary = await getItinerary(slug);

  if (!itinerary || !itinerary.published) notFound();

  const userId = (session?.user as any)?.id;
  const purchased = userId ? await hasPurchased(userId, itinerary.id) : false;

  const highlights = parseJson<string[]>(itinerary.highlights, []);
  const includes = parseJson<string[]>(itinerary.includes, []);
  const excludes = parseJson<string[]>(itinerary.excludes, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-3">
          <Link href="/itineraries" className="hover:text-amber-600">Itineraries</Link>
          <span>/</span>
          <Link href={`/itineraries?location=${itinerary.location.slug}`} className="hover:text-amber-600">
            {itinerary.location.name}
          </Link>
          <span>/</span>
          <span className="text-stone-800">{itinerary.title}</span>
        </div>

        <div className="flex flex-wrap items-start gap-3 mb-4">
          <Badge>{itinerary.category.name}</Badge>
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {itinerary.duration} days
          </Badge>
          <Badge variant="outline">
            <Globe2 className="h-3 w-3 mr-1" />
            {itinerary.location.name}
          </Badge>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{itinerary.title}</h1>
        <p className="text-lg text-stone-600 leading-relaxed">{itinerary.summary}</p>
      </div>

      {/* Not a travel agency disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          <strong>Reminder:</strong> The Itinerary Architect is not a travel agency. This guide is for planning purposes only.
          No accommodations, tickets, or flights are booked on your behalf.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Highlights */}
          {highlights.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Trip Highlights
                </h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                      <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Includes / Excludes */}
          {(includes.length > 0 || excludes.length > 0) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-stone-900 mb-4">What&apos;s Included</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {includes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Included</p>
                      <ul className="space-y-1.5">
                        {includes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {excludes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Not Included</p>
                      <ul className="space-y-1.5">
                        {excludes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                            <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Day-by-Day — locked unless purchased */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-900 text-xl">Day-by-Day Itinerary</h2>
              {purchased && (
                <a
                  href={`/api/itineraries/${itinerary.id}/export`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 font-medium border border-amber-300 hover:border-amber-400 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export PDF
                </a>
              )}
            </div>
            {!purchased ? (
              <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
                <CardContent className="p-8 text-center">
                  <Lock className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-stone-800 mb-2">
                    Full Itinerary Unlocked After Purchase
                  </h3>
                  <p className="text-stone-500 text-sm mb-4">
                    Purchase this itinerary to access the complete day-by-day schedule with times,
                    locations, insider tips, and everything you need for your trip.
                  </p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {itinerary.days.slice(0, 3).map((day) => (
                      <div key={day.id} className="bg-white rounded-lg border border-amber-200 px-4 py-2 text-sm">
                        <span className="font-medium text-amber-700">Day {day.dayNumber}:</span>{" "}
                        <span className="text-stone-600">{day.title}</span>
                      </div>
                    ))}
                    {itinerary.days.length > 3 && (
                      <div className="bg-white rounded-lg border border-amber-200 px-4 py-2 text-sm text-stone-400">
                        +{itinerary.days.length - 3} more days...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {itinerary.days.map((day) => (
                  <Card key={day.id} className="overflow-hidden">
                    <div className="bg-amber-700 text-white px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold">
                          {day.dayNumber}
                        </span>
                        <div>
                          <p className="font-semibold">{day.title}</p>
                          <p className="text-amber-200 text-xs">{day.description}</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-0">
                      {day.activities.length === 0 ? (
                        <p className="text-stone-400 text-sm p-5">No activities planned yet.</p>
                      ) : (
                        <div className="divide-y divide-stone-100">
                          {day.activities.map((activity) => {
                            const Icon = ACTIVITY_ICONS[activity.type || ""] || MapPin;
                            return (
                              <div key={activity.id} className="flex gap-4 p-4 hover:bg-stone-50 transition-colors">
                                <div className="flex-shrink-0 text-center w-16">
                                  <p className="text-xs font-semibold text-amber-700">{activity.startTime}</p>
                                  <div className="my-1 w-px h-4 bg-stone-200 mx-auto" />
                                  <p className="text-xs text-stone-400">{activity.endTime}</p>
                                </div>
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                  <Icon className="h-4 w-4 text-amber-700" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-stone-900 text-sm">{activity.title}</p>
                                  <p className="text-xs text-stone-500 mt-0.5">{activity.description}</p>
                                  {activity.location && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-stone-400">
                                      <MapPin className="h-3 w-3" />
                                      {activity.location}
                                    </div>
                                  )}
                                  {activity.tips && (
                                    <div className="mt-1.5 bg-amber-50 rounded-md px-2 py-1 text-xs text-amber-800">
                                      <strong>Tip:</strong> {activity.tips}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Purchase card */}
          <Card className="sticky top-20 border-2 border-amber-200">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-amber-700">{formatPrice(itinerary.price)}</p>
                <p className="text-xs text-stone-500 mt-1">One-time purchase · Lifetime access</p>
              </div>

              {purchased ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 rounded-lg py-3 mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">You own this itinerary</span>
                  </div>
                  <a
                    href={`/api/itineraries/${itinerary.id}/export`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2.5 px-4 text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <PurchaseButton itineraryId={itinerary.id} price={itinerary.price} />
                  {!session && (
                    <p className="text-xs text-stone-500 text-center">
                      <Link href="/login" className="text-amber-600 hover:underline">Sign in</Link> to purchase
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  {itinerary.duration} day itinerary
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <Globe2 className="h-3.5 w-3.5 text-amber-500" />
                  {itinerary.location.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                  {itinerary.days.length} days planned
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flight finder CTA */}
          <Card className="bg-stone-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="h-4 w-4 text-amber-600" />
                <p className="font-medium text-stone-800 text-sm">Find Your Flights</p>
              </div>
              <p className="text-xs text-stone-500 mb-3">
                Use our flight finder to discover the best flights to {itinerary.location.name}.
              </p>
              <Link href={`/flights?dest=${itinerary.location.slug}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Search Flights
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
