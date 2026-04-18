import { prisma } from "@/lib/db";
import AdminRequestsClient from "@/components/admin/AdminRequestsClient";

export default async function AdminRequestsPage() {
  const requests = await prisma.customRequest.findMany({ orderBy: { createdAt: "desc" } });
  return <AdminRequestsClient requests={requests} />;
}
