import { prisma } from "@/lib/db";
import AdminCategoriesClient from "@/components/admin/AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { itineraries: true } } },
    orderBy: { name: "asc" },
  });
  return <AdminCategoriesClient categories={categories} />;
}
