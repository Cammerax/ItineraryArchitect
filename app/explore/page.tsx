import { prisma } from "@/lib/db";
import InteractiveMap from "@/components/map/InteractiveMap";
import { Map } from "lucide-react";

async function getLocations() {
  return prisma.location.findMany({
    include: { children: true },
    orderBy: { name: "asc" },
  });
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ continent?: string }>;
}) {
  const { continent } = await searchParams;
  const locations = await getLocations();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
            <Map className="h-5 w-5 text-sage-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Explore Destinations</h1>
            <p className="text-stone-500 text-sm">
              Click any region to dive deeper and discover available itineraries
            </p>
          </div>
        </div>
      </div>

      <InteractiveMap locations={locations} initialContinent={continent} />
    </div>
  );
}
