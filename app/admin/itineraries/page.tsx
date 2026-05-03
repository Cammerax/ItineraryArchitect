import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Eye, EyeOff, Globe2, Clock } from "lucide-react";
import DeleteItineraryButton from "@/components/admin/DeleteItineraryButton";
import PublishToggle from "@/components/admin/PublishToggle";

export default async function AdminItinerariesPage() {
  const itineraries = await prisma.itinerary.findMany({
    include: { location: true, category: true, _count: { select: { purchases: true, days: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Itineraries</h1>
          <p className="text-stone-500 text-sm">{itineraries.length} total</p>
        </div>
        <Link href="/admin/itineraries/new">
          <Button><Plus className="h-4 w-4" />New Itinerary</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {itineraries.map((it) => (
          <Card key={it.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-stone-900">{it.title}</h3>
                    {it.published ? (
                      <Badge variant="success"><Eye className="h-3 w-3 mr-1" />Published</Badge>
                    ) : (
                      <Badge variant="secondary"><EyeOff className="h-3 w-3 mr-1" />Draft</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                    <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" />{it.location.name}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{it.duration} days</span>
                    <span>{it._count.days} days planned</span>
                    <span>{it._count.purchases} purchase{it._count.purchases !== 1 ? "s" : ""}</span>
                    <Badge>{it.category.name}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-sage-700">{formatPrice(it.price)}</span>
                  <PublishToggle id={it.id} published={it.published} />
                  <Link href={`/admin/itineraries/${it.id}/edit`}>
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4" />Edit</Button>
                  </Link>
                  <DeleteItineraryButton id={it.id} title={it.title} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {itineraries.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <Globe2 className="h-12 w-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-stone-700 mb-4">No itineraries yet</h3>
            <Link href="/admin/itineraries/new">
              <Button><Plus className="h-4 w-4" />Create Your First Itinerary</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
