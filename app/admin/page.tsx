import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MapPin, Tag, MessageSquare, ShoppingBag, Plus, TrendingUp, Eye, EyeOff } from "lucide-react";

async function getStats() {
  const [totalItineraries, published, locations, categories, requests, orders] = await Promise.all([
    prisma.itinerary.count(),
    prisma.itinerary.count({ where: { published: true } }),
    prisma.location.count(),
    prisma.category.count(),
    prisma.customRequest.count({ where: { status: "pending" } }),
    prisma.purchase.count(),
  ]);
  const revenue = await prisma.purchase.aggregate({ _sum: { amount: true } });
  return { totalItineraries, published, locations, categories, requests, orders, revenue: revenue._sum.amount ?? 0 };
}

async function getRecentActivity() {
  const [recentOrders, recentRequests] = await Promise.all([
    prisma.purchase.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { itinerary: { include: { location: true } }, user: true },
    }),
    prisma.customRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { recentOrders, recentRequests };
}

export default async function AdminDashboard() {
  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()]);

  const STAT_CARDS = [
    { label: "Total Itineraries", value: stats.totalItineraries, icon: BookOpen, sub: `${stats.published} published`, color: "text-sage-600" },
    { label: "Locations", value: stats.locations, icon: MapPin, sub: "destinations", color: "text-blue-600" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, sub: `$${stats.revenue.toFixed(0)} revenue`, color: "text-green-600" },
    { label: "Pending Requests", value: stats.requests, icon: MessageSquare, sub: "awaiting review", color: "text-orange-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 text-sm">Welcome to The Itinerary Architect admin portal</p>
        </div>
        <Link href="/admin/itineraries/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Itinerary
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, sub, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-stone-500">{label}</p>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-3xl font-bold text-stone-900">{value}</p>
              <p className="text-xs text-stone-400 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/itineraries/new">
          <Card className="hover:shadow-md hover:border-sage-300 transition-all cursor-pointer group">
            <CardContent className="p-5">
              <Plus className="h-8 w-8 text-sage-600 mb-2" />
              <p className="font-semibold text-stone-800">Create Itinerary</p>
              <p className="text-xs text-stone-500">Add a new travel plan with full day-by-day schedule</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/locations">
          <Card className="hover:shadow-md hover:border-sage-300 transition-all cursor-pointer group">
            <CardContent className="p-5">
              <MapPin className="h-8 w-8 text-blue-500 mb-2" />
              <p className="font-semibold text-stone-800">Manage Locations</p>
              <p className="text-xs text-stone-500">Add destinations to the interactive map</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/requests">
          <Card className="hover:shadow-md hover:border-sage-300 transition-all cursor-pointer group">
            <CardContent className="p-5">
              <MessageSquare className="h-8 w-8 text-orange-500 mb-2" />
              <p className="font-semibold text-stone-800">Custom Requests</p>
              <p className="text-xs text-stone-500">{stats.requests} pending request{stats.requests !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-800">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs text-sage-600 hover:underline">View all</Link>
            </div>
            {activity.recentOrders.length === 0 ? (
              <p className="text-sm text-stone-400">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {activity.recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{o.itinerary.title}</p>
                      <p className="text-xs text-stone-400">{o.user.email}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">${o.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-800">Custom Requests</h3>
              <Link href="/admin/requests" className="text-xs text-sage-600 hover:underline">View all</Link>
            </div>
            {activity.recentRequests.length === 0 ? (
              <p className="text-sm text-stone-400">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {activity.recentRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{r.destination}</p>
                      <p className="text-xs text-stone-400">{r.name} · {r.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.status === "pending" ? "bg-orange-100 text-orange-700"
                      : r.status === "reviewing" ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
