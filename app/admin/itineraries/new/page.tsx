import { prisma } from "@/lib/db";
import ItineraryEditor from "@/components/admin/ItineraryEditor";

export default async function NewItineraryPage() {
  const [locations, categories] = await Promise.all([
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <ItineraryEditor locations={locations} categories={categories} />
  );
}
