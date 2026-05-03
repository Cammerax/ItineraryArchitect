import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatPrice, parseJson } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Globe2, Clock, User, ShoppingBag } from "lucide-react";

async function getUserPurchases(userId: string) {
  return prisma.purchase.findMany({
    where: { userId },
    include: {
      itinerary: { include: { location: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const purchases = await getUserPurchases(userId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
            <User className="h-5 w-5 text-sage-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">My Itineraries</h1>
            <p className="text-stone-500 text-sm">Welcome back, {session.user?.name || session.user?.email}</p>
          </div>
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <ShoppingBag className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">No purchases yet</h3>
          <p className="text-stone-500 text-sm mb-4">
            Browse our itineraries and purchase one to get started.
          </p>
          <Link href="/itineraries"><Button>Browse Itineraries</Button></Link>
        </div>
      ) : (
        <div>
          <p className="text-sm text-stone-500 mb-4">
            {purchases.length} itinerar{purchases.length === 1 ? "y" : "ies"} purchased
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {purchases.map((purchase) => {
              const it = purchase.itinerary;
              return (
                <Link key={purchase.id} href={`/itineraries/${it.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow h-full group cursor-pointer">
                    <div className="h-36 bg-gradient-to-br from-sage-100 to-stone-200 flex items-center justify-center relative rounded-t-xl">
                      <Globe2 className="h-10 w-10 text-sage-300" />
                      <div className="absolute top-2 left-2">
                        <Badge>{it.category.name}</Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="success">Purchased</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-sage-700 font-medium mb-1">{it.location.name}</p>
                      <h3 className="font-bold text-stone-900 mb-2 group-hover:text-sage-700 transition-colors text-sm">
                        {it.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {it.duration} days
                        </div>
                        <span className="text-stone-400">
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
