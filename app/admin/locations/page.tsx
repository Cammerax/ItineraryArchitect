import { prisma } from "@/lib/db";
import AdminLocationsClient from "@/components/admin/AdminLocationsClient";

export default async function AdminLocationsPage() {
  const locations = await prisma.location.findMany({
    include: { _count: { select: { itineraries: true } } },
    orderBy: [{ continent: "asc" }, { name: "asc" }],
  });

  return <AdminLocationsClient locations={locations} />;
}
