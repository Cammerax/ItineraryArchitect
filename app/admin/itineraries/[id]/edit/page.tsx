import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ItineraryEditor from "@/components/admin/ItineraryEditor";
import { parseJson } from "@/lib/utils";

export default async function EditItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [itinerary, locations, categories] = await Promise.all([
    prisma.itinerary.findUnique({
      where: { id },
      include: { days: { include: { activities: { orderBy: { order: "asc" } } }, orderBy: { dayNumber: "asc" } } },
    }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!itinerary) notFound();

  const initialData = {
    id: itinerary.id,
    title: itinerary.title,
    summary: itinerary.summary,
    price: itinerary.price.toString(),
    duration: itinerary.duration.toString(),
    locationId: itinerary.locationId,
    categoryId: itinerary.categoryId,
    highlights: parseJson<string[]>(itinerary.highlights, []),
    includes: parseJson<string[]>(itinerary.includes, []),
    excludes: parseJson<string[]>(itinerary.excludes, []),
    published: itinerary.published,
    days: itinerary.days.map((d) => ({
      id: d.id,
      dayNumber: d.dayNumber,
      title: d.title,
      description: d.description,
      collapsed: false,
      activities: d.activities.map((a) => ({
        id: a.id,
        startTime: a.startTime,
        endTime: a.endTime,
        title: a.title,
        description: a.description,
        location: a.location ?? "",
        type: a.type ?? "attraction",
        tips: a.tips ?? "",
        order: a.order,
      })),
    })),
  };

  return <ItineraryEditor locations={locations} categories={categories} initialData={initialData} />;
}
